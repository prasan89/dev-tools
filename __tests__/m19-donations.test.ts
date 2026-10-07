import {
  calculateTier,
  validateAmount,
  sanitizeDisplayName,
  createPendingDonation,
  getDonationByOrderId,
  getDonationByPaymentId,
  markDonationVerified,
  getWallSupporters,
  SUPPORTER_TIERS,
  MIN_DONATION_AMOUNT,
  MAX_DONATION_AMOUNT,
  type DonationRecord,
} from '../src/lib/donations';

// ─────────────────────────────────────────────
// calculateTier
// ─────────────────────────────────────────────

describe('calculateTier', () => {
  const cases: [number, string][] = [
    [50, 'supporter'],
    [99, 'supporter'],
    [249, 'supporter'],
    [250, 'bronze'],
    [499, 'bronze'],
    [500, 'silver'],
    [999, 'silver'],
    [1000, 'gold'],
    [4999, 'gold'],
    [5000, 'platinum'],
    [9999, 'platinum'],
    [10000, 'founding'],
    [99999, 'founding'],
  ];

  test.each(cases)('₹%i → %s', (amount, expectedId) => {
    expect(calculateTier(amount).id).toBe(expectedId);
  });

  it('returns the correct emoji for each tier', () => {
    expect(calculateTier(50).emoji).toBe('❤️');
    expect(calculateTier(250).emoji).toBe('⭐');
    expect(calculateTier(500).emoji).toBe('🥈');
    expect(calculateTier(1000).emoji).toBe('🥇');
    expect(calculateTier(5000).emoji).toBe('💎');
    expect(calculateTier(10000).emoji).toBe('🚀');
  });
});

// ─────────────────────────────────────────────
// validateAmount
// ─────────────────────────────────────────────

describe('validateAmount', () => {
  it('accepts minimum amount', () => {
    expect(validateAmount(MIN_DONATION_AMOUNT)).toEqual({ valid: true, amount: MIN_DONATION_AMOUNT });
  });

  it('accepts maximum amount', () => {
    expect(validateAmount(MAX_DONATION_AMOUNT)).toEqual({ valid: true, amount: MAX_DONATION_AMOUNT });
  });

  it('accepts typical amounts', () => {
    for (const amt of [50, 100, 250, 500, 1000, 5000, 10000]) {
      expect(validateAmount(amt).valid).toBe(true);
    }
  });

  it('rejects null', () => {
    expect(validateAmount(null).valid).toBe(false);
  });

  it('rejects undefined', () => {
    expect(validateAmount(undefined).valid).toBe(false);
  });

  it('rejects empty string', () => {
    expect(validateAmount('').valid).toBe(false);
  });

  it('rejects negative values', () => {
    expect(validateAmount(-100).valid).toBe(false);
  });

  it('rejects zero', () => {
    expect(validateAmount(0).valid).toBe(false);
  });

  it('rejects below minimum', () => {
    expect(validateAmount(49).valid).toBe(false);
    expect(validateAmount(1).valid).toBe(false);
  });

  it('rejects above maximum', () => {
    expect(validateAmount(MAX_DONATION_AMOUNT + 1).valid).toBe(false);
  });

  it('rejects decimal amounts', () => {
    expect(validateAmount(100.5).valid).toBe(false);
  });

  it('rejects NaN', () => {
    expect(validateAmount(NaN).valid).toBe(false);
  });

  it('rejects Infinity', () => {
    expect(validateAmount(Infinity).valid).toBe(false);
  });

  it('rejects non-numeric string', () => {
    expect(validateAmount('abc').valid).toBe(false);
  });

  it('returns error messages', () => {
    expect(validateAmount(-1).error).toBeTruthy();
    expect(validateAmount(10).error).toMatch(/minimum/i);
  });
});

// ─────────────────────────────────────────────
// sanitizeDisplayName
// ─────────────────────────────────────────────

describe('sanitizeDisplayName', () => {
  it('returns Anonymous Supporter for null', () => {
    expect(sanitizeDisplayName(null)).toEqual({ valid: true, name: 'Anonymous Supporter' });
  });

  it('returns Anonymous Supporter for undefined', () => {
    expect(sanitizeDisplayName(undefined)).toEqual({ valid: true, name: 'Anonymous Supporter' });
  });

  it('returns Anonymous Supporter for empty string', () => {
    expect(sanitizeDisplayName('')).toEqual({ valid: true, name: 'Anonymous Supporter' });
  });

  it('returns Anonymous Supporter for whitespace-only string', () => {
    expect(sanitizeDisplayName('   ')).toEqual({ valid: true, name: 'Anonymous Supporter' });
  });

  it('trims whitespace', () => {
    const result = sanitizeDisplayName('  Alex  ');
    expect(result.valid).toBe(true);
    expect(result.name).toBe('Alex');
  });

  it('accepts normal names', () => {
    expect(sanitizeDisplayName('Rahul').valid).toBe(true);
    expect(sanitizeDisplayName('Priya S').valid).toBe(true);
  });

  it('escapes HTML entities', () => {
    const result = sanitizeDisplayName('<script>alert(1)</script>');
    expect(result.valid).toBe(false);
  });

  it('rejects names with HTML tags', () => {
    expect(sanitizeDisplayName('<b>Bold</b>').valid).toBe(false);
  });

  it('rejects javascript: protocol', () => {
    expect(sanitizeDisplayName('javascript:alert(1)').valid).toBe(false);
  });

  it('rejects data: URIs', () => {
    expect(sanitizeDisplayName('data:text/html,<h1>x</h1>').valid).toBe(false);
  });

  it('rejects names longer than 50 chars', () => {
    const longName = 'A'.repeat(51);
    expect(sanitizeDisplayName(longName).valid).toBe(false);
  });

  it('accepts exactly 50 chars', () => {
    const name = 'A'.repeat(50);
    expect(sanitizeDisplayName(name).valid).toBe(true);
  });

  it('rejects non-string types', () => {
    expect(sanitizeDisplayName(123).valid).toBe(false);
  });

  it('escapes ampersands', () => {
    const result = sanitizeDisplayName('Tom & Jerry');
    expect(result.valid).toBe(true);
    expect(result.name).toContain('&amp;');
  });

  it('escapes double quotes', () => {
    const result = sanitizeDisplayName('Name "Quoted"');
    expect(result.valid).toBe(true);
    expect(result.name).toContain('&quot;');
  });
});

// ─────────────────────────────────────────────
// Donation store — idempotency
// ─────────────────────────────────────────────

describe('donation store idempotency', () => {
  const makeRecord = (orderId: string): DonationRecord => ({
    id: orderId,
    razorpayOrderId: orderId,
    amountINR: 500,
    currency: 'INR',
    tier: 'silver',
    displayName: 'Test User',
    showOnWall: false,
    status: 'pending',
    createdAt: new Date().toISOString(),
  });

  it('creates and retrieves a pending donation by orderId', () => {
    const record = makeRecord('order_idempotency_1');
    createPendingDonation(record);
    expect(getDonationByOrderId('order_idempotency_1')).toEqual(record);
  });

  it('returns undefined for unknown orderId', () => {
    expect(getDonationByOrderId('order_nonexistent_abc')).toBeUndefined();
  });

  it('marks donation verified', () => {
    const record = makeRecord('order_verify_1');
    createPendingDonation(record);
    const verified = markDonationVerified('order_verify_1', 'pay_abc123', new Date().toISOString());
    expect(verified?.status).toBe('verified');
    expect(verified?.razorpayPaymentId).toBe('pay_abc123');
  });

  it('is idempotent — second verify returns same record', () => {
    const record = makeRecord('order_idempotent_2');
    createPendingDonation(record);
    const v1 = markDonationVerified('order_idempotent_2', 'pay_idempotent_2', new Date().toISOString());
    const v2 = markDonationVerified('order_idempotent_2', 'pay_idempotent_2', new Date().toISOString());
    expect(v1?.razorpayPaymentId).toBe(v2?.razorpayPaymentId);
  });

  it('can retrieve a donation by paymentId after verification', () => {
    const record = makeRecord('order_bypay_1');
    createPendingDonation(record);
    markDonationVerified('order_bypay_1', 'pay_bypay_1', new Date().toISOString());
    expect(getDonationByPaymentId('pay_bypay_1')).toBeDefined();
    expect(getDonationByPaymentId('pay_bypay_1')?.status).toBe('verified');
  });

  it('returns undefined for unknown paymentId', () => {
    expect(getDonationByPaymentId('pay_nonexistent_xyz')).toBeUndefined();
  });

  it('includes verified public wall donations in getWallSupporters', () => {
    const record: DonationRecord = {
      ...makeRecord('order_wall_1'),
      showOnWall: true,
      displayName: 'Wall Person',
      tier: 'gold',
    };
    createPendingDonation(record);
    markDonationVerified('order_wall_1', 'pay_wall_1', new Date().toISOString());
    const supporters = getWallSupporters();
    expect(supporters.some((s) => s.displayName === 'Wall Person')).toBe(true);
  });

  it('excludes private donations from wall', () => {
    const record: DonationRecord = {
      ...makeRecord('order_private_1'),
      showOnWall: false,
      displayName: 'Private Person',
    };
    createPendingDonation(record);
    markDonationVerified('order_private_1', 'pay_private_1', new Date().toISOString());
    const supporters = getWallSupporters();
    expect(supporters.some((s) => s.displayName === 'Private Person')).toBe(false);
  });

  it('excludes pending (unverified) donations from wall', () => {
    const record: DonationRecord = {
      ...makeRecord('order_pending_wall'),
      showOnWall: true,
      displayName: 'Pending Person',
    };
    createPendingDonation(record);
    // Do NOT verify
    const supporters = getWallSupporters();
    expect(supporters.some((s) => s.displayName === 'Pending Person')).toBe(false);
  });
});

// ─────────────────────────────────────────────
// SUPPORTER_TIERS completeness
// ─────────────────────────────────────────────

describe('SUPPORTER_TIERS', () => {
  it('has exactly 6 tiers', () => {
    expect(SUPPORTER_TIERS.length).toBe(6);
  });

  it('each tier has required fields', () => {
    for (const tier of SUPPORTER_TIERS) {
      expect(tier.id).toBeTruthy();
      expect(tier.label).toBeTruthy();
      expect(tier.emoji).toBeTruthy();
      expect(typeof tier.minAmount).toBe('number');
      expect(tier.minAmount).toBeGreaterThan(0);
      expect(tier.description).toBeTruthy();
    }
  });

  it('minimum amounts are in descending order', () => {
    for (let i = 0; i < SUPPORTER_TIERS.length - 1; i++) {
      expect(SUPPORTER_TIERS[i].minAmount).toBeGreaterThan(SUPPORTER_TIERS[i + 1].minAmount);
    }
  });
});
