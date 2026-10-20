/** Keep the decision independent of the active layout. A small re-entry band
 * absorbs fractional font/ResizeObserver measurements near the boundary. */
export function desktopHeaderFits({ available, navigation, search, gap, wasCompact = false }: {
  available: number; navigation: number; search: number; gap: number; wasCompact?: boolean;
}) {
  return [available, navigation, search, gap].every(Number.isFinite)
    && available > 0 && navigation > 0 && search > 0
    && gap >= 0
    && navigation + search + gap + (wasCompact ? 6 : 2) <= available;
}
