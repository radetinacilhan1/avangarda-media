# CMS gallery stability — 30 October 2026

## Incident evidence and limits

Render application logs confirm JavaScript heap exhaustion on 29 October at
12:38:18 and 17:17:45 Europe/Belgrade. Mark-Compact was unable to reclaim a
roughly 258 MB heap. Render Events additionally records a physical memory failure
over the 512 MB instance limit at 20:11. Similar memory failures occurred on
26–28 October, before gallery commit `4bc40fa` went live on 29 October at 10:04.
The gallery release therefore did not introduce the first memory incident.

Before the 17:17 failure, public article and team requests took 20–45 seconds.
One article collection request explicitly requested pageSize 240 and all article
body languages. No matching gallery write/upload was found in that minute.
Process crashes are confirmed; their connection to the editor's particular 502
or 503 response remains an inference. Its original response/time/headers were not
retained. Render Request Logs and historical CPU/RAM charts are unavailable on
the existing plan. No hosting plan, memory cap, pool size or global protection
was changed.

The reported production 429 could not be reproduced or attributed to an exact
request. The editor recalls entering text and attempting Save, without a time.
Do not label this as a login error without evidence. The installed native limiter
does apply to POST /admin/login (5 attempts / 5 minutes); actual local requests
confirm this and reveal that Strapi's throwing handler omitted Retry-After.
There is no equivalent new gallery-search/save limiter. Cloudinary's upstream
origin is not confirmed for any of the reported three responses.

## Corrections

- Translate REST article pagination to supported Entity Service findPage or
  start/limit. The former custom controller silently ignored nested pagination
  and returned the full corpus, including count-only/homepage requests. Preserve
  requested page sizes, filters, complete body/translations and unpaginated
  semantics; return count metadata when requested.
- Share only an actively pending identical public article/team collection read.
  Different queries/models remain separate. Successful and failed operations
  are removed immediately; no result cache, new rate limit or public payload
  truncation is introduced.
- Add scoped request correlation and safe status/duration/heap/RSS/pool logging.
  Gallery writes have a start record to help investigate process termination.
  Existing Retry-After/rate-limit headers are preserved; missing native 429
  Retry-After derives from its existing reset deadline. No request bodies,
  authorization, credentials, query strings, IPs or form content are logged.
- Guard authenticated native gallery create/update/publish/unpublish controllers
  against overlapping writes. Return 409 WRITE_IN_PROGRESS and Retry-After 1;
  release the in-process guard after both success and failure. This prevents
  overlap, not a claim of durable cross-process idempotency after a crash.
- Debounce photo search 350 ms, abort stale/unmounted requests, preserve selection
  across queries/pages, and retain native whole-library pagination. Only GETs
  receive at most three attempts for 429/502/503. Share Retry-After cooldowns
  across query/page/picker instances, support seconds and HTTP dates, and stop
  automatic waiting above 15 seconds while retaining the real deadline.
- Track one pending write snapshot. Gateway/network/server failures remain
  explicitly unconfirmed; never automatically repeat Save/Publish/upload.
  Manual GET verification compares the saved version, media IDs, image order,
  translated text/credits and edited relation IDs without resetting the form.
  A stale or mismatching server version does not prove rejection. New-record
  failures advise checking the gallery list before creating another record.
- Batch row-label updates into one form update, with no media lookup requests.
  Keep internal names, filename fallback, reordered numbering and library badges.
- Offset the native sticky edit header below the existing mobile navigation
  toolbar so Save/Publish remain reachable by touch while scrolled.

Supported native CM context does not expose Save/Publish HTTP headers. The panel
does not invent a native write status/deadline from an unavailable response;
server diagnostics capture the actual headers, and custom GETs honor deadlines.
Native pending actions remain disabled and the server enforces overlapping-write
protection. Existing validation paths and aggregated field errors are preserved.

## Verification

- CMS admin production build: Node 20 / Strapi 4.26.1. The optional Cloud command
  reports a local per-user configuration permission warning; admin compilation
  succeeds. Existing stale Browserslist data does not fail the build.
- 44 focused stability checks: 15 read recovery, 17 write outcome verification,
  12 server/pagination/coalescing/guard/diagnostic checks.
- Existing gallery admin/request-error checks; 20 actual isolated SQLite gallery
  integration checks including transaction rollback after child writes; 85
  existing fact-check workflow checks. No real emails or production writes.
- Actual native local HTTP: five invalid login requests return 400, sixth 429
  with unchanged limit 5, remaining 0, reset, Retry-After 301 and request ID.
  First authenticated Save 200, concurrent Save/Publish 409, later Save 200.
- Local fault injection covers 429/502/503 before Save/Publish and ambiguous
  503-after-committed-Save / 502-after-committed-Publish. No automatic mutation
  retries or extra uploads. Real HTTP GET recovery tests include cancellation,
  rapid input, bounded retries and a long HTTP-date cooldown.
- Browser desktop/mobile checks cover failure before/after commit, manual saved
  version verification, retained text/media/order, search and pagination,
  existing-library badges, label changes/reordering, successful save/reopen,
  and a 200-image gallery. Browser evidence is stored outside the release.

Synthetic memory comparison uses 128 articles × 8 body languages × 50 KB,
SQLite pool 3 and Node --max-old-space-size=256 (total V8 heap limit 318,767,104
bytes, not an assertion of identical Render limits). Requesting pageSize 12
changes 128 rows / 51,360,188 bytes / peak heap 269.5 MB / RSS 374.8 MB to
12 rows / 4,815,078 bytes / peak heap 92.2 MB / RSS 185.5 MB. Bodies remain intact.
Explicit pageSize 240 still returns all 128 rows and shows no material memory
improvement; neither raw fixture reproduced OOM. Under a clearly marked 200 ms
test-only async I/O delay, three identical GETs use one service read instead of
three, with identical complete data hashes. This proves reduced duplicate DB
work, not elimination of all production OOMs.

## Release boundaries

Only CMS code/configuration, focused checks and this report are included.
The original dirty workspace is excluded. No public design, existing content,
translations, media originals, portfolio/PDF/Kompas/SPONA implementation or
hosting plan is changed. Production verification is read-only: no existing
gallery Save/Publish/Upload/Delete. Before/after public content hashes, commit
and Render deployment status are recorded with the local release evidence.

References: [Strapi Entity Service pagination](https://docs-v4.strapi.io/dev-docs/api/entity-service/order-pagination),
[Render runtime troubleshooting](https://render.com/docs/troubleshooting-deploys),
and installed Strapi 4.26.1 source.
