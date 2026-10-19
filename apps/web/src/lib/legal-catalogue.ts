import type { Lang } from "@/lib/i18n";
import type { LegalResourceItem } from "@/lib/human-rights";

export const LEGAL_CATALOGUE_PAGE_SIZE = 12;
export const LEGAL_FACETS = ["type", "area", "framework", "right"] as const;
export type LegalFacet = (typeof LEGAL_FACETS)[number];
export type LegalCatalogueFilters = Record<LegalFacet | "q", string>;
export type LegalCatalogueState = LegalCatalogueFilters & { page: number };
export type LegalCatalogueOption = { value: string; label: string; count: number };
export type LegalCatalogueCard = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  typeLabel: string;
  frameworkLabel: string;
  href: string;
};
export type LegalCatalogueResult = {
  filters: LegalCatalogueFilters;
  facets: Record<LegalFacet, LegalCatalogueOption[]>;
  items: LegalCatalogueCard[];
  active: Array<{ key: LegalFacet | "q"; value: string; label: string }>;
  total: number;
  page: number;
  pageCount: number;
  from: number;
  to: number;
  cleared: LegalFacet[];
};
export type LegalCatalogueLabels = { types: Record<string, string>; frameworks: Record<string, string> };

export const legalCatalogueLocales: Record<Lang, string> = {
  sr: "sr-Latn-RS", en: "en-GB", tr: "tr-TR", fr: "fr-FR",
  de: "de-DE", es: "es-ES", el: "el-GR", ar: "ar",
};

export function readLegalCatalogueState(params: Pick<URLSearchParams, "get">): LegalCatalogueState {
  const page = Number(params.get("page"));
  return {
    q: (params.get("q") || "").trim().slice(0, 200),
    type: (params.get("type") || "").trim().slice(0, 64),
    area: (params.get("area") || "").trim().slice(0, 300),
    framework: (params.get("framework") || "").trim().slice(0, 64),
    right: (params.get("right") || "").trim().slice(0, 160),
    page: Number.isSafeInteger(page) && page > 0 ? Math.min(page, 1000000) : 1,
  };
}

export function legalCatalogueQuery(state: LegalCatalogueState) {
  const params = new URLSearchParams();
  for (const key of ["q", ...LEGAL_FACETS] as const) if (state[key]) params.set(key, state[key]);
  if (state.page > 1) params.set("page", String(state.page));
  return params.toString();
}

export function legalCatalogueHref(lang: Lang, state: LegalCatalogueState) {
  const query = legalCatalogueQuery(state);
  return `/${lang}/pravni-kompas${query ? `?${query}` : ""}`;
}

function areaKey(resource: LegalResourceItem) {
  return (resource.legalAreaKey === undefined ? resource.legalArea : resource.legalAreaKey).trim();
}

function facetValues(resource: LegalResourceItem, facet: LegalFacet) {
  if (facet === "type") return [resource.type];
  if (facet === "framework") return [resource.countryOrFramework];
  if (facet === "area") return areaKey(resource) ? [areaKey(resource)] : [];
  return [...new Set(resource.relatedHumanRights.map((right) => right.slug))];
}

function matchesFacets(resource: LegalResourceItem, filters: Partial<LegalCatalogueFilters>) {
  return LEGAL_FACETS.every((facet) => !filters[facet] || facetValues(resource, facet).includes(filters[facet]!));
}

function matchesQuery(resource: LegalResourceItem, q: string, lang: Lang) {
  if (!q) return true;
  const normalize = (value: string) => value.normalize("NFKC").toLocaleLowerCase(legalCatalogueLocales[lang]);
  const haystack = [resource.title, resource.shortDescription, resource.body, resource.legalArea,
    resource.sourceName, resource.whatIsThisFor, resource.whoCanUseIt, resource.whenToUseIt,
    ...resource.relatedHumanRights.map((right) => right.title), ...resource.tags.map((tag) => tag.name)]
    .filter(Boolean).join(" ");
  return normalize(haystack).includes(normalize(q));
}

export function buildLegalCatalogue(
  resources: LegalResourceItem[],
  lang: Lang,
  requested: LegalCatalogueState,
  labels: LegalCatalogueLabels,
  changed?: LegalFacet,
): LegalCatalogueResult {
  const collator = new Intl.Collator(legalCatalogueLocales[lang], { sensitivity: "base", numeric: true });
  const optionLabels: Record<LegalFacet, Map<string, string>> = {
    type: new Map(), area: new Map(), framework: new Map(), right: new Map(),
  };
  const areaAliases = new Map<string, Set<string>>();
  for (const resource of resources) {
    optionLabels.type.set(resource.type, labels.types[resource.type] || resource.type);
    optionLabels.framework.set(resource.countryOrFramework, labels.frameworks[resource.countryOrFramework] || resource.countryOrFramework);
    if (areaKey(resource)) {
      optionLabels.area.set(areaKey(resource), resource.legalArea || areaKey(resource));
      // Compatibility with old URLs is based on paired fields on this exact
      // record, never translation guessing. Ambiguous aliases are not accepted.
      const aliases = areaAliases.get(resource.legalArea) || new Set<string>();
      aliases.add(areaKey(resource));
      areaAliases.set(resource.legalArea, aliases);
    }
    for (const right of resource.relatedHumanRights) optionLabels.right.set(right.slug, right.title);
  }
  const filters: LegalCatalogueFilters = { q: requested.q, type: "", area: "", framework: "", right: "" };
  const cleared: LegalFacet[] = [];
  const order = changed ? [changed, ...LEGAL_FACETS.filter((facet) => facet !== changed)] : [...LEGAL_FACETS];
  for (const facet of order) {
    let value = requested[facet];
    if (!value) continue;
    if (facet === "area" && !optionLabels.area.has(value)) {
      const aliases = areaAliases.get(value);
      if (aliases?.size === 1) value = [...aliases][0];
    }
    const candidate = { ...filters, [facet]: value };
    if (optionLabels[facet].has(value) && resources.some((resource) => matchesFacets(resource, candidate))) {
      filters[facet] = value;
    } else cleared.push(facet);
  }
  const queryMatches = resources.filter((resource) => matchesQuery(resource, filters.q, lang));
  const facets = Object.fromEntries(LEGAL_FACETS.map((facet) => {
    const counts = new Map<string, number>();
    const otherFilters = { ...filters, [facet]: "" };
    for (const resource of queryMatches) {
      if (!matchesFacets(resource, otherFilters)) continue;
      for (const value of facetValues(resource, facet)) counts.set(value, (counts.get(value) || 0) + 1);
    }
    if (filters[facet] && !counts.has(filters[facet])) counts.set(filters[facet], 0);
    const options = [...counts].map(([value, count]) => ({ value, label: optionLabels[facet].get(value) || value, count }))
      .sort((left, right) => collator.compare(left.label, right.label) || left.value.localeCompare(right.value, "en"));
    return [facet, options];
  })) as Record<LegalFacet, LegalCatalogueOption[]>;
  const matched = queryMatches.filter((resource) => matchesFacets(resource, filters)).sort((left, right) =>
    collator.compare(left.title, right.title) || left.slug.localeCompare(right.slug, "en") || String(left.id).localeCompare(String(right.id), "en"));
  const total = matched.length;
  const pageCount = Math.max(1, Math.ceil(total / LEGAL_CATALOGUE_PAGE_SIZE));
  const page = Math.min(requested.page, pageCount);
  const offset = (page - 1) * LEGAL_CATALOGUE_PAGE_SIZE;
  return {
    filters, facets, total, page, pageCount, from: total ? offset + 1 : 0, to: Math.min(offset + LEGAL_CATALOGUE_PAGE_SIZE, total), cleared,
    active: (["q", ...LEGAL_FACETS] as const).filter((key) => filters[key]).map((key) => ({
      key, value: filters[key], label: key === "q" ? filters.q : optionLabels[key].get(filters[key]) || filters[key],
    })),
    items: matched.slice(offset, offset + LEGAL_CATALOGUE_PAGE_SIZE).map((resource) => ({
      id: String(resource.id), slug: resource.slug, title: resource.title, shortDescription: resource.shortDescription,
      typeLabel: labels.types[resource.type] || resource.type,
      frameworkLabel: labels.frameworks[resource.countryOrFramework] || resource.countryOrFramework,
      href: `/${lang}/pravni-kompas/${encodeURIComponent(resource.slug)}`,
    })),
  };
}
