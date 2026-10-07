import { SUPPORTER_TIERS } from '@/lib/donations';

export function TierList() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {[...SUPPORTER_TIERS].reverse().map((tier) => (
        <div
          key={tier.id}
          className="flex items-start gap-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3"
        >
          <span className="text-2xl" aria-hidden="true">{tier.emoji}</span>
          <div>
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {tier.label}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              ₹{tier.minAmount.toLocaleString('en-IN')}+
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {tier.description}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
