export const COUNTER_SESSION_PREFIX = "avangarda:impact-counter:v1:";
export const COUNTER_DURATION = 1250;

export function counterFrame(target: number, elapsed: number) {
  const progress = Math.min(1, Math.max(0, elapsed / COUNTER_DURATION));
  return Math.round(target * (1 - Math.pow(1 - progress, 3)));
}

/** Storage denied: stay static, so a refresh cannot unexpectedly replay motion. */
export function canAnimateCounter(storage: Pick<Storage, "getItem" | "setItem">, id: string) {
  try {
    const key = COUNTER_SESSION_PREFIX + id;
    if (storage.getItem(key) === "seen") return false;
    storage.setItem(key, "pending");
    return true;
  } catch { return false; }
}

export function markCounterSeen(storage: Pick<Storage, "setItem">, id: string) {
  try { storage.setItem(COUNTER_SESSION_PREFIX + id, "seen"); } catch { /* Static on the next mount if storage is denied. */ }
}
