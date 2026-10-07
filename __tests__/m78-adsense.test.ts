import { AD_SLOTS, getAdSlot, isAdSenseConfigured, ADSENSE_PUBLISHER_ID } from '../src/lib/adsense';

describe('AdSense config', () => {
  it('has publisher ID defined', () => {
    expect(ADSENSE_PUBLISHER_ID).toBeTruthy();
  });
  it('AD_SLOTS has pdfToolsBanner', () => {
    expect(AD_SLOTS.pdfToolsBanner).toBeDefined();
    expect(AD_SLOTS.pdfToolsBanner.format).toBe('leaderboard');
  });
  it('AD_SLOTS has pdfToolsSidebar', () => {
    expect(AD_SLOTS.pdfToolsSidebar).toBeDefined();
    expect(AD_SLOTS.pdfToolsSidebar.format).toBe('rectangle');
  });
  it('getAdSlot returns config for known slot', () => {
    const slot = getAdSlot('pdfToolsBanner');
    expect(slot).toBeDefined();
    expect(slot?.slotId).toBeTruthy();
  });
  it('getAdSlot returns undefined for unknown slot', () => {
    expect(getAdSlot('nonexistent' as never)).toBeUndefined();
  });
  it('isAdSenseConfigured returns false for placeholder', () => {
    expect(isAdSenseConfigured()).toBe(false);
  });
});
