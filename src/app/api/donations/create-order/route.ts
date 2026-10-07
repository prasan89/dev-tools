import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import {
  validateAmount,
  sanitizeDisplayName,
  calculateTier,
  createPendingDonation,
  getDonationByOrderId,
  type DonationRecord,
} from '@/lib/donations';

function getRazorpay(): Razorpay {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error('Razorpay credentials not configured');
  }
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const data = body as Record<string, unknown>;

  // Validate amount
  const amountResult = validateAmount(data.amount);
  if (!amountResult.valid || amountResult.amount === undefined) {
    return NextResponse.json({ error: amountResult.error }, { status: 400 });
  }
  const amountINR = amountResult.amount;

  // Validate/sanitize display name
  const nameResult = sanitizeDisplayName(data.displayName);
  if (!nameResult.valid || nameResult.name === undefined) {
    return NextResponse.json({ error: nameResult.error }, { status: 400 });
  }
  const displayName = nameResult.name;

  const showOnWall = data.showOnWall === true;
  const tier = calculateTier(amountINR);

  let razorpay: Razorpay;
  try {
    razorpay = getRazorpay();
  } catch {
    return NextResponse.json(
      { error: 'Payment service temporarily unavailable' },
      { status: 503 }
    );
  }

interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt?: string;
  status: string;
}

let order: RazorpayOrder;
  try {
    // Razorpay amount is in paise (smallest unit). For INR: 1 INR = 100 paise.
    order = (await razorpay.orders.create({
      amount: amountINR * 100,
      currency: 'INR',
      receipt: `toolbook_${Date.now()}`,
      notes: {
        tier: tier.id,
        showOnWall: String(showOnWall),
      },
    })) as unknown as RazorpayOrder;
  } catch {
    return NextResponse.json(
      { error: 'Failed to create payment order' },
      { status: 502 }
    );
  }

  // Check idempotency — if this order already exists, return existing record
  const existing = getDonationByOrderId(order.id);
  if (!existing) {
    const record: DonationRecord = {
      id: order.id,
      razorpayOrderId: order.id,
      amountINR,
      currency: 'INR',
      tier: tier.id,
      displayName,
      showOnWall,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    createPendingDonation(record);
  }

  return NextResponse.json({
    orderId: order.id,
    amount: amountINR,
    currency: 'INR',
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
    tier: {
      id: tier.id,
      label: tier.label,
      emoji: tier.emoji,
    },
  });
}
