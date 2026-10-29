# CMS gallery workflow — 28 October 2026

## Confirmed incident

Render application logs for `avangarda-media` contain repeated PostgreSQL failures updating `components_shared_article_image_credits`, including **16:27:24 Europe/Belgrade**, matching the supplied screenshot:

`value too long for type character varying(255)`

The existing schema stored freeform image metadata as `string`/VARCHAR(255), while it declared no corresponding validation limit. Strapi therefore accepted the form and failed during the component write, returning the generic 500 error. Parameterized production logs do not identify the exact submitted value or column; the original request body was not retained. No particular photograph or input is blamed without that evidence.

A fresh PostgreSQL 16 test reproduced the same SQL failure and native Content Manager 500 response with a long source URL and alt text. After applying the schema migration, the same request returned 200 and reopened with the complete values.

A separate production upload failure at 15:33–15:37 was also confirmed: Sharp could not create `optimized-<hash>` because Strapi derived an oversized hash from a long filename (`File name too long`). The same failure was reproduced locally with a valid 240-character filename and image optimization enabled.

## Changes

- Widen the 13 existing freeform fields in `shared.article-image-credit` to TEXT, preserving existing values and the public response shape. No truncation, deduplication or content backfill.
- Validate gallery data before any component write: aggregate explicit schema limits, physical bounded fields, integer ranges, native schema errors and existing image media IDs. Empty optional draft rows remain valid. Media checks use one batch query.
- Wrap gallery writes in a native Strapi transaction. Unexpected failures after component changes roll back edits, removals and new child rows. Frontend revalidation follows commit.
- Keep genuine server/upload failures as server/upload failures with a support reference; log sanitized diagnostics without request bodies, headers or credentials.
- Bound newly generated upload storage hashes before Sharp optimization; retain the original Media Library filename and metadata. Existing Cloudinary originals/URLs are not changed.
- Add optional private `internalName` and generated private `adminLabel`. A gallery-only supported edit-layout hook selects `adminLabel` as the component main field. Labels derive from the current row order, internal name and selected media filename. Opening an old gallery does not mark it dirty. Article layouts retain their existing main field and controls.
- Show aggregate field errors with normal focus/accordion actions through explicit native accessibility attributes. No URL navigation/refetch, generated CSS selectors or DOM content rewriting. One general server alert remains distinct from field errors.
- Add a local admin plugin that wraps the registered native media field through Strapi's field registry. The existing native upload remains available. The additional reuse picker uses native `/upload/files` search (`_q`, filename/alt/caption), server pagination, thumbnails and stable media IDs. Selection survives query/page changes. Existing gallery assets have the badge “Već u ovoj galeriji”.
- Keep internal names out of public API responses, including custom controllers and nested article/gallery populations.

The native repeatable header has no supported thumbnail rendering slot in Strapi 4.26.1, so header thumbnails were intentionally omitted. Picker thumbnails are present.

## Validation

- CMS admin **production build passed**, Node 20 / Strapi 4.26.1. The local optional Cloud command could not read its per-user config under the sandbox, but the actual admin build completed successfully; Browserslist reported its existing stale-data notice.
- `verify-gallery-admin.cjs`: labels, media IDs, gallery/article layout isolation, aggregate errors, focus preservation and native server-error shapes passed.
- `verify-gallery-request-errors.cjs`: server/upload status and reference, native validation preservation, credential redaction (including JSON/Bearer/database URLs), private public fields and actual bounded temporary file writes passed.
- `verify-gallery-validation.cjs`: **20 actual local integration checks passed**, including a parent failure after a real child write and a complete rollback.
- PostgreSQL 16: baseline save/upload 500 reproductions; additive TEXT migration preserving existing gallery/article data; same long metadata/upload requests succeeding; aggregate 400 before mutation; rollback after real child writes. Final specific-error recheck passed.
- Existing checks passed: revalidation, headline admin, appearance configuration, **85 fact-check workflow checks**, and **7 PDF attachment checks** in a separate disposable database.
- Browser checks at desktop 1440×1000 and mobile 390×844: save/reopen, labels/name changes/reorder, optional empty row, image replacement/reuse, multiple errors, error focus, preserved unsaved values, genuine server failure, native upload failure, filename/description search across pages and retained selection. The picker uses a scoped overlay above the existing mobile toolbar.
- Read-only API checks after browser tests confirmed all 36 original local media IDs/names/URLs unchanged, no extra upload from reuse, repeated media IDs retained, original captions/translations/credits preserved except the intentional test edit, and the full 397-character URL retained. The article body/image components were unchanged.

Run the focused fresh-local suite with `npm run verify:galleries`. Its integration test creates a new isolated SQLite runtime and strips production provider/database environment variables.

## Release scope

Implementation is limited to CMS configuration, admin/plugin code, shared image metadata schema/types, gallery write/error handling, upload hash generation, focused checks and this report. No web/frontend design, portfolio, PDF implementation, Kompas AI or SPONA source was changed. The original dirty checkout was not used for the release.

Production verification must use the deployed CMS commit and read-only admin/public checks. Production gallery/media Save, Publish, Replace, Upload and Delete actions are excluded from the verification. The public gallery content baseline before deployment is 4 galleries / 67 photos, SHA-256 `cbdc05f22666a965b737d47c952ea9f651985b95612309818d9401908f6af6ab`.

Implementation references: [Strapi v4 models and validation](https://docs-v4.strapi.io/dev-docs/backend-customization/models), installed Strapi 4.26.1 admin/Content Manager/upload source and the native Design System components.
