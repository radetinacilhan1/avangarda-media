/** Reserve a small rounding allowance so fractional font widths cannot wrap. */
export function desktopHeaderFits({ available, navigation, search, gap }: {
  available: number; navigation: number; search: number; gap: number;
}) {
  return [available, navigation, search, gap].every(Number.isFinite)
    && available > 0 && navigation > 0 && search > 0
    && navigation + search + gap + 2 <= available;
}
