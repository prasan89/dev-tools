import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import {
  getDonationByOrderId,
  getDonationByPaymentId,
  markDonationVerified,
} from '@/lib/donations';

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const data = body as Record<string, unknown>;
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = data;

  if (!razorpayOrderId || typeof razorpayOrderId !== 'string') {
    return NextResponse.json({ error: 'razorpayOrderId is required' }, { status: 400 });
  }
  if (!razorpayPaymentId || typeof razorpayPaymentId !== 'string') {
    return NextResponse.json({ error: 'razorpayPaymentId is required' }, { status: 400 });
  }
  if (!razorpaySignature || typeof razorpaySignature !== 'string') {
    return NextResponse.json({ error: 'razorpaySignature is required' }, { status: 400 });
  }

  // Idempotency: if this payment was already verified, return the existing record
  const existingByPayment = getDonationByPaymentId(razorpayPaymentId);
  if (existingByPayment && existingByPayment.status === 'verified') {
    return NextResponse.json({
      success: true,
      tier: existingByPayment.tier,
      displayName: existingByPayment.showOnWall ? existingByPayment.displayName : undefined,
      showOnWall: existingByPayment.showOnWall,
    });
  }

  // Ensure we have a pending order for this orderId
  const donation = getDonationByOrderId(razorpayOrderId);
  if (!donation) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }
  if (donation.status === 'verified') {
    return NextResponse.json({
      success: true,
      tier: donation.tier,
      displayName: donation.showOnWall ? donation.displayName : undefined,
      showOnWall: donation.showOnWall,
    });
  }

  // Verify Razorpay signature
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    return NextResponse.json(
      { error: 'Payment service temporarily unavailable' },
      { status: 503 }
    );
  }

  const expectedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  if (expectedSignature !== razorpaySignature) {
    return NextResponse.json({ error: 'Payment signature verification failed' }, { status: 400 });
  }

  // Mark donation as verified
  const verified = markDonationVerified(
    razorpayOrderId,
    razorpayPaymentId,
    new Date().toISOString()
  );

  if (!verified) {
    return NextResponse.json({ error: 'Failed to record donation' }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    tier: verified.tier,
    displayName: verified.showOnWall ? verified.displayName : undefined,
    showOnWall: verified.showOnWall,
  });
}
