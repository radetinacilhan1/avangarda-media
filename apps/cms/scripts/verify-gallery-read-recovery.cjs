"use strict";
const assert = require("node:assert/strict");
const { abortableDelay, createDebouncedGallerySearch, createGalleryReadRecovery, isReadAbort, retryAfterDeadline } = require("../src/admin/gallery-read-recovery");

function fakeClock(initial = 0) {
  let current = initial, nextId = 1;
  const timers = new Map();
  return {
    now: () => current,
    set: (value) => { current = value; },
    setTimer(callback, delay) { const id = nextId++; timers.set(id, { at: current + delay, callback }); return id; },
    clearTimer(id) { timers.delete(id); },
    advance(milliseconds) {
      const end = current + milliseconds;
      while (true) {
        const pending = [...timers.entries()].filter(([, item]) => item.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
        if (!pending) break;
        current = pending[1].at; timers.delete(pending[0]); pending[1].callback();
      }
      current = end;
    },
  };
}
function failure(status, retryAfter) { return Object.assign(new Error(`HTTP ${status}`), { response: { status, headers: retryAfter === undefined ? {} : { "retry-after": retryAfter } } }); }

(async () => {
  let checks = 0;
  const clock = fakeClock();
  const commits = [];
  const firstRead = new AbortController();
  const debounce = createDebouncedGallerySearch({
    onCancel: () => firstRead.abort(), onCommit: value => commits.push(value),
    setTimer: clock.setTimer, clearTimer: clock.clearTimer,
  });
  for (const query of ["p", "po", "pol", "poli", "policija"]) { debounce.schedule(query); clock.advance(50); }
  assert(firstRead.signal.aborted, "Typing cancels the old request immediately, before debounce expires");
  assert.deepEqual(commits, [], "Rapid typing sends no per-keystroke read");
  clock.advance(299); assert.deepEqual(commits, []);
  clock.advance(1); assert.deepEqual(commits, ["policija"], "Only the final query is committed after 350ms"); checks++;
  debounce.schedule("izbor"); debounce.flush("izbor"); clock.advance(1000);
  assert.deepEqual(commits, ["policija", "izbor"], "Explicit search consumes its timer and cannot duplicate the request"); checks++;
  debounce.schedule("cancelled"); debounce.cancel(); clock.advance(1000);
  assert.equal(commits.length, 2, "Unmount/cancel removes the queued query"); checks++;

  const epoch = Date.UTC(2026, 9, 29, 10, 0, 0);
  assert.equal(retryAfterDeadline({ "Retry-After": "3" }, epoch), epoch + 3000);
  assert.equal(retryAfterDeadline({ get: key => key === "retry-after" ? new Date(epoch + 5000).toUTCString() : null }, epoch), epoch + 5000);
  assert.equal(retryAfterDeadline({ "retry-after": "invalid" }, epoch), null); checks++;

  {
    const clock = fakeClock(epoch), waits = [], calls = [];
    const recovery = createGalleryReadRecovery({ now: clock.now, wait: async ms => { waits.push(ms); clock.advance(ms); } });
    const response = await recovery.read("/upload/files", async () => { calls.push(clock.now()); if (calls.length === 1) throw failure(429, "2"); return { data: { results: [{ id: 7 }] } }; });
    assert.equal(response.data.results[0].id, 7);
    assert.deepEqual(calls, [epoch, epoch + 2000]); assert.deepEqual(waits, [2000]); checks++;
  }
  {
    const clock = fakeClock(epoch), waits = [], calls = [];
    const recovery = createGalleryReadRecovery({ now: clock.now, wait: async ms => { waits.push(ms); clock.advance(ms); } });
    await recovery.read("/upload/files", async () => { calls.push(clock.now()); if (calls.length < 3) throw failure(calls.length === 1 ? 502 : 503); return { data: "recovered" }; });
    assert.deepEqual(calls, [epoch, epoch + 1000, epoch + 3000]); assert.deepEqual(waits, [1000, 2000]); checks++;
  }
  {
    const clock = fakeClock(epoch), calls = [];
    const recovery = createGalleryReadRecovery({ now: clock.now, wait: async ms => clock.advance(ms) });
    await assert.rejects(recovery.read("/upload/files", async () => { calls.push(clock.now()); throw failure(429, "2"); }), error => error.status === 429 && error.attempts === 3 && error.retryAt === epoch + 6000);
    assert.deepEqual(calls, [epoch, epoch + 2000, epoch + 4000], "A persistent limit stops after exactly three reads"); checks++;
  }
  {
    const clock = fakeClock(epoch), calls = [];
    const recovery = createGalleryReadRecovery({ now: clock.now, wait: async ms => clock.advance(ms) });
    await assert.rejects(recovery.read("/upload/files", async () => { calls.push("original"); throw failure(429, "120"); }), error => error.retryAt === epoch + 120000 && error.attempts === 1);
    await assert.rejects(recovery.read("/upload/files", async () => { calls.push("new query"); return { data: "wrong" }; }), error => error.retryAt === epoch + 120000 && error.attempts === 0);
    assert.deepEqual(calls, ["original"], "Changing query/page/picker cannot bypass a long Retry-After");
    clock.set(epoch + 119999);
    const result = await recovery.read("/upload/files", async () => { calls.push("after deadline"); return { data: "right" }; });
    assert.equal(clock.now(), epoch + 120000); assert.equal(result.data, "right"); checks++;
  }
  {
    const clock = fakeClock(epoch), waits = [];
    const recovery = createGalleryReadRecovery({ now: clock.now, wait: async ms => { waits.push(ms); clock.advance(ms); } });
    let calls = 0;
    await recovery.read("/upload/files", async () => { calls++; if (calls === 1) throw failure(503, new Date(epoch + 4000).toUTCString()); return { data: [] }; });
    assert.deepEqual(waits, [4000], "HTTP-date Retry-After also controls a 503 recovery"); checks++;
  }
  {
    const recovery = createGalleryReadRecovery();
    for (const status of [400, 401, 403, 404, 500]) {
      let calls = 0;
      await assert.rejects(recovery.read(`/not-transient/${status}`, async () => { calls++; throw failure(status); }), error => error.status === status && error.attempts === 1);
      assert.equal(calls, 1, `Status ${status} is not retried`);
    }
    checks++;
  }
  {
    const controller = new AbortController();
    const waiting = abortableDelay(10000, controller.signal);
    controller.abort();
    await assert.rejects(waiting, error => isReadAbort(error, controller.signal)); checks++;
  }
  {
    const controller = new AbortController(), recovery = createGalleryReadRecovery();
    let resolveOld, rendered = "new selection", calls = 0;
    const stale = recovery.read("/upload/files", () => { calls++; return new Promise(resolve => { resolveOld = resolve; }); }, { signal: controller.signal }).then(response => { rendered = response.data; });
    controller.abort(); resolveOld({ data: "stale selection" });
    await assert.rejects(stale, error => isReadAbort(error, controller.signal));
    assert.equal(rendered, "new selection", "A non-cooperative late response cannot overwrite the current query or selection");
    assert.equal(calls, 1); checks++;
  }
  {
    const controller = new AbortController(); controller.abort(); let calls = 0;
    await assert.rejects(createGalleryReadRecovery().read("/upload/files", () => { calls++; }, { signal: controller.signal }), error => isReadAbort(error, controller.signal));
    assert.equal(calls, 0, "Cancelled work sends no read at all"); checks++;
  }
  {
    const controller = new AbortController(), clock = fakeClock(epoch);
    const recovery = createGalleryReadRecovery({ now: clock.now, wait: async ms => clock.advance(ms) });
    let rejectOld, calls = 0;
    const old = recovery.read("/upload/files", () => new Promise((_resolve, reject) => { rejectOld = reject; }), { signal: controller.signal });
    controller.abort(); rejectOld(failure(429, "120"));
    await assert.rejects(old, error => isReadAbort(error, controller.signal));
    await assert.rejects(recovery.read("/upload/files", () => { calls++; return { data: [] }; }), error => error.status === 429 && error.attempts === 0);
    assert.equal(calls, 0, "A received 429 remains binding when input cancellation races with the rejection"); checks++;
  }
  {
    const clock = fakeClock(epoch), attempts = [];
    const recovery = createGalleryReadRecovery({ now: clock.now, wait: async ms => clock.advance(ms), maxAttempts: 100 });
    await assert.rejects(recovery.read("/upload/files", async () => { throw failure(503); }, { onAttempt: ({ attempts: count }) => attempts.push(count) }), error => error.status === 503 && error.attempts === 3);
    assert.deepEqual(attempts, [1, 2, 3], "The read safeguard never allows more than three automatic network attempts"); checks++;
  }
  console.log(JSON.stringify({ ok: true, checks, tested: ["350ms debounce request counts", "immediate stale abort", "single explicit search", "unmount cancellation", "Retry-After seconds/date", "bounded GET retry", "shared cooldown across queries/pages", "late response exclusion"] }));
})().catch(error => { console.error(error); process.exitCode = 1; });
