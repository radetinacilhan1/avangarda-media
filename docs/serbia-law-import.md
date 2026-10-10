# Serbian law library import

The repository and installed CMS run Strapi **4.26.1**. The public legal-resource
controller exposes GET routes only. The import uses the existing authenticated
Content Manager API and leaves the schema, public permissions and database intact.
It does not migrate the CMS to Strapi 5.

## Catalogue and evidence

The JSON input is an array, or `{ "records": [...] }`. Each entry contains a stable
catalogue `id` (1–66), `requestedTitle`, optional `aliases`, a boolean `verified`,
`checkedAt`, `evidence` with concrete official URLs, and `data` matching the existing
legal-resource schema. Unverified entries require a concrete `reviewReason`.

For each new law, supply nine editorial text fields in all eight languages
(`sr`, `en`, `tr`, `fr`, `de`, `es`, `el`, `ar`), plus the sixteen existing SEO
component fields. Serbian has no suffix; other languages use `_en`, etc. Legal
adoption, amendment and application dates belong in the researched content;
`checkedAt` records the editorial verification date. `dateUpdated` is optional and
must describe a verified document date rather than the date of this import.

Verify the current consolidated text, amendments, court decisions and deferred
application before setting `verified: true`. A working institutional homepage is
not evidence of a specific current law. Editorial translations are not official
translations of Serbian legislation. Keep the informational limitation in every
new overview. PDF availability does not establish that its legislative version is
current.

Existing values, published slugs, featured decisions, media and relations are
preserved. Only missing fields are filled. An evidence-backed source/date/name
correction additionally needs `corrections[field]` with exact `from`, `to`, `reason`
and an official `evidenceUrl`; drift from `from` aborts that correction. Media
replacement is a separate verified operation, never an incidental content import.
An independently reviewed superseded attachment can be disconnected using an
explicit `documentCorrections` entry: exact `fromId`/`fromUrl`, `to: null`, reason,
superseded/current citations, the archived file's SHA-256, and a current official
`evidenceUrl` already in the entry's evidence. This requires `verified: true` and
an existing record. It retains the original media asset and the pre-write backup;
it never deletes a file. A changed attachment aborts the correction. Do not use
this exception for a current or merely unchecked document.
Relation IDs must already exist; draft targets in types using Draft & Publish are
rejected. National legislation must not be assigned to an arbitrary city.

## Authentication and dry-run

Use a private JSON file containing `origin` (`https://cms.avangarda.media`) and
either an authorized admin `token`, or `email` and `password`. Do not commit or
print credentials. `*.private.json` and `.legal-import/` are ignored. Authentication
uses the existing admin login and permissions, without creating production users
or tokens. An admin token can also be provided through
`AVANGARDA_CMS_ADMIN_TOKEN`.

Run from `apps/cms` with Node 20:

```powershell
node scripts/import-serbia-laws.cjs --mode inventory --credentials C:/private/cms.private.json --state-dir C:/private/legal-import
node scripts/import-serbia-laws.cjs --mode dry-run --credentials C:/private/cms.private.json --catalogue C:/private/catalogue.json --state-dir C:/private/legal-import
```

An authenticated inventory includes published entries, drafts, media, SEO and all
five relation lists. Review `dry-run.json` before applying. Actions distinguish
create, update, skip, ambiguous match and technical error. Offline public exports
may be supplied with `--inventory-file` for a **provisional dry-run only**; they
cannot establish that a law is absent from drafts and cannot authorize apply.

The custom public controller converts string `populate` values to a list. For a
read-only public export, explicitly request
`pdfFile,downloadableFile,seo,tags,relatedHumanRights,relatedArticles,relatedTopics,relatedLocations`;
`populate=*` does not provide a complete preservation export.

## Apply and resume

```powershell
node scripts/import-serbia-laws.cjs --mode apply --credentials C:/private/cms.private.json --catalogue C:/private/catalogue.json --state-dir C:/private/legal-import --batch-size 3
```

Apply takes a fresh authenticated inventory and checks the actual schema and
relation IDs. It exports the complete inventory before any write and saves a
hash-addressed individual backup before each existing-record change. An intervening
editorial change aborts the run. Requests are serial, with a pause after every
three records by default (allowed batch size 1–5). Transient reads/PUTs use bounded
backoff; POSTs are never blindly replayed after an uncertain response. A fresh
inventory recovers an already-created matching record.

Before publishing, read back all fields and verify the proposed values and the
preservation of existing content, media and relations. Only validated drafts are
published. The importer does not unpublish an existing editorial record. Each
result is checkpointed in `progress.json` and append-only `journal.jsonl`; rerunning
with a fresh inventory is idempotent. A failed or unconfirmed write stops the run.

Public API and page checks follow publication: all eight languages, Serbia filter,
real slugs, SEO/social metadata, canonical/hreflang, RTL, relations, official source
links, and actual document downloads. The frontend uses the existing CMS SEO
translations. Existing PDF downloads remain PDFs; attached DOCX documents are
served as DOCX attachments after signature checks, with the correct file extension
and translated download label.

## Validation

```powershell
node scripts/verify-serbia-law-import.cjs
node ../web/scripts/verify-legal-metadata.cjs
node ../web/scripts/verify-legal-documents.cjs
```

The importer verification script has an optional integration mode:
`node scripts/verify-serbia-law-import.cjs <new-avangarda_legal_qa_directory> <installed-CMS-node_modules>`.
It creates a new, marked, local SQLite QA application with the actual repository
schema and Content Manager API. It never loads `.env` or an existing database.
Coverage includes draft inventory/pagination, relation export, preservation,
publication gating, repeat import, uncertain POST recovery, repeat backups,
concurrent edits and invalid relation rejection.

Run the frontend production build, TypeScript check and `git diff --check` for
frontend changes. A code deployment is distinct from a content import. Report
actual published records and unresolved entries; prepared JSON files alone do not
constitute completion of the law-library task.
