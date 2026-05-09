import { localizeArticle, localizeTopic } from "@/lib/content";
import { fallbackArticles, fallbackSignals, type FallbackArticle, type FallbackSignal } from "@/lib/fallback-content";
import type { Lang } from "@/lib/i18n";
import { normalizeSectionSlug } from "@/lib/sections";
import { signalExternalProviders, type SignalExternalProvider, type SignalExternalProviderKey } from "@/lib/signal-providers";
import { strapiGet, unwrapStrapiCollection, unwrapStrapiSingle } from "@/lib/strapi";

type LocalizedRecord = Record<string, unknown>;

type SignalArticleRecord = {
  id?: number;
  title?: string;
  title_en?: string;
  title_tr?: string;
  title_fr?: string;
  title_de?: string;
  subtitle?: string;
  subtitle_en?: string;
  subtitle_tr?: string;
  subtitle_fr?: string;
  subtitle_de?: string;
  slug?: string;
  section?: string;
  publishedAt?: string;
  authors?: unknown;
  cover?: unknown;
};

type SignalTopicRecord = {
  id?: number;
  slug?: string;
  name?: string;
  name_en?: string;
  name_tr?: string;
  name_fr?: string;
  name_de?: string;
};

type CmsSignalRecord = Record<string, unknown> & {
  id?: number;
  title?: string;
  title_en?: string;
  title_tr?: string;
  title_fr?: string;
  title_de?: string;
  value?: string;
  value_en?: string;
  value_tr?: string;
  value_fr?: string;
  value_de?: string;
  description?: string;
  description_en?: string;
  description_tr?: string;
  description_fr?: string;
  description_de?: string;
  source?: string;
  source_en?: string;
  source_tr?: string;
  source_fr?: string;
  source_de?: string;
  sourceUrl?: string;
  date?: string;
  methodNote?: string;
  methodNote_en?: string;
  methodNote_tr?: string;
  methodNote_fr?: string;
  methodNote_de?: string;
  editorialNote?: string;
  editorialNote_en?: string;
  editorialNote_tr?: string;
  editorialNote_fr?: string;
  editorialNote_de?: string;
  region?: string;
  region_en?: string;
  region_tr?: string;
  region_fr?: string;
  region_de?: string;
  relatedSection?: string;
  relatedAnalysis?: unknown;
  topics?: unknown;
  isFeatured?: boolean;
  showOnHomepage?: boolean;
  order?: number;
  externalSourceKey?: string;
  isActive?: boolean;
};

type ExternalSignalScope = "homepage" | "analysis" | "article";

type SignalFetchBaseOptions = {
  lang: Lang;
  limit?: number;
  scope: ExternalSignalScope;
  relatedAnalysisId?: number;
  relatedAnalysisSlug?: string;
};

type SignalMergeOptions = SignalFetchBaseOptions & {
  section?: string;
};

type ExternalSignalRecord = {
  value: string;
  title: string;
  description: string;
  source: string;
  sourceUrl?: string;
  date?: string;
  methodNote?: string;
  editorialNote?: string;
  region?: string;
  topicLabel?: string;
  relatedSection?: string;
  relatedAnalysisSlug?: string;
  isFeatured?: boolean;
  showOnHomepage?: boolean;
  order?: number;
  externalSourceKey?: string;
};

export type SignalItem = {
  id: string;
  value: string;
  title: string;
  description: string;
  source: string;
  sourceUrl?: string;
  date?: string;
  methodNote?: string;
  editorialNote?: string;
  region?: string;
  topicLabel?: string;
  relatedSection?: string;
  relatedAnalysis?: {
    id: number;
    title: string;
    subtitle?: string;
    slug: string;
    section?: string;
    publishedAt?: string;
    authors?: unknown;
    cover?: unknown;
  };
  href?: string;
  isFeatured: boolean;
  showOnHomepage: boolean;
  order: number;
  externalSourceKey?: string;
  sourceKind: "cms" | "external" | "fallback";
  providerLabel?: string;
};

const localizedSuffix: Record<Exclude<Lang, "sr">, string> = {
  en: "_en",
  tr: "_tr",
  fr: "_fr",
  de: "_de"
};

function pickLocalizedValue(record: LocalizedRecord, field: string, lang: Lang) {
  const baseValue = record[field];
  if (lang === "sr") return typeof baseValue === "string" ? baseValue.trim() : "";

  const translatedValue = record[`${field}${localizedSuffix[lang]}`];
  if (typeof translatedValue === "string" && translatedValue.trim()) {
    return translatedValue.trim();
  }

  return typeof baseValue === "string" ? baseValue.trim() : "";
}

function toInteger(value: unknown, fallback: number) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : fallback;
}

function trimNonEmpty(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function hasRequiredSignalSource(source?: string, sourceUrl?: string, date?: string) {
  return Boolean(source?.trim() && sourceUrl?.trim() && date?.trim());
}

function signalDateValue(value?: string) {
  if (!value) return 0;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function buildSignalHref(relatedAnalysis?: SignalItem["relatedAnalysis"], relatedSection?: string) {
  if (relatedAnalysis?.slug) {
    return `/a/${relatedAnalysis.slug}`;
  }

  const normalizedSection = normalizeSectionSlug(relatedSection || "");
  if (normalizedSection === "analysis") {
    return "/section/analysis";
  }

  return normalizedSection ? `/section/${normalizedSection}` : undefined;
}

function buildSignalKey(item: Pick<SignalItem, "id" | "externalSourceKey" | "title" | "value" | "relatedAnalysis">) {
  if (item.externalSourceKey?.trim()) return `external:${item.externalSourceKey.trim()}`;
  if (item.relatedAnalysis?.slug) return `analysis:${item.relatedAnalysis.slug}`;
  return `${item.id}:${item.value}:${item.title}`;
}

function mergeSignalItems(primary: SignalItem[], secondary: SignalItem[], limit: number) {
  const merged: SignalItem[] = [];
  const seen = new Set<string>();

  for (const item of [...primary, ...secondary]) {
    const key = buildSignalKey(item);
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(item);
    if (merged.length >= limit) break;
  }

  return merged;
}

function sortSignals(items: SignalItem[]) {
  return [...items].sort((left, right) => {
    if (left.order !== right.order) return left.order - right.order;
    return signalDateValue(right.date) - signalDateValue(left.date);
  });
}

function localizeRelatedAnalysis(value: unknown, lang: Lang) {
  const article = unwrapStrapiSingle<SignalArticleRecord>(value);
  if (!article?.id || !article.slug) return undefined;

  const localized = localizeArticle(article, lang) as SignalArticleRecord;
  if (!localized.title?.trim() || !localized.slug?.trim()) return undefined;

  return {
    id: localized.id,
    title: localized.title.trim(),
    subtitle: localized.subtitle?.trim() || undefined,
    slug: localized.slug.trim(),
    section: typeof localized.section === "string" ? localized.section : undefined,
    publishedAt: typeof localized.publishedAt === "string" ? localized.publishedAt : undefined,
    authors: localized.authors,
    cover: localized.cover
  };
}

function getTopicLabel(topics: unknown, lang: Lang) {
  const firstTopic = unwrapStrapiCollection<SignalTopicRecord>(topics)[0];
  if (!firstTopic) return undefined;

  const localizedTopic = localizeTopic(firstTopic, lang);
  return localizedTopic.name?.trim() || undefined;
}

function localizeCmsSignal(record: CmsSignalRecord, lang: Lang): SignalItem | null {
  const title = pickLocalizedValue(record, "title", lang);
  const value = pickLocalizedValue(record, "value", lang);
  const description = pickLocalizedValue(record, "description", lang);
  const source = pickLocalizedValue(record, "source", lang);
  const sourceUrl = trimNonEmpty(record.sourceUrl);
  const date = trimNonEmpty(record.date);
  const methodNote = pickLocalizedValue(record, "methodNote", lang) || undefined;
  const editorialNote = pickLocalizedValue(record, "editorialNote", lang) || undefined;

  if (!title || !value || !description || !hasRequiredSignalSource(source, sourceUrl, date)) {
    return null;
  }

  const relatedAnalysis = localizeRelatedAnalysis(record.relatedAnalysis, lang);
  const relatedSection = typeof record.relatedSection === "string" ? normalizeSectionSlug(record.relatedSection) : "";
  const order = toInteger(record.order, 999);

  return {
    id: `cms-${record.id || `${value}-${title}`}`,
    value,
    title,
    description,
    source,
    sourceUrl,
    date,
    methodNote,
    editorialNote,
    region: pickLocalizedValue(record, "region", lang) || undefined,
    topicLabel: getTopicLabel(record.topics, lang),
    relatedSection: relatedSection || undefined,
    relatedAnalysis,
    href: buildSignalHref(relatedAnalysis, relatedSection),
    isFeatured: record.isFeatured !== false,
    showOnHomepage: record.showOnHomepage === true,
    order,
    externalSourceKey: typeof record.externalSourceKey === "string" ? record.externalSourceKey.trim() || undefined : undefined,
    sourceKind: "cms"
  };
}

function localizeFallbackSignal(record: FallbackSignal, lang: Lang): SignalItem {
  const relatedAnalysisRecord = record.relatedAnalysisSlug
    ? fallbackArticles.find((article) => article.slug === record.relatedAnalysisSlug)
    : undefined;
  const relatedAnalysis = relatedAnalysisRecord
    ? (localizeArticle(relatedAnalysisRecord as FallbackArticle, lang) as FallbackArticle)
    : null;

  const localizedRelatedAnalysis = relatedAnalysis && relatedAnalysis.id && relatedAnalysis.slug
    ? {
        id: relatedAnalysis.id,
        title: relatedAnalysis.title,
        subtitle: relatedAnalysis.subtitle,
        slug: relatedAnalysis.slug,
        section: relatedAnalysis.section,
        publishedAt: relatedAnalysis.publishedAt,
        authors: relatedAnalysis.authors,
        cover: relatedAnalysis.cover
      }
    : undefined;
  const relatedSection = normalizeSectionSlug(record.relatedSection || "") || undefined;
  const title = pickLocalizedValue(record as unknown as LocalizedRecord, "title", lang) || record.title;
  const value = pickLocalizedValue(record as unknown as LocalizedRecord, "value", lang) || record.value;
  const description = pickLocalizedValue(record as unknown as LocalizedRecord, "description", lang) || record.description;
  const source = pickLocalizedValue(record as unknown as LocalizedRecord, "source", lang) || record.source;
  const sourceUrl = trimNonEmpty(record.sourceUrl);
  const date = trimNonEmpty(record.date);
  const methodNote = pickLocalizedValue(record as unknown as LocalizedRecord, "methodNote", lang) || undefined;
  const editorialNote = pickLocalizedValue(record as unknown as LocalizedRecord, "editorialNote", lang) || undefined;
  const region = pickLocalizedValue(record as unknown as LocalizedRecord, "region", lang) || record.region;
  const topicLabel = pickLocalizedValue(record as unknown as LocalizedRecord, "topicLabel", lang) || record.topicLabel;

  return {
    id: `fallback-${record.id}`,
    value,
    title,
    description,
    source,
    sourceUrl,
    date,
    methodNote,
    editorialNote,
    region,
    topicLabel,
    relatedSection,
    relatedAnalysis: localizedRelatedAnalysis,
    href: buildSignalHref(localizedRelatedAnalysis, relatedSection),
    isFeatured: record.isFeatured !== false,
    showOnHomepage: record.showOnHomepage === true,
    order: record.order ?? record.id,
    externalSourceKey: record.externalSourceKey,
    sourceKind: "fallback"
  };
}

function normalizeExternalSignal(
  provider: SignalExternalProvider,
  record: ExternalSignalRecord,
  lang: Lang
): SignalItem | null {
  const source = trimNonEmpty(record.source);
  const sourceUrl = trimNonEmpty(record.sourceUrl);
  const date = trimNonEmpty(record.date);
  if (!record.value?.trim() || !record.title?.trim() || !record.description?.trim() || !hasRequiredSignalSource(source, sourceUrl, date)) {
    return null;
  }

  const relatedAnalysis = record.relatedAnalysisSlug
    ? fallbackArticles.find((article) => article.slug === record.relatedAnalysisSlug)
    : undefined;
  const localizedRelatedAnalysis = relatedAnalysis
    ? (localizeArticle(relatedAnalysis as FallbackArticle, lang) as FallbackArticle)
    : null;

  return {
    id: `external-${provider.key}-${record.externalSourceKey || `${record.value}-${record.title}`}`,
    value: record.value.trim(),
    title: record.title.trim(),
    description: record.description.trim(),
    source,
    sourceUrl,
    date,
    methodNote: trimNonEmpty(record.methodNote),
    editorialNote: trimNonEmpty(record.editorialNote),
    region: record.region?.trim() || undefined,
    topicLabel: record.topicLabel?.trim() || undefined,
    relatedSection: normalizeSectionSlug(record.relatedSection || "") || undefined,
    relatedAnalysis: localizedRelatedAnalysis
      ? {
          id: localizedRelatedAnalysis.id,
          title: localizedRelatedAnalysis.title,
          subtitle: localizedRelatedAnalysis.subtitle,
          slug: localizedRelatedAnalysis.slug,
          section: localizedRelatedAnalysis.section,
          publishedAt: localizedRelatedAnalysis.publishedAt,
          authors: localizedRelatedAnalysis.authors,
          cover: localizedRelatedAnalysis.cover
        }
      : undefined,
    href: buildSignalHref(
      localizedRelatedAnalysis
        ? {
            id: localizedRelatedAnalysis.id,
            title: localizedRelatedAnalysis.title,
            slug: localizedRelatedAnalysis.slug
          }
        : undefined,
      record.relatedSection
    ),
    isFeatured: record.isFeatured !== false,
    showOnHomepage: record.showOnHomepage === true,
    order: record.order ?? 999,
    externalSourceKey: record.externalSourceKey || provider.key,
    sourceKind: "external",
    providerLabel: provider.label
  };
}

async function fetchCmsSignals(query: string, lang: Lang) {
  const response = await strapiGet<{ data: unknown[] }>(
    `/api/signals?${query}&populate[topics]=*&populate[relatedAnalysis][populate][0]=authors&populate[relatedAnalysis][populate][1]=cover`
  );

  return sortSignals(
    unwrapStrapiCollection<CmsSignalRecord>(response?.data)
      .filter((record) => record.isActive !== false)
      .map((record) => localizeCmsSignal(record, lang))
      .filter((record): record is SignalItem => !!record)
  );
}

function parseEnabledProviders() {
  const raw = process.env.SIGNAL_EXTERNAL_PROVIDERS || "";
  return new Set(
    raw
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean) as SignalExternalProviderKey[]
  );
}

async function fetchProviderRecords(_provider: SignalExternalProvider, _options: SignalFetchBaseOptions): Promise<ExternalSignalRecord[]> {
  return [];
}

async function fetchExternalSignals(options: SignalFetchBaseOptions) {
  const enabledProviders = parseEnabledProviders();
  if (!enabledProviders.size) {
    return [] as SignalItem[];
  }

  const merged: SignalItem[] = [];

  for (const provider of signalExternalProviders) {
    if (!enabledProviders.has(provider.key)) continue;

    try {
      const records = await fetchProviderRecords(provider, options);
      const normalized = records
        .map((record) => normalizeExternalSignal(provider, record, options.lang))
        .filter((record): record is SignalItem => !!record);

      merged.push(...normalized);
    } catch (error) {
      console.warn(`[signals] external provider ${provider.key} failed`, error);
    }
  }

  return sortSignals(merged);
}

function getFallbackSignalsForScope(options: SignalMergeOptions) {
  const limit = options.limit ?? 3;
  const fallbackItems = sortSignals(
    fallbackSignals
      .filter((record) => record.isActive !== false)
      .map((record) => localizeFallbackSignal(record, options.lang))
      .filter((record) => hasRequiredSignalSource(record.source, record.sourceUrl, record.date))
  );

  const scoped = fallbackItems.filter((item) => {
    if (options.scope === "homepage") {
      return item.showOnHomepage;
    }

    if (options.scope === "article") {
      return item.relatedAnalysis?.id === options.relatedAnalysisId ||
        item.relatedAnalysis?.slug === options.relatedAnalysisSlug;
    }

    return normalizeSectionSlug(item.relatedSection || "") === normalizeSectionSlug(options.section || "analysis");
  });

  return scoped.slice(0, limit);
}

async function fetchSignalsWithFallback(options: SignalMergeOptions, cmsQuery: string) {
  const limit = options.limit ?? 3;
  const cmsSignals = await fetchCmsSignals(cmsQuery, options.lang);
  const externalSignals = await fetchExternalSignals(options);
  const fallbackItems = getFallbackSignalsForScope(options);

  return mergeSignalItems(
    cmsSignals,
    mergeSignalItems(externalSignals, fallbackItems, limit),
    limit
  );
}

export async function fetchHomepageSignals(lang: Lang, limit = 3) {
  return fetchSignalsWithFallback(
    {
      lang,
      limit,
      scope: "homepage",
      section: "analysis"
    },
    "filters[isActive][$eq]=true&filters[showOnHomepage][$eq]=true&sort[0]=order:asc&sort[1]=date:desc"
  );
}

export async function fetchAnalysisSignals(lang: Lang, limit = 4) {
  return fetchSignalsWithFallback(
    {
      lang,
      limit,
      scope: "analysis",
      section: "analysis"
    },
    "filters[isActive][$eq]=true&filters[relatedSection][$eq]=analysis&sort[0]=order:asc&sort[1]=date:desc"
  );
}

export async function fetchSignalsForAnalysisArticle(lang: Lang, relatedAnalysisId: number, relatedAnalysisSlug: string, limit = 3) {
  return fetchSignalsWithFallback(
    {
      lang,
      limit,
      scope: "article",
      relatedAnalysisId,
      relatedAnalysisSlug,
      section: "analysis"
    },
    `filters[isActive][$eq]=true&filters[relatedAnalysis][id][$eq]=${relatedAnalysisId}&sort[0]=order:asc&sort[1]=date:desc`
  );
}

export function getSignalExternalProviders() {
  return [...signalExternalProviders];
}
