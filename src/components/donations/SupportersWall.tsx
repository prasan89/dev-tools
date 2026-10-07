import { SUPPORTER_TIERS, type SupporterTierId } from '@/lib/donations';

interface SupporterEntry {
  tier: SupporterTierId;
  displayName: string;
}

interface SupportersWallProps {
  supporters: SupporterEntry[];
}

export function SupportersWall({ supporters }: SupportersWallProps) {
  const tierOrder: SupporterTierId[] = ['founding', 'platinum', 'gold', 'silver', 'bronze', 'supporter'];

  const grouped = tierOrder.reduce<Record<SupporterTierId, string[]>>(
    (acc, id) => ({ ...acc, [id]: [] }),
    {} as Record<SupporterTierId, string[]>
  );

  for (const s of supporters) {
    if (grouped[s.tier]) {
      grouped[s.tier].push(s.displayName);
    }
  }

  const hasAnySupporters = supporters.length > 0;

  return (
    <section aria-labelledby="supporters-wall-heading">
      <h2 id="supporters-wall-heading" className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
        🏆 ToolBook Supporters
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Developers who have helped keep ToolBook free and independent.
      </p>

      {!hasAnySupporters ? (
        <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-700 px-6 py-10 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Be one of the first ToolBook supporters. ❤️
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {tierOrder.map((tierId) => {
            const names = grouped[tierId];
            if (names.length === 0) return null;
            const tier = SUPPORTER_TIERS.find((t) => t.id === tierId)!;
            return (
              <div key={tierId}>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-1.5">
                  <span aria-hidden="true">{tier.emoji}</span>
                  {tier.label}s
                </h3>
                <div className="flex flex-wrap gap-2">
                  {names.map((name, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 rounded-full bg-gray-100 dark:bg-gray-800 px-3 py-1 text-sm text-gray-700 dark:text-gray-300"
                    >
                      <span aria-hidden="true">{tier.emoji}</span>
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
