"use strict";

const VERSION = "avangarda-author-map-defaults-v1";
const HEX_COLOR = /^#[0-9a-f]{6}$/i;
const PALETTE = ["#2563EB", "#D97706", "#059669", "#DC2626", "#0891B2", "#DB2777", "#6B7280", "#EA580C"];

// Verified against the existing canonical author/profile relations, 7 Oct 2026.
// Records are shared by all languages; these are never localization-specific ids.
const INITIAL_AUTHORS = {
  "ilhan-radetinac": { id: 2, name: "Ilhan Radetinac", profile: "ilhan-radetinac", color: "#111111" },
  "berina-skrijelj": { id: 1, name: "Berina Škrijelj", profile: "berina-skrijelj", color: "#7C3AED" },
  "bojan-brankovic": { id: 4, name: "Bojan Branković", profile: "bojan-brankovic", color: PALETTE[0] },
  "danica-dordevic": { id: 5, name: "Danica Đorđević", color: PALETTE[1] },
  "elena-cavlin": { id: 9, name: "Elena Čavlin", profile: "elena-cavlin", color: PALETTE[2] },
  "emir-bihorac": { id: 6, name: "Emir Bihorac", profile: "emir-bihorac", color: PALETTE[3] },
  "luka-dokovic": { id: 7, name: "Luka Đoković", color: PALETTE[4] },
  "minja-petrovic": { id: 10, name: "Minja Petrović", profile: "minja-petrovic", color: PALETTE[5] },
  "nemanja-janjic": { id: 8, name: "Nemanja Janjić", profile: "nemanja-janjic", color: PALETTE[6] },
  "uros-janjic": { id: 3, name: "Uroš Janjić", profile: "uros-janjic", color: PALETTE[7] },
};

function stablePaletteColor(identity) {
  let hash = 2166136261;
  for (const character of String(identity)) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  return PALETTE[(hash >>> 0) % PALETTE.length];
}

function getInitialAuthorColor(author) {
  const expected = INITIAL_AUTHORS[author.slug];
  if (expected) {
    const name = typeof author.name === "string" ? author.name.trim().normalize("NFC") : "";
    const profileSlug = author.publicProfile?.slug;
    if (author.id !== expected.id || name !== expected.name || (expected.profile && profileSlug !== expected.profile)) return null;
    return expected.color;
  }
  return stablePaletteColor(author.slug || author.id);
}

async function initializeAuthorMapDefaults(strapi) {
  const store = strapi.store({ type: "core", name: "avangarda" });
  if ((await store.get({ key: VERSION }))?.complete) return;
  const authors = await strapi.entityService.findMany("api::author.author", {
    fields: ["id", "name", "slug", "mapColor"],
    populate: { publicProfile: { fields: ["slug"] } },
    sort: { id: "asc" },
    limit: 1000,
  });
  const changes = [];
  const skipped = [];
  for (const author of authors) {
    // A configured value belongs to the editor and is never replaced by defaults.
    if (typeof author.mapColor === "string" && author.mapColor.trim()) continue;
    const color = getInitialAuthorColor(author);
    if (!color || !HEX_COLOR.test(color)) {
      skipped.push({ id: author.id, slug: author.slug });
      strapi.log.warn(`[${VERSION}] Identity needs verification: author ${author.id} (${author.slug}).`);
      continue;
    }
    await strapi.entityService.update("api::author.author", author.id, { data: { mapColor: color } });
    changes.push({ id: author.id, slug: author.slug, mapColor: color });
  }
  await store.set({ key: VERSION, value: { complete: authors.length > 0 && !skipped.length, initializedAt: new Date().toISOString(), changes, skipped } });
  strapi.log.info(`[${VERSION}] Filled ${changes.length} missing author colors; preserved configured values.`);
}

module.exports = { initializeAuthorMapDefaults, getInitialAuthorColor, stablePaletteColor, INITIAL_AUTHORS, PALETTE };
