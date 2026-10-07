"use strict";

const LANGUAGE_CODES = ["en", "tr", "fr", "de", "es", "el", "ar"];

// Stable identities read from production on 2026-10-07. Serbian names, slugs,
// existing translations and relations are preserved; only empty names are filled.
const TOPIC_NAME_TRANSLATIONS = [
  [1, "topic", "Ljudska Prava", ["Human Rights", "İnsan Hakları", "Droits humains", "Menschenrechte", "Derechos humanos", "Ανθρώπινα δικαιώματα", "حقوق الإنسان"]],
  [2, "topic-1", "Ekologija", ["Ecology", "Ekoloji", "Écologie", "Ökologie", "Ecología", "Οικολογία", "البيئة"]],
  [3, "topic-2", "Politika", ["Politics", "Politika", "Politique", "Politik", "Política", "Πολιτική", "السياسة"]],
  [4, "topic-3", "Rad i Ekonomija", ["Work and Economy", "Emek ve Ekonomi", "Travail et économie", "Arbeit und Wirtschaft", "Trabajo y economía", "Εργασία και οικονομία", "العمل والاقتصاد"]],
  [5, "topic-4", "Margine", ["Margins", "Marjinler", "Marges", "Ränder", "Márgenes", "Περιθώρια", "الهوامش"]],
  [6, "topic-5", "Identitet", ["Identity", "Kimlik", "Identité", "Identität", "Identidad", "Ταυτότητα", "الهوية"]],
  [7, "topic-6", "Sećanje I Istorija", ["Memory and History", "Hafıza ve Tarih", "Mémoire et histoire", "Erinnerung und Geschichte", "Memoria e historia", "Μνήμη και ιστορία", "الذاكرة والتاريخ"]],
  [8, "topic-7", "Društvo", ["Society", "Toplum", "Société", "Gesellschaft", "Sociedad", "Κοινωνία", "المجتمع"]],
  [9, "topic-8", "Kultura", ["Culture", "Kültür", "Culture", "Kultur", "Cultura", "Πολιτισμός", "الثقافة"]],
  [10, "topic-9", "Psihologija", ["Psychology", "Psikoloji", "Psychologie", "Psychologie", "Psicología", "Ψυχολογία", "علم النفس"]],
  [11, "topic-10", "Rogozna", ["Rogozna", "Rogozna", "Rogozna", "Rogozna", "Rogozna", "Ρογκόζνα", "روجوزنا"]],
  [12, "topic-11", "Palestina", ["Palestine", "Filistin", "Palestine", "Palästina", "Palestina", "Παλαιστίνη", "فلسطين"]],
  [18, "manjinska-prava", "Manjinska Prava", ["Minority Rights", "Azınlık Hakları", "Droits des minorités", "Minderheitenrechte", "Derechos de las minorías", "Δικαιώματα των μειονοτήτων", "حقوق الأقليات"]],
  [19, "tranziciona-pravda", "Tranziciona pravda", ["Transitional Justice", "Geçiş Dönemi Adaleti", "Justice transitionnelle", "Übergangsjustiz", "Justicia transicional", "Μεταβατική δικαιοσύνη", "العدالة الانتقالية"]],
  [20, "zdravlje", "Zdravlje", ["Health", "Sağlık", "Santé", "Gesundheit", "Salud", "Υγεία", "الصحة"]],
  [24, "obrazovanje", "Obrazovanje", ["Education", "Eğitim", "Éducation", "Bildung", "Educación", "Εκπαίδευση", "التعليم"]]
].map(([id, slug, name, values]) => ({
  id, slug, name,
  translations: Object.fromEntries(LANGUAGE_CODES.map((language, index) => [`name_${language}`, values[index]]))
}));

function normalizedName(value) {
  return typeof value === "string" ? value.trim().toLocaleLowerCase("sr") : "";
}

function missingTopicNameTranslations(topic) {
  const reference = TOPIC_NAME_TRANSLATIONS.find((entry) =>
    Number(topic.id) === entry.id && topic.slug === entry.slug && normalizedName(topic.name) === normalizedName(entry.name));
  if (!reference) return {};
  return Object.fromEntries(Object.entries(reference.translations).filter(([field]) =>
    topic[field] == null || (typeof topic[field] === "string" && !topic[field].trim())));
}

async function backfillTopicNameTranslations(strapi) {
  const changed = [];
  await strapi.db.connection.transaction(async (transaction) => {
    const fields = LANGUAGE_CODES.map((language) => `name_${language}`);
    const topics = await transaction("topics").select("id", "slug", "name", ...fields)
      .whereIn("id", TOPIC_NAME_TRANSLATIONS.map((entry) => entry.id)).forUpdate();
    for (const topic of topics) {
      const data = missingTopicNameTranslations(topic);
      if (!Object.keys(data).length) continue;
      // Lock and match the stable record. No lifecycle calls, relation writes,
      // timestamps, counters, or repeated frontend invalidation are needed here.
      await transaction("topics").where({ id: topic.id, slug: topic.slug, name: topic.name }).update(data);
      changed.push({ id: topic.id, slug: topic.slug, name: topic.name, fields: Object.keys(data) });
    }
  });
  if (changed.length) {
    const count = changed.reduce((total, topic) => total + topic.fields.length, 0);
    strapi.log.info(`[topic-name-translations] Filled ${count} missing translations on ${changed.length} existing topics.`);
  }
  return changed;
}

module.exports = { LANGUAGE_CODES, TOPIC_NAME_TRANSLATIONS, missingTopicNameTranslations, backfillTopicNameTranslations };
