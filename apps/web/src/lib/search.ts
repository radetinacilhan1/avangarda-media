import { fetchTeamMembers } from "@/lib/about";
import { getAuthorNames } from "@/lib/content";
import { fetchDocumentaryArchive, getDocumentaryUiCopy } from "@/lib/documentaries";
import { fetchPublishedArticles, filterPublishedArticles } from "@/lib/editorial";
import { fetchGalleryArchive, getGalleryHref, getGalleryLabel } from "@/lib/galleries";
import { fetchHumanRightsCatalog, fetchLegalResources, getHumanRightsCopy } from "@/lib/human-rights";
import { getSectionLabel, type Lang, withLang } from "@/lib/i18n";
import { SEARCH_QUERY_MAX_LENGTH, sanitizeSectionInput, sanitizeTextInput, sanitizeYearInput } from "@/lib/security";
import { normalizeSectionSlug } from "@/lib/sections";
import { normalizeSerbianLatin } from "@/lib/serbian-latin";
import { buildStoryMapData, getStoryMapLabel, getStoryMapLocationLink } from "@/lib/story-map";

export type SearchHit = {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  content?: string;
  slug: string;
  href: string;
  external?: boolean;
  typeLabel: string;
  contextLabel?: string;
  section?: string;
  publishedAt?: string;
  authors?: string[];
};

type SearchArgs = {
  q?: string;
  section?: string;
  year?: string;
  lang: Lang;
};

type SearchType =
  | "article"
  | "person"
  | "humanRight"
  | "legalResource"
  | "gallery"
  | "documentary"
  | "location";

const SEARCH_RESULT_LIMIT = 24;

const searchTypeLabels: Record<Lang, Record<SearchType, string>> = {
  sr: {
    article: "Članak",
    person: "Autor",
    humanRight: "Pravo",
    legalResource: "Pravni kompas",
    gallery: "Galerija",
    documentary: "Dokumentarac",
    location: "Lokacija",
  },
  en: {
    article: "Article",
    person: "Author",
    humanRight: "Right",
    legalResource: "Legal compass",
    gallery: "Gallery",
    documentary: "Documentary",
    location: "Location",
  },
  tr: {
    article: "Yazi",
    person: "Yazar",
    humanRight: "Hak",
    legalResource: "Hukuk pusulasi",
    gallery: "Galeri",
    documentary: "Belgesel",
    location: "Konum",
  },
  fr: {
    article: "Article",
    person: "Auteur",
    humanRight: "Droit",
    legalResource: "Boussole juridique",
    gallery: "Galerie",
    documentary: "Documentaire",
    location: "Lieu",
  },
  de: {
    article: "Artikel",
    person: "Autor",
    humanRight: "Recht",
    legalResource: "Rechtskompass",
    gallery: "Galerie",
    documentary: "Dokumentarfilm",
    location: "Ort",
  },
  es: {
    article: "Artículo",
    person: "Autor",
    humanRight: "Derecho",
    legalResource: "Brújula legal",
    gallery: "Galería",
    documentary: "Documental",
    location: "Lugar",
  },
  el: {
    article: "Άρθρο",
    person: "Συντάκτης",
    humanRight: "Δικαίωμα",
    legalResource: "Νομική πυξίδα",
    gallery: "Γκαλερί",
    documentary: "Ντοκιμαντέρ",
    location: "Τοποθεσία",
  },
  ar: {
    article: "مقال",
    person: "كاتب",
    humanRight: "حق",
    legalResource: "البوصلة القانونية",
    gallery: "معرض",
    documentary: "وثائقي",
    location: "موقع",
  },
};

function normalizeSearchText(value: string) {
  return normalizeSerbianLatin(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function includesQuery(fields: Array<string | undefined>, normalizedQuery: string) {
  if (!normalizedQuery) return true;

  const haystack = normalizeSearchText(fields.filter(Boolean).join(" "));
  return haystack.includes(normalizedQuery);
}

function scoreMatch(fields: Array<string | undefined>, normalizedQuery: string) {
  const haystack = normalizeSearchText(fields.filter(Boolean).join(" "));
  if (!normalizedQuery || !haystack) return 0;
  if (haystack === normalizedQuery) return 240;
  if (haystack.startsWith(normalizedQuery)) return 180;
  if (haystack.includes(normalizedQuery)) return 120;
  return 0;
}

function getTypeLabel(type: SearchType, lang: Lang) {
  return searchTypeLabels[lang][type];
}

function buildArticleHits(lang: Lang, articles: Awaited<ReturnType<typeof fetchPublishedArticles>>) {
  return articles.map((article) => ({
    id: `article_${article.id}`,
    type: "article" as const,
    title: article.title,
    subtitle: article.subtitle,
    content: article.content,
    slug: article.slug,
    href: withLang(`/a/${article.slug}`, lang),
    typeLabel: getTypeLabel("article", lang),
    contextLabel: article.section ? getSectionLabel(article.section, lang) : undefined,
    section: article.section,
    publishedAt: article.publishedAt,
    authors: getAuthorNames(article.authors),
  }));
}

export async function searchContent({ q = "", section = "", year = "", lang }: SearchArgs) {
  const query = sanitizeTextInput(q, SEARCH_QUERY_MAX_LENGTH);
  const normalizedQuery = normalizeSearchText(query);
  const normalizedSection = normalizeSectionSlug(sanitizeSectionInput(section));
  const normalizedYear = sanitizeYearInput(year);
  const directArticles = await fetchPublishedArticles(lang, 120);

  if (!query && !normalizedSection && !normalizedYear) {
    const hits = buildArticleHits(lang, directArticles).slice(0, SEARCH_RESULT_LIMIT);

    return { hits, total: directArticles.length };
  }

  const filtered = filterPublishedArticles(directArticles, {
    q: query,
    section: normalizedSection,
    year: normalizedYear,
  });

  if (!query || normalizedSection || normalizedYear) {
    return {
      hits: buildArticleHits(lang, filtered).slice(0, SEARCH_RESULT_LIMIT),
      total: filtered.length
    };
  }

  const [teamMembers, rightsCatalog, legalResources, galleries, documentaries] = await Promise.all([
    fetchTeamMembers(lang),
    fetchHumanRightsCatalog(lang),
    fetchLegalResources(lang),
    fetchGalleryArchive(lang),
    fetchDocumentaryArchive(lang),
  ]);

  const storyMap = buildStoryMapData({
    articles: directArticles,
    documentaries,
    lang,
  });

  const humanRightsCopy = getHumanRightsCopy(lang);
  const documentaryCopy = getDocumentaryUiCopy(lang);
  const galleryLabel = getGalleryLabel(lang);
  const storyMapLabel = getStoryMapLabel(lang);

  const hits: Array<SearchHit & { score: number }> = [];

  hits.push(
    ...buildArticleHits(lang, filtered)
      .map((hit) => ({
        ...hit,
        score:
          scoreMatch([hit.title], normalizedQuery) +
          scoreMatch([hit.subtitle], normalizedQuery) / 2 +
          scoreMatch([hit.content], normalizedQuery) / 4 +
          24,
      }))
      .filter((hit) => hit.score > 0)
  );

  hits.push(
    ...teamMembers
      .filter((member) =>
        includesQuery([member.fullName, member.role, member.shortBio, member.location, member.longBio], normalizedQuery)
      )
      .map((member) => ({
        id: `person_${member.id}`,
        type: "person",
        title: member.fullName,
        subtitle: member.role,
        content: member.shortBio,
        slug: member.slug,
        href: withLang(`/people/${member.slug}`, lang),
        typeLabel: getTypeLabel("person", lang),
        contextLabel: member.location,
        score:
          scoreMatch([member.fullName], normalizedQuery) +
          scoreMatch([member.role, member.location], normalizedQuery) / 2 +
          scoreMatch([member.shortBio, member.longBio], normalizedQuery) / 5 +
          18,
      }))
  );

  hits.push(
    ...rightsCatalog
      .filter((right) => includesQuery([right.title, right.shortDescription], normalizedQuery))
      .map((right) => ({
        id: `human-right_${right.id}`,
        type: "humanRight",
        title: right.title,
        subtitle: right.shortDescription,
        slug: right.slug,
        href: withLang(`/ljudska-prava/${right.slug}`, lang),
        typeLabel: getTypeLabel("humanRight", lang),
        contextLabel: humanRightsCopy.humanRightsLabel,
        score:
          scoreMatch([right.title], normalizedQuery) +
          scoreMatch([right.shortDescription], normalizedQuery) / 3 +
          16,
      }))
  );

  hits.push(
    ...legalResources
      .filter((resource) =>
        includesQuery(
          [resource.title, resource.shortDescription, resource.legalArea, resource.countryOrFramework],
          normalizedQuery
        )
      )
      .map((resource) => ({
        id: `legal-resource_${resource.id}`,
        type: "legalResource",
        title: resource.title,
        subtitle: resource.shortDescription,
        content: resource.legalArea,
        slug: resource.slug,
        href: withLang(`/pravni-kompas/${resource.slug}`, lang),
        typeLabel: getTypeLabel("legalResource", lang),
        contextLabel: resource.legalArea || humanRightsCopy.legalCompassLabel,
        score:
          scoreMatch([resource.title], normalizedQuery) +
          scoreMatch([resource.shortDescription, resource.legalArea], normalizedQuery) / 3 +
          15,
      }))
  );

  hits.push(
    ...galleries
      .filter((gallery) =>
        includesQuery(
          [
            gallery.title,
            gallery.description,
            gallery.locationSummary,
            gallery.topics.map((topic) => topic.name).join(" "),
          ],
          normalizedQuery
        )
      )
      .map((gallery) => ({
        id: `gallery_${gallery.id}`,
        type: "gallery",
        title: gallery.title,
        subtitle: gallery.locationSummary,
        content: gallery.description,
        slug: gallery.slug,
        href: withLang(getGalleryHref(gallery.slug), lang),
        typeLabel: getTypeLabel("gallery", lang),
        contextLabel: galleryLabel,
        publishedAt: gallery.galleryDate || gallery.publishedAt,
        score:
          scoreMatch([gallery.title], normalizedQuery) +
          scoreMatch([gallery.description, gallery.locationSummary], normalizedQuery) / 3 +
          14,
      }))
  );

  hits.push(
    ...documentaries
      .filter((documentary) =>
        includesQuery([documentary.title, documentary.description, documentary.location, documentary.director], normalizedQuery)
      )
      .map((documentary) => ({
        id: `documentary_${documentary.id}`,
        type: "documentary",
        title: documentary.title,
        subtitle: documentary.description,
        slug: documentary.slug,
        href: documentary.externalUrl || withLang("/dokumentarci", lang),
        external: Boolean(documentary.externalUrl),
        typeLabel: getTypeLabel("documentary", lang),
        contextLabel: documentary.location || documentaryCopy.label,
        publishedAt: documentary.date,
        authors: documentary.director ? [documentary.director] : undefined,
        score:
          scoreMatch([documentary.title], normalizedQuery) +
          scoreMatch([documentary.description, documentary.location, documentary.director], normalizedQuery) / 3 +
          13,
      }))
  );

  hits.push(
    ...storyMap.groups
      .filter((group) =>
        includesQuery(
          [
            group.name,
            group.canonicalName,
            group.country,
            group.region,
            group.entries.map((entry) => entry.title).join(" "),
          ],
          normalizedQuery
        )
      )
      .map((group) => ({
        id: `location_${group.slug}`,
        type: "location",
        title: group.name,
        subtitle: [group.region, group.country].filter(Boolean).join(" / ") || undefined,
        content: group.entries.slice(0, 3).map((entry) => entry.title).join(" • "),
        slug: group.slug,
        href: getStoryMapLocationLink(group.slug, lang),
        typeLabel: getTypeLabel("location", lang),
        contextLabel: storyMapLabel,
        score:
          scoreMatch([group.name, group.canonicalName], normalizedQuery) +
          scoreMatch([group.region, group.country], normalizedQuery) / 2 +
          scoreMatch(group.entries.map((entry) => entry.title), normalizedQuery) / 6 +
          11,
      }))
  );

  return {
    hits: hits
      .sort((left, right) => right.score - left.score || (Date.parse(right.publishedAt || "") || 0) - (Date.parse(left.publishedAt || "") || 0))
      .slice(0, SEARCH_RESULT_LIMIT),
    total: hits.length
  };
}
