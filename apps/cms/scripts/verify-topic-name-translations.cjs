"use strict";

const assert = require("node:assert/strict");
const { LANGUAGE_CODES, TOPIC_NAME_TRANSLATIONS, missingTopicNameTranslations, backfillTopicNameTranslations } = require("../src/topic-name-translations");

async function main() {
  const original = TOPIC_NAME_TRANSLATIONS.map(({ id, slug, name }) => ({
    id, slug, name: id === 6 ? `${name} ` : name,
    ...Object.fromEntries(LANGUAGE_CODES.map((language) => [`name_${language}`, null])),
    description: "Existing description", relationIds: [11, 42], updated_at: "2026-01-01"
  }));
  const rows = structuredClone(original);
  // Existing editor text, whitespace-only missing fields and mismatched records.
  rows[0].name_fr = "Texte éditorial conservé";
  rows[1].name_en = "  ";
  const other = { ...rows[2], id: 99 };
  const wrongSlug = { ...rows[2], slug: "different-topic" };
  const wrongName = { ...rows[2], name: "A different topic" };
  assert.deepEqual(missingTopicNameTranslations(other), {});
  assert.deepEqual(missingTopicNameTranslations(wrongSlug), {});
  assert.deepEqual(missingTopicNameTranslations(wrongName), {});

  const updates = [];
  let locked = false;
  const strapi = {
    log: { info() {} },
    db: { connection: { async transaction(work) {
      await work((table) => {
        assert.equal(table, "topics");
        return {
          select() { return this; }, whereIn() { return this; },
          async forUpdate() { locked = true; return rows; },
          where(identity) { this.identity = identity; return this; },
          async update(patch) {
            assert.equal(locked, true, "Rows must be locked before writes");
            const row = rows.find((topic) => topic.id === this.identity.id && topic.slug === this.identity.slug && topic.name === this.identity.name);
            assert.ok(row, "Updates must match the complete stable identity");
            assert.ok(Object.keys(patch).every((field) => /^name_(en|tr|fr|de|es|el|ar)$/.test(field)));
            Object.assign(row, patch);
            updates.push({ id: row.id, patch });
          }
        };
      });
    } } }
  };
  const changed = await backfillTopicNameTranslations(strapi);
  assert.equal(changed.length, 16);
  assert.equal(changed.reduce((sum, topic) => sum + topic.fields.length, 0), 111);
  assert.equal(rows[0].name_fr, "Texte éditorial conservé");
  for (let index = 0; index < rows.length; index++) {
    for (const field of ["id", "slug", "name", "description", "relationIds", "updated_at"]) {
      assert.deepEqual(rows[index][field], original[index][field], `${field} must be preserved`);
    }
    assert.ok(LANGUAGE_CODES.every((language) => rows[index][`name_${language}`].trim()));
  }
  assert.deepEqual(await backfillTopicNameTranslations(strapi), []);
  assert.equal(updates.length, 16, "Repeated runs must not write again");
  console.log("Topic translations: 16 stable identities, 7 languages, preservation and idempotency passed.");
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
