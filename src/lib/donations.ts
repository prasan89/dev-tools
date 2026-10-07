export type SupporterTierId =
  | 'supporter'
  | 'bronze'
  | 'silver'
  | 'gold'
  | 'platinum'
  | 'founding';

export interface SupporterTier {
  id: SupporterTierId;
  label: string;
  emoji: string;
  minAmount: number;
  description: string;
}

export const SUPPORTER_TIERS: SupporterTier[] = [
  {
    id: 'founding',
    label: 'Founding Supporter',
    emoji: '🚀',
    minAmount: 10000,
    description: 'Support ToolBook at the beginning of its journey',
  },
  {
    id: 'platinum',
    label: 'Platinum Supporter',
    emoji: '💎',
    minAmount: 5000,
    description: 'Help accelerate ToolBook development',
  },
  {
    id: 'gold',
    label: 'Gold Supporter',
    emoji: '🥇',
    minAmount: 1000,
    description: 'Become a major ToolBook supporter',
  },
  {
    id: 'silver',
    label: 'Silver Supporter',
    emoji: '🥈',
    minAmount: 500,
    description: 'Help build more developer tools',
  },
  {
    id: 'bronze',
    label: 'Bronze Supporter',
    emoji: '⭐',
    minAmount: 250,
    description: 'Support continued development',
  },
  {
    id: 'supporter',
    label: 'Supporter',
    emoji: '❤️',
    minAmount: 50,
    description: 'Help keep ToolBook running',
  },
];

export const MIN_DONATION_AMOUNT = 50;
export const MAX_DONATION_AMOUNT = 500000;

export function calculateTier(amountINR: number): SupporterTier {
  for (const tier of SUPPORTER_TIERS) {
    if (amountINR >= tier.minAmount) return tier;
  }
  return SUPPORTER_TIERS[SUPPORTER_TIERS.length - 1];
}

export interface AmountValidationResult {
  valid: boolean;
  error?: string;
  amount?: number;
}

export function validateAmount(raw: unknown): AmountValidationResult {
  if (raw === null || raw === undefined || raw === '') {
    return { valid: false, error: 'Amount is required' };
  }
  const num = Number(raw);
  if (!Number.isFinite(num)) {
    return { valid: false, error: 'Amount must be a valid number' };
  }
  if (num <= 0) {
    return { valid: false, error: 'Amount must be greater than 0' };
  }
  if (!Number.isInteger(num)) {
    return { valid: false, error: 'Amount must be a whole number (INR does not support paise)' };
  }
  if (num < MIN_DONATION_AMOUNT) {
    return { valid: false, error: `Minimum donation is ₹${MIN_DONATION_AMOUNT}` };
  }
  if (num > MAX_DONATION_AMOUNT) {
    return { valid: false, error: `Maximum donation is ₹${MAX_DONATION_AMOUNT.toLocaleString('en-IN')}` };
  }
  return { valid: true, amount: num };
}

export interface DisplayNameResult {
  valid: boolean;
  name?: string;
  error?: string;
}

export function sanitizeDisplayName(raw: unknown): DisplayNameResult {
  if (raw === null || raw === undefined || raw === '') {
    return { valid: true, name: 'Anonymous Supporter' };
  }
  if (typeof raw !== 'string') {
    return { valid: false, error: 'Display name must be a string' };
  }
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return { valid: true, name: 'Anonymous Supporter' };
  }
  if (trimmed.length > 50) {
    return { valid: false, error: 'Display name must be 50 characters or fewer' };
  }
  // Reject obvious script injection patterns
  if (/<[^>]*>|javascript:|data:/i.test(trimmed)) {
    return { valid: false, error: 'Display name contains invalid characters' };
  }
  // Escape HTML entities for safe rendering
  const escaped = trimmed
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
  return { valid: true, name: escaped };
}

// In-memory store — supports idempotency per process lifetime.
// On Cloud Run with min-instances=1, this persists across requests on the same instance.
// For a production multi-instance scenario, replace with a database/KV store.

export interface DonationRecord {
  id: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  amountINR: number;
  currency: 'INR';
  tier: SupporterTierId;
  displayName: string;
  showOnWall: boolean;
  status: 'pending' | 'verified' | 'failed';
  createdAt: string;
  verifiedAt?: string;
}

// Keyed by razorpayOrderId for idempotency
const donationStore = new Map<string, DonationRecord>();
// Secondary index by razorpayPaymentId to prevent duplicate verification
const paymentIndex = new Map<string, string>();

export function createPendingDonation(record: DonationRecord): void {
  donationStore.set(record.razorpayOrderId, record);
}

export function getDonationByOrderId(orderId: string): DonationRecord | undefined {
  return donationStore.get(orderId);
}

export function getDonationByPaymentId(paymentId: string): DonationRecord | undefined {
  const orderId = paymentIndex.get(paymentId);
  if (!orderId) return undefined;
  return donationStore.get(orderId);
}

export function markDonationVerified(
  orderId: string,
  paymentId: string,
  verifiedAt: string
): DonationRecord | undefined {
  const record = donationStore.get(orderId);
  if (!record) return undefined;
  const updated: DonationRecord = { ...record, razorpayPaymentId: paymentId, status: 'verified', verifiedAt };
  donationStore.set(orderId, updated);
  paymentIndex.set(paymentId, orderId);
  return updated;
}

export function getWallSupporters(): { tier: SupporterTierId; displayName: string }[] {
  const results: { tier: SupporterTierId; displayName: string }[] = [];
  for (const record of donationStore.values()) {
    if (record.status === 'verified' && record.showOnWall) {
      results.push({ tier: record.tier, displayName: record.displayName });
    }
  }
  // Sort by tier minAmount descending (highest tier first)
  const tierOrder: Record<SupporterTierId, number> = {
    founding: 0,
    platinum: 1,
    gold: 2,
    silver: 3,
    bronze: 4,
    supporter: 5,
  };
  return results.sort((a, b) => tierOrder[a.tier] - tierOrder[b.tier]);
}
