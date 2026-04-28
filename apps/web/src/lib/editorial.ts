import { getAuthorNames, localizeArticle } from "@/lib/content";
import type { Lang } from "@/lib/i18n";
import { strapiGet, unwrapStrapiCollection, unwrapStrapiSingle } from "@/lib/strapi";

export type EditorialControl = {
  isFeatured: boolean;
  isBreaking: boolean;
  isTrending: boolean;
  priority: number;
};

export type EditorialBadge = {
  key: "featured" | "breaking" | "trending";
  label: string;
};

type EditorialRecord = {
  editorialControl?: unknown;
  publishedAt?: string;
};

type NamedEntity = {
  id?: number | string;
  name?: string;
  slug?: string;
};

export type PublishedArticle = {
  id: number;
  title: string;
  subtitle?: string;
  content?: string;
  slug: string;
  section?: string;
  publishedAt?: string;
  year?: number;
  focus?: string;
  style?: string;
  signalText?: string;
  title_en?: string;
  title_tr?: string;
  title_fr?: string;
  title_de?: string;
  subtitle_en?: string;
  subtitle_tr?: string;
  subtitle_fr?: string;
  subtitle_de?: string;
  content_en?: string;
  content_tr?: string;
  content_fr?: string;
  content_de?: string;
  signalText_en?: string;
  signalText_tr?: string;
  signalText_fr?: string;
  signalText_de?: string;
  authors?: unknown;
  topics?: unknown;
  locations?: unknown;
  cover?: {
    url?: string;
    formats?: {
      large?: { url?: string };
      medium?: { url?: string };
      small?: { url?: string };
      thumbnail?: { url?: string };
    };
  };
  editorialControl?: unknown;
};

type PublishedArticleFilters = {
  q?: string;
  section?: string;
  year?: string;
  author?: string;
  topic?: string;
  style?: string;
  location?: string;
  sort?: "newest" | "oldest";
};

export type HomepageImpactMetrics = {
  articlesCount: number;
  topicsCount: number;
  authorsCount: number;
  recentArticlesCount: number;
};

type CountResponse = {
  data?: unknown;
  meta?: {
    pagination?: {
      total?: number;
    };
  };
} | null;

const ARTICLE_POPULATE_QUERY =
  "populate[0]=authors&populate[1]=cover&populate[2]=topics&populate[3]=locations&populate[4]=editorialControl";

function normalizeValue(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function stripMarkup(value?: string) {
  return (value || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getRelationRecords(value: unknown) {
  return unwrapStrapiCollection<NamedEntity>(value)
    .map((item) => ({
      id: item.id,
      name: item.name?.trim() || "",
      slug: item.slug?.trim() || ""
    }))
    .filter((item) => item.name || item.slug);
}

function extractCollectionTotal(response: CountResponse) {
  const total = response?.meta?.pagination?.total;
  if (typeof total === "number" && Number.isFinite(total)) {
    return total;
  }

  return unwrapStrapiCollection<Record<string, unknown>>(response).length;
}

export function getArticleYear(article: Pick<PublishedArticle, "publishedAt" | "year">) {
  if (typeof article.year === "number" && Number.isFinite(article.year)) {
    return article.year;
  }

  if (article.publishedAt) {
    const parsed = new Date(article.publishedAt).getFullYear();
    if (Number.isFinite(parsed)) return parsed;
  }

  return null;
}

export async function fetchPublishedArticles(lang: Lang, pageSize = 160): Promise<PublishedArticle[]> {
  const response = await strapiGet<{ data?: unknown }>(
    `/api/articles?${ARTICLE_POPULATE_QUERY}&sort[0]=publishedAt:desc&pagination[pageSize]=${pageSize}&filters[publishedAt][$notNull]=true`
  );

  return unwrapStrapiCollection<PublishedArticle>(response)
    .map((item) => localizeArticle(item, lang))
    .filter((item) => Boolean(item.slug && item.title));
}

export async function fetchHomepageImpactMetrics(): Promise<HomepageImpactMetrics> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const fetchOpts = { next: { revalidate: 60 as const } };

  const [articlesRes, topicsRes, authorsRes, recentArticlesRes] = await Promise.all([
    strapiGet<CountResponse>(
      "/api/articles?filters[publishedAt][$notNull]=true&pagination[page]=1&pagination[pageSize]=1&pagination[withCount]=true",
      fetchOpts
    ),
    strapiGet<CountResponse>(
      "/api/topics?pagination[page]=1&pagination[pageSize]=1&pagination[withCount]=true",
      fetchOpts
    ),
    strapiGet<CountResponse>(
      "/api/authors?pagination[page]=1&pagination[pageSize]=1&pagination[withCount]=true",
      fetchOpts
    ),
    strapiGet<CountResponse>(
      `/api/articles?filters[publishedAt][$gte]=${encodeURIComponent(sevenDaysAgo)}&pagination[page]=1&pagination[pageSize]=1&pagination[withCount]=true`,
      fetchOpts
    )
  ]);

  return {
    articlesCount: extractCollectionTotal(articlesRes),
    topicsCount: extractCollectionTotal(topicsRes),
    authorsCount: extractCollectionTotal(authorsRes),
    recentArticlesCount: extractCollectionTotal(recentArticlesRes)
  };
}

export function filterPublishedArticles(
  articles: PublishedArticle[],
  {
    q = "",
    section = "",
    year = "",
    author = "",
    topic = "",
    style = "",
    location = "",
    sort = "newest"
  }: PublishedArticleFilters
) {
  const normalizedQuery = normalizeValue(q);
  const normalizedSection = normalizeValue(section);
  const normalizedYear = normalizeValue(year);
  const normalizedAuthor = normalizeValue(author);
  const normalizedTopic = normalizeValue(topic);
  const normalizedStyle = normalizeValue(style);
  const normalizedLocation = normalizeValue(location);

  const filtered = articles.filter((article) => {
    const articleAuthors = getAuthorNames(article.authors);
    const articleTopics = getRelationRecords(article.topics);
    const articleLocations = getRelationRecords(article.locations);
    const articleYear = getArticleYear(article);

    if (normalizedSection && normalizeValue(article.section || "") !== normalizedSection) {
      return false;
    }

    if (normalizedYear && normalizeValue(String(articleYear || "")) !== normalizedYear) {
      return false;
    }

    if (normalizedStyle && normalizeValue(article.style || "") !== normalizedStyle) {
      return false;
    }

    if (
      normalizedAuthor &&
      !articleAuthors.some((name) => normalizeValue(name) === normalizedAuthor) &&
      !getRelationRecords(article.authors).some((item) => normalizeValue(item.slug) === normalizedAuthor)
    ) {
      return false;
    }

    if (
      normalizedTopic &&
      !articleTopics.some((item) => normalizeValue(item.name) === normalizedTopic || normalizeValue(item.slug) === normalizedTopic)
    ) {
      return false;
    }

    if (
      normalizedLocation &&
      !articleLocations.some((item) => normalizeValue(item.name) === normalizedLocation || normalizeValue(item.slug) === normalizedLocation)
    ) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const haystack = normalizeValue([
      article.title,
      article.subtitle,
      article.focus,
      article.style,
      stripMarkup(article.content),
      ...articleAuthors,
      ...articleTopics.map((item) => item.name),
      ...articleLocations.map((item) => item.name)
    ].filter(Boolean).join(" "));

    return haystack.includes(normalizedQuery);
  });

  return filtered.sort((left, right) => {
    const delta = getPublishedScore(right.publishedAt) - getPublishedScore(left.publishedAt);
    return sort === "oldest" ? -delta : delta;
  });
}

function toBoolean(value: unknown) {
  return value === true;
}

function toNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function getBadgeLabels(lang: Lang) {
  return lang === "en"
    ? { featured: "Featured", breaking: "Breaking", trending: "Trending" }
    : lang === "tr"
      ? { featured: "One Cikan", breaking: "Son Dakika", trending: "Gundemde" }
      : lang === "fr"
        ? { featured: "A la une", breaking: "Urgent", trending: "Tendance" }
        : lang === "de"
          ? { featured: "Im Fokus", breaking: "Eilmeldung", trending: "Im Trend" }
          : {
              featured: "Istaknuto",
              breaking: "Udarno",
              trending: "U trendu"
            };
}

function getPublishedScore(value?: string) {
  const score = Date.parse(value || "");
  return Number.isFinite(score) ? score : 0;
}

export function getEditorialControl(record?: EditorialRecord | null): EditorialControl {
  const value = unwrapStrapiSingle<Partial<EditorialControl>>(record?.editorialControl);

  return {
    isFeatured: toBoolean(value?.isFeatured),
    isBreaking: toBoolean(value?.isBreaking),
    isTrending: toBoolean(value?.isTrending),
    priority: toNumber(value?.priority)
  };
}

export function hasEditorialSignal(record?: EditorialRecord | null) {
  const control = getEditorialControl(record);
  return control.isFeatured || control.isBreaking || control.isTrending || control.priority !== 0;
}

export function compareEditorialArticles<T extends EditorialRecord>(left: T, right: T) {
  const a = getEditorialControl(left);
  const b = getEditorialControl(right);

  if (a.isFeatured !== b.isFeatured) return Number(b.isFeatured) - Number(a.isFeatured);
  if (a.priority !== b.priority) return b.priority - a.priority;
  if (a.isBreaking !== b.isBreaking) return Number(b.isBreaking) - Number(a.isBreaking);
  if (a.isTrending !== b.isTrending) return Number(b.isTrending) - Number(a.isTrending);

  return getPublishedScore(right.publishedAt) - getPublishedScore(left.publishedAt);
}

export function getEditorialBadges(record: EditorialRecord | null | undefined, lang: Lang): EditorialBadge[] {
  const control = getEditorialControl(record);
  const labels = getBadgeLabels(lang);
  const badges: EditorialBadge[] = [];

  if (control.isBreaking) {
    badges.push({ key: "breaking", label: labels.breaking });
  }

  if (control.isFeatured) {
    badges.push({ key: "featured", label: labels.featured });
  }

  if (control.isTrending) {
    badges.push({ key: "trending", label: labels.trending });
  }

  return badges;
}
