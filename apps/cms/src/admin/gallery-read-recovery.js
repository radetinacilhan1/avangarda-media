"use strict";

const TRANSIENT_READ_STATUSES = new Set([429, 502, 503]);

function createDebouncedGallerySearch({ onCommit, onCancel, delay = 350, setTimer = setTimeout, clearTimer = clearTimeout }) {
  let timer = null;
  const cancel = () => { if (timer !== null) clearTimer(timer); timer = null; };
  return {
    hasPending: () => timer !== null,
    schedule(value) {
      cancel();
      onCancel();
      timer = setTimer(() => { timer = null; onCommit(value); }, delay);
    },
    flush(value) { cancel(); onCancel(); onCommit(value); },
    cancel,
  };
}

function abortError() {
  const error = new Error("Gallery read was cancelled.");
  error.name = "AbortError";
  return error;
}

function isReadAbort(error, signal) {
  return Boolean(signal?.aborted || error?.name === "AbortError" || error?.code === "ERR_CANCELED");
}

function abortableDelay(milliseconds, signal) {
  if (signal?.aborted) return Promise.reject(abortError());
  return new Promise((resolve, reject) => {
    const finish = () => { signal?.removeEventListener("abort", cancel); resolve(); };
    const timer = setTimeout(finish, Math.max(0, milliseconds));
    const cancel = () => { clearTimeout(timer); signal?.removeEventListener("abort", cancel); reject(abortError()); };
    signal?.addEventListener("abort", cancel, { once: true });
  });
}

function retryAfterDeadline(headers, now = Date.now()) {
  const header = typeof headers?.get === "function" ? headers.get("retry-after") : headers?.["retry-after"] ?? headers?.["Retry-After"];
  if (header === undefined || header === null || String(header).trim() === "") return null;
  const value = String(header).trim();
  if (/^\d+(?:\.\d+)?$/.test(value)) return now + Math.ceil(Number(value) * 1000);
  const deadline = Date.parse(value);
  return Number.isFinite(deadline) ? Math.max(now, deadline) : null;
}

function readFailure(cause, status, attempts, retryAt = 0) {
  const error = new Error("Media Library read did not complete.");
  error.name = "GalleryReadError";
  error.status = status;
  error.response = cause?.response;
  error.cause = cause;
  error.attempts = attempts;
  error.retryAt = retryAt;
  return error;
}

function createGalleryReadRecovery({ now = Date.now, wait = abortableDelay, maxAttempts = 3, maximumAutomaticWait = 15000 } = {}) {
  // Shared by all picker instances using this recovery object. Changing a
  // search, page or row must never bypass an outstanding Retry-After deadline.
  const cooldowns = new Map();
  const attemptLimit = Math.max(1, Math.min(3, maxAttempts));

  async function read(endpoint, performRead, { signal, onWait, onCooldown, onAttempt } = {}) {
    let attempts = 0;
    while (attempts < attemptLimit) {
      if (signal?.aborted) throw abortError();
      const cooldown = cooldowns.get(endpoint);
      const remaining = Math.max(0, (cooldown?.retryAt || 0) - now());
      if (remaining > 0) {
        const state = { retryAt: cooldown.retryAt, status: cooldown.status, attempts };
        onWait?.(state);
        if (onCooldown !== onWait) onCooldown?.(state);
        if (remaining > maximumAutomaticWait) throw readFailure(cooldown.cause, cooldown.status, attempts, cooldown.retryAt);
        await wait(remaining, signal);
        if (signal?.aborted) throw abortError();
        if ((cooldowns.get(endpoint)?.retryAt || 0) > now()) continue;
      }
      attempts += 1;
      onAttempt?.({ attempts, endpoint, method: "GET" });
      try {
        const response = await performRead({ signal });
        if (signal?.aborted) throw abortError();
        if ((cooldowns.get(endpoint)?.retryAt || 0) <= now()) cooldowns.delete(endpoint);
        return response;
      } catch (error) {
        const status = Number(error?.response?.status || error?.status) || null;
        if (isReadAbort(error, signal)) {
          // Preserve a received 429 deadline even if the user typed a new query
          // before that failed request's rejection reached this handler.
          const retryAt = status === 429 ? retryAfterDeadline(error?.response?.headers, now()) : null;
          if (retryAt !== null && retryAt > now()) cooldowns.set(endpoint, { retryAt: Math.max(retryAt, cooldowns.get(endpoint)?.retryAt || 0), status, cause: error });
          throw abortError();
        }
        if (!TRANSIENT_READ_STATUSES.has(status)) throw readFailure(error, status, attempts);
        const current = now();
        const headerDeadline = retryAfterDeadline(error?.response?.headers, current);
        const retryAt = Math.max(headerDeadline ?? current + 1000 * 2 ** (attempts - 1), cooldowns.get(endpoint)?.retryAt || 0);
        cooldowns.set(endpoint, { retryAt, status, cause: error });
        if (attempts >= attemptLimit || retryAt - current > maximumAutomaticWait) throw readFailure(error, status, attempts, retryAt);
      }
    }
    throw new Error("Gallery read attempts exhausted.");
  }

  return { read, cooldownUntil: (endpoint) => cooldowns.get(endpoint)?.retryAt || 0 };
}

const galleryReadRecovery = createGalleryReadRecovery();
const readWithRecovery = (endpoint, performRead, options) => galleryReadRecovery.read(endpoint, performRead, options);

module.exports = { abortableDelay, createDebouncedGallerySearch, createGalleryReadRecovery, galleryReadRecovery, isReadAbort, readWithRecovery, retryAfterDeadline };
