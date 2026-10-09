// A reading anchor just below the viewport midpoint follows only this timeline.
export function getPortfolioTimelineProgress(top: number, height: number, viewportHeight: number): number {
  if (!Number.isFinite(top) || !Number.isFinite(height) || !Number.isFinite(viewportHeight) || height <= 0) return 0;
  return Math.min(1, Math.max(0, (viewportHeight * 0.55 - top) / height));
}
