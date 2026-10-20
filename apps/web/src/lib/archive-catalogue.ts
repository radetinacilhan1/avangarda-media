import { localizeTopic } from "@/lib/content";
import { localizeArticleStyle } from "@/lib/article-style";
import { getArticleYear, type PublishedArticle } from "@/lib/editorial";
import { getSectionLabel, type Lang } from "@/lib/i18n";
import { normalizeSectionSlug } from "@/lib/sections";
import { formatDisplayDate, getStrapiMediaUrl, unwrapStrapiCollection } from "@/lib/strapi";

import { ARCHIVE_FACETS, ARCHIVE_PAGE_SIZE, type ArchiveFacet, type ArchiveFilters, type ArchiveState, type ArchiveCard, type ArchiveOption, type ArchiveResult } from "@/lib/archive-catalogue-state";
const locales: Record<Lang, string> = { sr: "sr-Latn-RS", en: "en-GB", tr: "tr-TR", fr: "fr-FR", de: "de-DE", es: "es-ES", el: "el-GR", ar: "ar" };
const normalize = (value: string) => value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
type NamedRelation = { id?: number | string; name?: string; slug?: string; [key: string]: unknown };

function relations(article: PublishedArticle, field: "topics" | "authors" | "locations", lang: Lang) {
  return unwrapStrapiCollection<NamedRelation>(article[field]).map((relation) => {
    const value = relation.slug?.trim() || (relation.id !== undefined ? `id:${relation.id}` : relation.name?.trim() || "");
    const localized = field === "topics" ? localizeTopic(relation, lang).name : field === "locations" && lang !== "sr" ? relation[`name_${lang}`] || relation.name : relation.name;
    const label = typeof localized === "string" ? localized.trim() : "";
    return { value, label: label || value, aliases: [relation.name || "", label, String(relation.id ?? "")] };
  }).filter((relation) => relation.value);
}
function toCard(article: PublishedArticle, lang: Lang): ArchiveCard {
  const topics = relations(article, "topics", lang);
  const locations = relations(article, "locations", lang);
  const rawUrl = article.cover?.formats?.small?.url || article.cover?.formats?.medium?.url || article.cover?.url;
  return {
    id: String(article.id), href: `/${lang}/a/${encodeURIComponent(article.slug)}`, title: article.title,
    excerpt: article.subtitle || article.focus || "", imageUrl: rawUrl ? getStrapiMediaUrl(rawUrl) : "",
    section: getSectionLabel(article.section || "", lang), date: formatDisplayDate(article.publishedAt, lang),
    author: relations(article, "authors", lang).map((author) => author.label).join(", "),
    chips: [topics[0]?.label, localizeArticleStyle(article.style, lang), locations[0]?.label].filter(Boolean).slice(0, 3) as string[],
  };
}

export function buildArchiveCatalogue(articles: PublishedArticle[], lang: Lang, requested: ArchiveState, changed?: ArchiveFacet): ArchiveResult {
  const labels = Object.fromEntries(ARCHIVE_FACETS.map((key) => [key, new Map<string, string>()])) as Record<ArchiveFacet, Map<string, string>>;
  const aliases = Object.fromEntries(ARCHIVE_FACETS.map((key) => [key, new Map<string, Set<string>>()])) as Record<ArchiveFacet, Map<string, Set<string>>>;
  const indexed = articles.map((article) => {
    const values: Record<ArchiveFacet, string[]> = { section: [normalizeSectionSlug(article.section)], topic: [], author: [], year: [], style: [], location: [] };
    if (values.section[0]) labels.section.set(values.section[0], getSectionLabel(values.section[0], lang));
    else values.section = [];
    const year = getArticleYear(article);
    if (year !== null) { values.year = [String(year)]; labels.year.set(String(year), String(year)); }
    if (article.style) { values.style = [article.style]; labels.style.set(article.style, localizeArticleStyle(article.style, lang)); }
    for (const [facet, field] of [["topic", "topics"], ["author", "authors"], ["location", "locations"]] as const) {
      for (const relation of relations(article, field, lang)) {
        if (!values[facet].includes(relation.value)) values[facet].push(relation.value);
        labels[facet].set(relation.value, relation.label);
        // Legacy name-based URLs map only to identities from the same record.
        // Ambiguous translated names are deliberately not guessed.
        for (const alias of relation.aliases) if (alias) {
          const key = normalize(alias); const keys = aliases[facet].get(key) || new Set<string>();
          keys.add(relation.value); aliases[facet].set(key, keys);
        }
      }
    }
    const text = normalize([article.title, article.subtitle, article.focus, article.style, localizeArticleStyle(article.style, lang),
      (article.content || "").replace(/<[^>]+>/g, " "),
      ...[...labels.topic, ...labels.author, ...labels.location].filter(([value]) => [...values.topic, ...values.author, ...values.location].includes(value)).map(([, label]) => label)]
      .filter(Boolean).join(" ").replace(/\s+/g, " "));
    return { article, values, text };
  });
  const filters: ArchiveFilters = { q: requested.q, section: "", topic: "", author: "", year: "", style: "", location: "", sort: requested.sort };
  const matches = (row: typeof indexed[number], current: Partial<ArchiveFilters>) => ARCHIVE_FACETS.every((facet) => !current[facet] || row.values[facet].includes(current[facet]!));
  const cleared: ArchiveFacet[] = [];
  const order = changed ? [changed, ...ARCHIVE_FACETS.filter((facet) => facet !== changed)] : [...ARCHIVE_FACETS];
  for (const facet of order) {
    let value = requested[facet]; if (!value) continue;
    if (!labels[facet].has(value)) {
      const relationAliases = aliases[facet].get(normalize(value));
      if (relationAliases?.size === 1) value = [...relationAliases][0];
      else { const options = [...labels[facet].keys()].filter((key) => normalize(key) === normalize(value)); if (options.length === 1) value = options[0]; }
    }
    if (labels[facet].has(value) && indexed.some((row) => matches(row, { ...filters, [facet]: value }))) filters[facet] = value;
    else cleared.push(facet);
  }
  // A search with no matches stays empty rather than removing valid explicit
  // choices. Facets retain the selected zero-count option so it can be removed.
  const queryRows = indexed.filter((row) => !filters.q || row.text.includes(normalize(filters.q)));
  const collator = new Intl.Collator(locales[lang], { sensitivity: "base", numeric: true });
  const facets = Object.fromEntries(ARCHIVE_FACETS.map((facet) => {
    const counts = new Map<string, number>();
    for (const row of queryRows) if (matches(row, { ...filters, [facet]: "" })) for (const value of row.values[facet]) counts.set(value, (counts.get(value) || 0) + 1);
    if (filters[facet] && !counts.has(filters[facet])) counts.set(filters[facet], 0);
    return [facet, [...counts].map(([value, count]) => ({ value, label: labels[facet].get(value) || value, count })).sort((left, right) => facet === "year" ? Number(right.value) - Number(left.value) : collator.compare(left.label, right.label) || left.value.localeCompare(right.value, "en"))];
  })) as Record<ArchiveFacet, ArchiveOption[]>;
  const matched = queryRows.filter((row) => matches(row, filters)).sort((left, right) => {
    const delta = (Date.parse(right.article.publishedAt || "") || 0) - (Date.parse(left.article.publishedAt || "") || 0);
    return (filters.sort === "oldest" ? -delta : delta) || String(left.article.id).localeCompare(String(right.article.id), "en", { numeric: true });
  });
  const total = matched.length; const pageCount = Math.max(1, Math.ceil(total / ARCHIVE_PAGE_SIZE));
  const page = Math.min(requested.page, pageCount); const offset = (page - 1) * ARCHIVE_PAGE_SIZE;
  return {
    filters, facets, total, page, pageCount, from: total ? offset + 1 : 0, to: Math.min(offset + ARCHIVE_PAGE_SIZE, total), cleared,
    active: (["q", ...ARCHIVE_FACETS] as const).filter((key) => filters[key]).map((key) => ({ key, value: filters[key], label: key === "q" ? filters.q : labels[key].get(filters[key]) || filters[key] })),
    items: matched.slice(offset, offset + ARCHIVE_PAGE_SIZE).map((row) => toCard(row.article, lang)),
    featured: matched.filter((row) => row.article.cover?.url || row.article.subtitle || row.article.focus).slice(0, 2).map((row) => toCard(row.article, lang)),
  };
}
