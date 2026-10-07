'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { SUPPORTER_TIERS, MIN_DONATION_AMOUNT, validateAmount } from '@/lib/donations';

const QUICK_AMOUNTS = [50, 100, 250, 500, 1000, 5000, 10000];
const DEFAULT_AMOUNT = 100;

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: Record<string, string>;
  notes?: Record<string, string>;
  theme?: { color: string };
  modal?: { ondismiss?: () => void };
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open(): void;
  on(event: string, callback: () => void): void;
}

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay'));
    document.head.appendChild(script);
  });
}

function getTierForAmount(amount: number) {
  for (const tier of SUPPORTER_TIERS) {
    if (amount >= tier.minAmount) return tier;
  }
  return SUPPORTER_TIERS[SUPPORTER_TIERS.length - 1];
}

export function DonationForm() {
  const router = useRouter();
  const [selectedAmount, setSelectedAmount] = useState<number>(DEFAULT_AMOUNT);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isCustom, setIsCustom] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [showOnWall, setShowOnWall] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const activeAmount = isCustom ? Number(customAmount) || 0 : selectedAmount;
  const currentTier = activeAmount >= MIN_DONATION_AMOUNT ? getTierForAmount(activeAmount) : null;

  const handleQuickSelect = useCallback((amount: number) => {
    setSelectedAmount(amount);
    setIsCustom(false);
    setCustomAmount('');
    setError('');
  }, []);

  const handleCustomFocus = useCallback(() => {
    setIsCustom(true);
    setError('');
  }, []);

  const handleDonate = useCallback(async () => {
    setError('');
    const amountToUse = isCustom ? Number(customAmount) : selectedAmount;
    const validation = validateAmount(amountToUse);
    if (!validation.valid) {
      setError(validation.error || 'Invalid amount');
      return;
    }

    setIsLoading(true);
    try {
      // Load Razorpay SDK lazily — only here, not on page load
      await loadRazorpayScript();

      const res = await fetch('/api/donations/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: validation.amount,
          displayName: displayName.trim() || null,
          showOnWall,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Failed to create order' }));
        setError(err.error || 'Failed to create payment order');
        setIsLoading(false);
        return;
      }

      const order = await res.json();

      const options: RazorpayOptions = {
        key: order.keyId,
        amount: order.amount * 100,
        currency: 'INR',
        name: 'ToolBook',
        description: `${order.tier.emoji} ${order.tier.label} — Support ToolBook`,
        order_id: order.orderId,
        handler: async (response: RazorpayResponse) => {
          try {
            const verifyRes = await fetch('/api/donations/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });

            if (verifyRes.ok) {
              const result = await verifyRes.json();
              const params = new URLSearchParams({
                tier: result.tier,
                wall: result.showOnWall ? '1' : '0',
              });
              if (result.showOnWall && result.displayName) {
                params.set('name', result.displayName);
              }
              router.push(`/donate/success?${params.toString()}`);
            } else {
              router.push('/donate/cancelled?reason=verification');
            }
          } catch {
            router.push('/donate/cancelled?reason=error');
          }
        },
        prefill: displayName ? { name: displayName } : {},
        theme: { color: '#2563EB' },
        modal: {
          ondismiss: () => {
            setIsLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setIsLoading(false);
    }
  }, [isCustom, customAmount, selectedAmount, displayName, showOnWall, router]);

  return (
    <div className="space-y-6">
      {/* Amount selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Select amount
        </label>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
          {QUICK_AMOUNTS.map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => handleQuickSelect(amt)}
              className={[
                'rounded-lg border px-2 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500',
                !isCustom && selectedAmount === amt
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:border-blue-400 hover:text-blue-600',
              ].join(' ')}
              aria-pressed={!isCustom && selectedAmount === amt}
            >
              ₹{amt >= 1000 ? `${amt / 1000}k` : amt}
            </button>
          ))}
        </div>
      </div>

      {/* Custom amount */}
      <div>
        <label htmlFor="custom-amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Or enter a custom amount (₹)
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 text-sm pointer-events-none" aria-hidden="true">₹</span>
          <input
            id="custom-amount"
            type="number"
            min={MIN_DONATION_AMOUNT}
            step={1}
            value={customAmount}
            onFocus={handleCustomFocus}
            onChange={(e) => {
              setCustomAmount(e.target.value);
              setIsCustom(true);
              setError('');
            }}
            placeholder={`Min ₹${MIN_DONATION_AMOUNT}`}
            className={[
              'w-full rounded-lg border pl-8 pr-4 py-2.5 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors',
              isCustom ? 'border-blue-500' : 'border-gray-200 dark:border-gray-700',
            ].join(' ')}
            aria-describedby={error ? 'amount-error' : undefined}
          />
        </div>
      </div>

      {/* Tier indicator */}
      {currentTier && (
        <div className="flex items-center gap-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 px-4 py-3">
          <span className="text-lg" aria-hidden="true">{currentTier.emoji}</span>
          <div>
            <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">{currentTier.label}</span>
            <span className="ml-2 text-xs text-blue-500 dark:text-blue-400">{currentTier.description}</span>
          </div>
        </div>
      )}

      {/* Display name */}
      <div>
        <label htmlFor="display-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Your name <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <input
          id="display-name"
          type="text"
          maxLength={50}
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="How should we call you?"
          className="w-full rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2.5 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        />
      </div>

      {/* Wall opt-in */}
      <label className="flex items-start gap-3 cursor-pointer group">
        <input
          type="checkbox"
          checked={showOnWall}
          onChange={(e) => setShowOnWall(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          aria-describedby="wall-description"
        />
        <div id="wall-description">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100">
            Show my name on the ToolBook Supporters Wall
          </span>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Only your display name — no amounts shown publicly.
          </p>
        </div>
      </label>

      {/* Error message */}
      {error && (
        <p id="amount-error" role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {/* Donate button */}
      <button
        type="button"
        onClick={handleDonate}
        disabled={isLoading || activeAmount < MIN_DONATION_AMOUNT}
        className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-6 text-base transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
        aria-busy={isLoading}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Loading payment…
          </span>
        ) : (
          `❤️ Donate ₹${activeAmount >= 1000 ? activeAmount.toLocaleString('en-IN') : activeAmount}`
        )}
      </button>

      <p className="text-center text-xs text-gray-400 dark:text-gray-500">
        Secure payments powered by Razorpay · UPI / Cards
      </p>
    </div>
  );
}
