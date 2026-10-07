// AdSense ad slot placeholder.
//
// When NEXT_PUBLIC_ADSENSE_CLIENT is set, renders an adsense slot.
// When unset, renders nothing (development / pre-approval mode).
//
// Dimensions are fixed to prevent CLS. The outer container always reserves
// the space so layout does not shift when the ad loads.

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

type AdSlotSize = 'leaderboard' | 'rectangle' | 'banner';

interface AdSlotProps {
  slot: string;
  size?: AdSlotSize;
  className?: string;
}

const SIZE_CLASSES: Record<AdSlotSize, string> = {
  leaderboard: 'h-[90px] w-full max-w-[728px]',   // 728×90
  rectangle:   'h-[250px] w-full max-w-[336px]',   // 336×280
  banner:      'h-[60px] w-full max-w-[468px]',    // 468×60
};

export function AdSlot({ slot, size = 'leaderboard', className = '' }: AdSlotProps) {
  if (!ADSENSE_CLIENT) return null;

  return (
    <div
      className={`flex justify-center ${className}`}
      aria-hidden="true"
    >
      <div className={`${SIZE_CLASSES[size]} overflow-hidden`}>
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={ADSENSE_CLIENT}
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
}
