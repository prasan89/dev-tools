export const ADSENSE_PUBLISHER_ID = 'ca-pub-PLACEHOLDER';

export interface AdSlotConfig {
  slotId: string;
  format: 'auto' | 'rectangle' | 'leaderboard' | 'skyscraper';
  fullWidthResponsive: boolean;
}

export const AD_SLOTS: Record<string, AdSlotConfig> = {
  pdfToolsBanner: {
    slotId: 'PLACEHOLDER_BANNER',
    format: 'leaderboard',
    fullWidthResponsive: true,
  },
  pdfToolsSidebar: {
    slotId: 'PLACEHOLDER_SIDEBAR',
    format: 'rectangle',
    fullWidthResponsive: false,
  },
  pdfToolsInContent: {
    slotId: 'PLACEHOLDER_INCONTENT',
    format: 'auto',
    fullWidthResponsive: true,
  },
};

export function getAdSlot(name: keyof typeof AD_SLOTS): AdSlotConfig | undefined {
  return AD_SLOTS[name];
}

export function isAdSenseConfigured(): boolean {
  return ADSENSE_PUBLISHER_ID !== 'ca-pub-PLACEHOLDER';
}
