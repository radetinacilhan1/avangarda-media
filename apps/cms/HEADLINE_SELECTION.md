The homepage has one ordered selection of at most five article IDs, stored in
the existing homepage-config row. The first boot initializes it under a database
row lock using the existing live hero comparator. Later boots preserve the saved
selection. This does not rewrite article priority, flags, genres or content.

In the article form, **Pozicija na naslovnoj** saves a pending proposal and its
preview revision. **Save** leaves the public order unchanged. Native **Publish**
publishes a draft and applies its saved proposal in the same database transaction.
For an already published article, **Objavi raspored** applies the saved proposal
using the native article Publish permission without rewriting the article.
Unpublish/delete remove the article and compact the remaining order.

Insertion first removes the article's previous slot, inserts it at the chosen
position and keeps the first five distinct IDs. An evicted article stays
published. A stale preview returns HTTP 409; refresh, confirm the new preview and
save the proposal again. Repeating a recent operation does not apply it again.
PostgreSQL locks serialize operations across CMS processes; the revision check
prevents one editor from silently overwriting another editor's saved preview.
Strapi 4.26.1 joins EntityService and component queries to the ambient
`strapi.db.transaction` through its own AsyncLocalStorage transaction context.

The existing `/api/homepage-config` response includes `headlineSelection`
(initialized, revision, articleIds) and bounded, ordered `headlineArticles`
with the existing card fields and all eight language values. Only published,
available articles are projected. Private proposal/state fields are removed
from all public API output, including populated related articles. Existing cache
webhooks run after successful commits and do not run after rollbacks.

The backend and frontend can deploy in either order: the new frontend retains
the existing hero rules until `headlineSelection.initialized` is present; the
new CMS seeds the exact live legacy order before serving its new projection.

`verify:headline-selection` requires HEADLINE_QA_APP_DIR pointing to a fresh
disposable SQLite CMS directory named `avangarda_headline_qa_*`, containing the
marker `isolated-headline-qa.marker`, and HEADLINE_QA_FIXTURE pointing to the
captured read-only article fixture. It refuses unmarked apps and databases other
than SQLite. HEADLINE_QA_PORT accepts a dedicated localhost port in 1350–1359;
HEADLINE_QA_SERVE=true leaves the native admin available for browser checks.
Credentials are saved only to a private local file in that QA directory.

The test suite checks insertion at 1/3/5, movement, removal, unpublish, replay,
failed-write publication rollback, competing editors, bulk unpublish, unchanged
other articles, post-commit hooks and no hooks on rollback, native HTTP Save and
Publish, permissions, private nested output and Esej/Komentar persistence.
