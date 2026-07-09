import type { Lang } from "@/lib/i18n";
import { withLang } from "@/lib/i18n";
import { strapiGet, unwrapStrapiCollection, unwrapStrapiSingle, getStrapiMediaUrl } from "@/lib/strapi";

type LocalizedRecord = Record<string, unknown>;

const localizedSuffix: Record<Exclude<Lang, "sr">, string> = {
  en: "_en",
  tr: "_tr",
  fr: "_fr",
  de: "_de",
  es: "_es",
  el: "_el",
  ar: "_ar",
};

export type HumanRightCategoryKey =
  | "whatAreRights"
  | "everydayLife"
  | "catalog"
  | "rightsInSerbia"
  | "legalCompass"
  | "internationalFramework";

export type LegalResourceType =
  | "law"
  | "guide"
  | "template"
  | "explainer"
  | "international_document"
  | "official_source"
  | "other";

export type LegalResourceFramework =
  | "serbia"
  | "regional"
  | "international"
  | "eu"
  | "council_of_europe"
  | "un"
  | "other";

export type ResourceLinkCard = {
  title: string;
  description: string;
  href: string;
  linkLabel: string;
  key?: HumanRightCategoryKey | string;
};

export type HumanRightSummary = {
  id: number | string;
  title: string;
  slug: string;
  shortDescription: string;
  isFeatured: boolean;
};

export type ArticleRelationSummary = {
  id: number | string;
  title: string;
  slug: string;
  section?: string;
  publishedAt?: string;
};

export type TopicRelationSummary = {
  id: number | string;
  name: string;
  slug: string;
};

export type LocationRelationSummary = {
  id: number | string;
  name: string;
  slug: string;
  country?: string;
  region?: string;
};

export type LegalResourceSummary = {
  id: number | string;
  title: string;
  slug: string;
  shortDescription: string;
  type: LegalResourceType;
  countryOrFramework: LegalResourceFramework;
  legalArea: string;
};

export type HumanRightItem = HumanRightSummary & {
  body: string;
  whatItMeans: string;
  whyItMatters: string;
  everydayExamples: string;
  legalBasis: string;
  internationalFramework: string;
  serbiaFramework: string;
  iconLabel: string;
  relatedLegalResources: LegalResourceSummary[];
  relatedArticles: ArticleRelationSummary[];
  relatedTopics: TopicRelationSummary[];
  relatedLocations: LocationRelationSummary[];
};

export type LegalResourceItem = LegalResourceSummary & {
  body: string;
  whatIsThisFor: string;
  whoCanUseIt: string;
  whenToUseIt: string;
  officialSourceUrl: string;
  sourceName: string;
  pdfUrl: string;
  downloadableUrl: string;
  fileLabel: string;
  dateUpdated?: string;
  isFeatured: boolean;
  tags: TopicRelationSummary[];
  relatedHumanRights: HumanRightSummary[];
  relatedArticles: ArticleRelationSummary[];
  relatedTopics: TopicRelationSummary[];
  relatedLocations: LocationRelationSummary[];
};

export type HumanRightsPageData = {
  title: string;
  slug: string;
  heroText: string;
  introText: string;
  body: string;
  cards: ResourceLinkCard[];
};

export type HumanRightsCopy = {
  humanRightsLabel: string;
  legalCompassLabel: string;
  heroTitle: string;
  heroText: string;
  introText: string;
  introSectionLabel: string;
  everydaySectionLabel: string;
  rightsCatalogLabel: string;
  rightsCatalogTitle: string;
  rightsCatalogCopy: string;
  legalCompassSectionTitle: string;
  legalCompassSectionCopy: string;
  cards: Record<HumanRightCategoryKey, Omit<ResourceLinkCard, "href" | "key">>;
  openSectionLabel: string;
  openRightLabel: string;
  openResourceLabel: string;
  browseResourcesLabel: string;
  linkedStoriesLabel: string;
  relatedResourcesLabel: string;
  relatedRightsLabel: string;
  relatedTopicsLabel: string;
  relatedLocationsLabel: string;
  relatedArticlesLabel: string;
  legalAreaLabel: string;
  resourceTypeLabel: string;
  frameworkLabel: string;
  connectedRightsLabel: string;
  officialSourceLabel: string;
  openSourceLabel: string;
  openPdfLabel: string;
  downloadPdfLabel: string;
  downloadDocumentLabel: string;
  updatedLabel: string;
  searchResourcesLabel: string;
  searchResourcesPlaceholder: string;
  allTypesLabel: string;
  allAreasLabel: string;
  allFrameworksLabel: string;
  allRightsLabel: string;
  clearFiltersLabel: string;
  noRightsTitle: string;
  noRightsCopy: string;
  noResourcesTitle: string;
  noResourcesCopy: string;
  noResultsTitle: string;
  noResultsCopy: string;
  notFoundTitle: string;
  notFoundCopy: string;
  disclaimer: string;
  disclaimerCompact: string;
  whatItMeansLabel: string;
  whyItMattersLabel: string;
  everydayExamplesLabel: string;
  legalBasisLabel: string;
  serbiaFrameworkLabel: string;
  internationalFrameworkLabel: string;
  whatIsThisForLabel: string;
  whoCanUseItLabel: string;
  whenToUseItLabel: string;
  fallbackExplain: string;
  fallbackEverydayLife: string;
};

type HumanRightsPageRecord = LocalizedRecord & {
  title?: string;
  slug?: string;
  heroText?: string;
  introText?: string;
  body?: string;
  cards?: unknown;
};

type HumanRightRecord = LocalizedRecord & {
  id?: number | string;
  title?: string;
  slug?: string;
  shortDescription?: string;
  body?: string;
  whatItMeans?: string;
  whyItMatters?: string;
  everydayExamples?: string;
  legalBasis?: string;
  internationalFramework?: string;
  serbiaFramework?: string;
  iconLabel?: string;
  isFeatured?: boolean;
  relatedLegalResources?: unknown;
  relatedArticles?: unknown;
  relatedTopics?: unknown;
  relatedLocations?: unknown;
};

type LegalResourceRecord = LocalizedRecord & {
  id?: number | string;
  title?: string;
  slug?: string;
  type?: LegalResourceType;
  legalArea?: string;
  countryOrFramework?: LegalResourceFramework;
  shortDescription?: string;
  body?: string;
  whatIsThisFor?: string;
  whoCanUseIt?: string;
  whenToUseIt?: string;
  officialSourceUrl?: string;
  sourceName?: string;
  fileLabel?: string;
  dateUpdated?: string;
  isFeatured?: boolean;
  pdfFile?: unknown;
  downloadableFile?: unknown;
  tags?: unknown;
  relatedHumanRights?: unknown;
  relatedArticles?: unknown;
  relatedTopics?: unknown;
  relatedLocations?: unknown;
};

type CardRecord = LocalizedRecord & {
  title?: string;
  description?: string;
  href?: string;
  linkLabel?: string;
};

type MediaRecord = {
  url?: string;
};

type CopyRecord = Record<Lang, HumanRightsCopy>;

function normalizeText(value?: string) {
  return typeof value === "string" ? value.trim() : "";
}

function buildFallbackId(...parts: Array<string | number | undefined>) {
  return parts
    .map((part) => String(part || "").trim())
    .filter(Boolean)
    .join(":");
}

function pickLocalizedValue(record: LocalizedRecord, field: string, lang: Lang) {
  const baseValue = normalizeText(typeof record[field] === "string" ? (record[field] as string) : "");
  if (lang === "sr") return baseValue;

  const translatedValue = normalizeText(typeof record[`${field}${localizedSuffix[lang]}`] === "string" ? (record[`${field}${localizedSuffix[lang]}`] as string) : "");
  return translatedValue || baseValue;
}

function normalizeInternalHref(href: string, lang: Lang) {
  const trimmed = href.trim();
  if (!trimmed) return withLang("/ljudska-prava", lang);
  if (/^(https?:)?\/\//i.test(trimmed) || trimmed.startsWith("mailto:") || trimmed.startsWith("tel:")) {
    return trimmed;
  }
  if (trimmed.startsWith("#")) {
    return `${withLang("/ljudska-prava", lang)}${trimmed}`;
  }
  return withLang(trimmed.startsWith("/") ? trimmed : `/${trimmed}`, lang);
}

function getMediaUrl(value: unknown) {
  const media = unwrapStrapiSingle<MediaRecord>(value);
  return media?.url ? getStrapiMediaUrl(media.url) : "";
}

function buildTopicSummaries(value: unknown, lang: Lang): TopicRelationSummary[] {
  return unwrapStrapiCollection<LocalizedRecord & { id?: number | string; name?: string; slug?: string }>(value)
    .map((item) => ({
      id: item.id || buildFallbackId("topic", item.slug, item.name),
      name: pickLocalizedValue(item, "name", lang),
      slug: normalizeText(item.slug),
    }))
    .filter((item) => item.name && item.slug);
}

function buildLocationSummaries(value: unknown, lang: Lang): LocationRelationSummary[] {
  return unwrapStrapiCollection<LocalizedRecord & { id?: number | string; name?: string; slug?: string; country?: string; region?: string }>(value)
    .map((item) => ({
      id: item.id || buildFallbackId("location", item.slug, item.name),
      name: pickLocalizedValue(item, "name", lang),
      slug: normalizeText(item.slug),
      country: normalizeText(item.country),
      region: normalizeText(item.region),
    }))
    .filter((item) => item.name && item.slug);
}

function buildArticleSummaries(value: unknown, lang: Lang): ArticleRelationSummary[] {
  return unwrapStrapiCollection<LocalizedRecord & { id?: number | string; title?: string; slug?: string; section?: string; publishedAt?: string }>(value)
    .map((item) => ({
      id: item.id || buildFallbackId("article", item.slug, item.title),
      title: pickLocalizedValue(item, "title", lang),
      slug: normalizeText(item.slug),
      section: normalizeText(item.section),
      publishedAt: normalizeText(item.publishedAt),
    }))
    .filter((item) => item.title && item.slug);
}

function buildHumanRightSummaries(value: unknown, lang: Lang): HumanRightSummary[] {
  return unwrapStrapiCollection<HumanRightRecord>(value)
    .map((item) => ({
      id: item.id || buildFallbackId("human-right", item.slug, item.title),
      title: pickLocalizedValue(item, "title", lang),
      slug: normalizeText(item.slug),
      shortDescription: pickLocalizedValue(item, "shortDescription", lang),
      isFeatured: item.isFeatured === true,
    }))
    .filter((item) => item.title && item.slug);
}

function buildLegalResourceSummaries(value: unknown, lang: Lang): LegalResourceSummary[] {
  return unwrapStrapiCollection<LegalResourceRecord>(value)
    .map((item) => ({
      id: item.id || buildFallbackId("legal-resource", item.slug, item.title),
      title: pickLocalizedValue(item, "title", lang),
      slug: normalizeText(item.slug),
      shortDescription: pickLocalizedValue(item, "shortDescription", lang),
      type: (item.type || "other") as LegalResourceType,
      countryOrFramework: (item.countryOrFramework || "other") as LegalResourceFramework,
      legalArea: pickLocalizedValue(item, "legalArea", lang),
    }))
    .filter((item) => item.title && item.slug);
}

function localizeCard(record: CardRecord, lang: Lang): ResourceLinkCard {
  return {
    title: pickLocalizedValue(record, "title", lang),
    description: pickLocalizedValue(record, "description", lang),
    href: normalizeInternalHref(normalizeText(record.href), lang),
    linkLabel: pickLocalizedValue(record, "linkLabel", lang),
  };
}

function localizeHumanRightsPage(record: HumanRightsPageRecord, lang: Lang, copy: HumanRightsCopy): HumanRightsPageData {
  const cards = unwrapStrapiCollection<CardRecord>(record.cards).map((card) => localizeCard(card, lang));
  return {
    title: pickLocalizedValue(record, "title", lang) || copy.humanRightsLabel,
    slug: normalizeText(record.slug) || "ljudska-prava",
    heroText: pickLocalizedValue(record, "heroText", lang) || copy.heroText,
    introText: pickLocalizedValue(record, "introText", lang) || copy.introText,
    body: pickLocalizedValue(record, "body", lang),
    cards: cards.length ? cards : buildFallbackCards(lang),
  };
}

function localizeHumanRight(record: HumanRightRecord, lang: Lang): HumanRightItem {
  return {
    id: record.id || buildFallbackId("human-right", record.slug, record.title),
    title: pickLocalizedValue(record, "title", lang),
    slug: normalizeText(record.slug),
    shortDescription: pickLocalizedValue(record, "shortDescription", lang),
    body: pickLocalizedValue(record, "body", lang),
    whatItMeans: pickLocalizedValue(record, "whatItMeans", lang),
    whyItMatters: pickLocalizedValue(record, "whyItMatters", lang),
    everydayExamples: pickLocalizedValue(record, "everydayExamples", lang),
    legalBasis: pickLocalizedValue(record, "legalBasis", lang),
    internationalFramework: pickLocalizedValue(record, "internationalFramework", lang),
    serbiaFramework: pickLocalizedValue(record, "serbiaFramework", lang),
    iconLabel: normalizeText(record.iconLabel),
    isFeatured: record.isFeatured === true,
    relatedLegalResources: buildLegalResourceSummaries(record.relatedLegalResources, lang),
    relatedArticles: buildArticleSummaries(record.relatedArticles, lang),
    relatedTopics: buildTopicSummaries(record.relatedTopics, lang),
    relatedLocations: buildLocationSummaries(record.relatedLocations, lang),
  };
}

function localizeLegalResource(record: LegalResourceRecord, lang: Lang): LegalResourceItem {
  return {
    id: record.id || buildFallbackId("legal-resource", record.slug, record.title),
    title: pickLocalizedValue(record, "title", lang),
    slug: normalizeText(record.slug),
    shortDescription: pickLocalizedValue(record, "shortDescription", lang),
    type: (record.type || "other") as LegalResourceType,
    countryOrFramework: (record.countryOrFramework || "other") as LegalResourceFramework,
    legalArea: pickLocalizedValue(record, "legalArea", lang),
    body: pickLocalizedValue(record, "body", lang),
    whatIsThisFor: pickLocalizedValue(record, "whatIsThisFor", lang),
    whoCanUseIt: pickLocalizedValue(record, "whoCanUseIt", lang),
    whenToUseIt: pickLocalizedValue(record, "whenToUseIt", lang),
    officialSourceUrl: normalizeText(record.officialSourceUrl),
    sourceName: pickLocalizedValue(record, "sourceName", lang),
    pdfUrl: getMediaUrl(record.pdfFile),
    downloadableUrl: getMediaUrl(record.downloadableFile),
    fileLabel: pickLocalizedValue(record, "fileLabel", lang),
    dateUpdated: normalizeText(record.dateUpdated),
    isFeatured: record.isFeatured === true,
    tags: buildTopicSummaries(record.tags, lang),
    relatedHumanRights: buildHumanRightSummaries(record.relatedHumanRights, lang),
    relatedArticles: buildArticleSummaries(record.relatedArticles, lang),
    relatedTopics: buildTopicSummaries(record.relatedTopics, lang),
    relatedLocations: buildLocationSummaries(record.relatedLocations, lang),
  };
}

const humanRightsCopyByLang: CopyRecord = {
  sr: {
    humanRightsLabel: "Ljudska prava",
    legalCompassLabel: "Pravni kompas",
    heroTitle: "Ljudska prava nisu parola. Ona su pitanje kako čovek živi.",
    heroText: "Avangarda otvara prostor u kome se pravni jezik vraća svakodnevnom životu: radu, zdravlju, školi, vazduhu, jeziku, institucijama i dostojanstvu.",
    introText: "Ovo nije pravna baza radi same baze. Ovo je mesto da se razume kako pravo izgleda kada izađe iz zakona i uđe u nečiji život.",
    introSectionLabel: "Šta su ljudska prava?",
    everydaySectionLabel: "Prava u svakodnevnom životu",
    rightsCatalogLabel: "Katalog prava",
    rightsCatalogTitle: "Katalog prava",
    rightsCatalogCopy: "Pojedinačna prava kao mali vodiči: šta znače, zašto su važna i gde se lome u stvarnosti.",
    legalCompassSectionTitle: "Pravni kompas",
    legalCompassSectionCopy: "Zakoni, vodiči, obrasci i zvanični izvori koji pomažu da se pravni jezik poveže sa stvarnim životom.",
    cards: {
      whatAreRights: {
        title: "Šta su ljudska prava?",
        description: "Osnovni okvir: zašto prava postoje i zašto nisu apstraktna fraza.",
        linkLabel: "Otvori objašnjenje",
      },
      everydayLife: {
        title: "Prava u svakodnevnom životu",
        description: "Prava se vide kroz posao, školu, policiju, zdravstvo, vazduh i siromaštvo.",
        linkLabel: "Pogledaj svakodnevni okvir",
      },
      catalog: {
        title: "Katalog prava",
        description: "Pregled pojedinačnih prava koja mogu da se razvijaju kroz zasebne stranice.",
        linkLabel: "Otvori katalog",
      },
      rightsInSerbia: {
        title: "Prava u Srbiji",
        description: "Lokalni zakoni, institucije, obrasci i resursi vezani za prava u Srbiji.",
        linkLabel: "Otvori resurse za Srbiju",
      },
      legalCompass: {
        title: "Pravni kompas",
        description: "Avangardin resursni centar za vodiče, zakone, dokumente i zvanične izvore.",
        linkLabel: "Uđi u Pravni kompas",
      },
      internationalFramework: {
        title: "Međunarodni okvir",
        description: "UN, Savet Evrope, EU i drugi međunarodni dokumenti koji oblikuju polje prava.",
        linkLabel: "Pogledaj međunarodne izvore",
      },
    },
    openSectionLabel: "Otvori sekciju",
    openRightLabel: "Otvori pravo",
    openResourceLabel: "Otvori resurs",
    browseResourcesLabel: "Pretraži pravne resurse",
    linkedStoriesLabel: "Povezani tekstovi",
    relatedResourcesLabel: "Povezani pravni resursi",
    relatedRightsLabel: "Povezana prava",
    relatedTopicsLabel: "Povezane teme",
    relatedLocationsLabel: "Povezane lokacije",
    relatedArticlesLabel: "Povezani tekstovi",
    legalAreaLabel: "Oblast prava",
    resourceTypeLabel: "Tip resursa",
    frameworkLabel: "Država / okvir",
    connectedRightsLabel: "Povezana prava",
    officialSourceLabel: "Zvanični izvor",
    openSourceLabel: "Otvori izvor",
    openPdfLabel: "OTVORI PDF",
    downloadPdfLabel: "PREUZMI PDF",
    downloadDocumentLabel: "Preuzmi dokument",
    updatedLabel: "Ažurirano",
    searchResourcesLabel: "Pretraži pravne resurse",
    searchResourcesPlaceholder: "Traži zakon, vodič, obrazac ili instituciju",
    allTypesLabel: "Svi tipovi",
    allAreasLabel: "Sve oblasti",
    allFrameworksLabel: "Svi okviri",
    allRightsLabel: "Sva prava",
    clearFiltersLabel: "Resetuj filtere",
    noRightsTitle: "Katalog prava se puni.",
    noRightsCopy: "Prva pojedinačna prava biće vidljiva čim budu uneta iz redakcije ili CMS-a.",
    noResourcesTitle: "Pravni kompas se puni.",
    noResourcesCopy: "Prvi vodiči, izvori i obrasci biće dostupni uskoro.",
    noResultsTitle: "Nema rezultata",
    noResultsCopy: "Probaj drugi tip resursa, oblast prava ili širi pojam u pretrazi.",
    notFoundTitle: "Sadržaj još nije dostupan.",
    notFoundCopy: "Ova stranica će biti vidljiva čim bude uneta i objavljena kroz CMS.",
    disclaimer: "Avangarda ne pruža pravno zastupanje. Materijali služe za informisanje i lakše razumevanje prava. Za konkretan pravni postupak obratite se advokatu, pravnoj službi ili nadležnoj instituciji.",
    disclaimerCompact: "Ovaj materijal služi za informisanje.",
    whatItMeansLabel: "Šta ovo pravo znači?",
    whyItMattersLabel: "Zašto je važno?",
    everydayExamplesLabel: "Primeri iz svakodnevnog života",
    legalBasisLabel: "Pravna osnova",
    serbiaFrameworkLabel: "Okvir u Srbiji",
    internationalFrameworkLabel: "Međunarodni okvir",
    whatIsThisForLabel: "Čemu ovo služi?",
    whoCanUseItLabel: "Ko može da koristi?",
    whenToUseItLabel: "Kada se koristi?",
    fallbackExplain: "Ljudska prava nisu dodatak životu posle svega ostalog. Ona određuju šta čovek može da očekuje od države, poslodavca, škole, policije, bolnice i javnog prostora.",
    fallbackEverydayLife: "Kada govorimo o pravima, govorimo o vazduhu koji se diše, plati od koje se živi, jeziku kojim se govori, veri koja se ne kažnjava i dostojanstvu koje ne sme da bude luksuz.",
  },
  en: {
    humanRightsLabel: "Human Rights",
    legalCompassLabel: "Legal Compass",
    heroTitle: "Human rights are not a slogan. They shape how a person lives.",
    heroText: "Avangarda opens a space where legal language returns to everyday life: work, health, school, air, language, institutions and dignity.",
    introText: "This is not a legal database for its own sake. It is a place to understand what rights look like when they leave the law and enter someone's life.",
    introSectionLabel: "What are human rights?",
    everydaySectionLabel: "Rights in everyday life",
    rightsCatalogLabel: "Rights catalog",
    rightsCatalogTitle: "Rights catalog",
    rightsCatalogCopy: "Individual rights as short guides: what they mean, why they matter and where they fracture in reality.",
    legalCompassSectionTitle: "Legal Compass",
    legalCompassSectionCopy: "Laws, guides, templates and official sources that help connect legal language to lived reality.",
    cards: {
      whatAreRights: { title: "What are human rights?", description: "The core frame: why rights exist and why they are not abstract wording.", linkLabel: "Open explainer" },
      everydayLife: { title: "Rights in everyday life", description: "Rights become visible through work, school, police, healthcare, air and poverty.", linkLabel: "See everyday context" },
      catalog: { title: "Rights catalog", description: "A growing set of individual rights with dedicated pages and context.", linkLabel: "Open catalog" },
      rightsInSerbia: { title: "Rights in Serbia", description: "Local laws, institutions, templates and guidance tied to rights in Serbia.", linkLabel: "Open Serbia resources" },
      legalCompass: { title: "Legal Compass", description: "Avangarda's resource space for laws, guides, documents and official sources.", linkLabel: "Enter Legal Compass" },
      internationalFramework: { title: "International framework", description: "UN, Council of Europe, EU and other documents shaping the field of rights.", linkLabel: "See international sources" },
    },
    openSectionLabel: "Open section",
    openRightLabel: "Open right",
    openResourceLabel: "Open resource",
    browseResourcesLabel: "Search legal resources",
    linkedStoriesLabel: "Linked stories",
    relatedResourcesLabel: "Related legal resources",
    relatedRightsLabel: "Related rights",
    relatedTopicsLabel: "Related topics",
    relatedLocationsLabel: "Related locations",
    relatedArticlesLabel: "Related stories",
    legalAreaLabel: "Legal area",
    resourceTypeLabel: "Resource type",
    frameworkLabel: "Country / framework",
    connectedRightsLabel: "Related rights",
    officialSourceLabel: "Official source",
    openSourceLabel: "Open source",
    openPdfLabel: "OPEN PDF",
    downloadPdfLabel: "DOWNLOAD PDF",
    downloadDocumentLabel: "Download document",
    updatedLabel: "Updated",
    searchResourcesLabel: "Search legal resources",
    searchResourcesPlaceholder: "Search a law, guide, template or institution",
    allTypesLabel: "All resource types",
    allAreasLabel: "All legal areas",
    allFrameworksLabel: "All frameworks",
    allRightsLabel: "All rights",
    clearFiltersLabel: "Reset filters",
    noRightsTitle: "The rights catalog is filling up.",
    noRightsCopy: "Individual rights will appear here as soon as the editorial team or CMS adds them.",
    noResourcesTitle: "The Legal Compass is filling up.",
    noResourcesCopy: "The first guides, sources and templates will be available soon.",
    noResultsTitle: "No results",
    noResultsCopy: "Try another resource type, legal area or a broader search term.",
    notFoundTitle: "This content is not available yet.",
    notFoundCopy: "The page will appear as soon as it is entered and published through the CMS.",
    disclaimer: "Avangarda does not provide legal representation. These materials are here to inform and to make rights easier to understand. For a concrete legal procedure, contact a lawyer, legal aid service or the relevant institution.",
    disclaimerCompact: "This material is for information.",
    whatItMeansLabel: "What does this right mean?",
    whyItMattersLabel: "Why does it matter?",
    everydayExamplesLabel: "Everyday examples",
    legalBasisLabel: "Legal basis",
    serbiaFrameworkLabel: "Serbia framework",
    internationalFrameworkLabel: "International framework",
    whatIsThisForLabel: "What is this for?",
    whoCanUseItLabel: "Who can use it?",
    whenToUseItLabel: "When should it be used?",
    fallbackExplain: "Human rights are not what comes after everything else. They shape what a person can expect from the state, an employer, a school, the police, a hospital and public space.",
    fallbackEverydayLife: "When we talk about rights, we talk about the air people breathe, the wage they live on, the language they speak, the faith that should not be punished and the dignity that cannot become a luxury.",
  },
  tr: {
    humanRightsLabel: "İnsan Hakları",
    legalCompassLabel: "Hukuk Pusulası",
    heroTitle: "İnsan hakları bir slogan değildir. Bir insanın nasıl yaşadığını belirler.",
    heroText: "Avangarda, hukuki dili gündelik yaşama geri taşıyan bir alan açar: iş, sağlık, okul, hava, dil, kurumlar ve onur.",
    introText: "Bu, sırf veri deposu olsun diye kurulmuş bir hukuk alanı değil. Hakların, yasadan çıkıp bir insanın hayatına girdiğinde nasıl göründüğünü anlamak için kuruldu.",
    introSectionLabel: "İnsan hakları nedir?",
    everydaySectionLabel: "Gündelik hayatta haklar",
    rightsCatalogLabel: "Haklar kataloğu",
    rightsCatalogTitle: "Haklar kataloğu",
    rightsCatalogCopy: "Tek tek haklar için kısa rehberler: ne anlama gelir, neden önemlidir ve gerçek hayatta nerede kırılır.",
    legalCompassSectionTitle: "Hukuk Pusulası",
    legalCompassSectionCopy: "Hukuki dili gündelik yaşama bağlayan yasalar, rehberler, şablonlar ve resmi kaynaklar.",
    cards: {
      whatAreRights: { title: "İnsan hakları nedir?", description: "Hakların neden var olduğunu ve neden soyut bir ifade olmadığını anlatan temel çerçeve.", linkLabel: "Açıklamayı aç" },
      everydayLife: { title: "Gündelik hayatta haklar", description: "Haklar işte, okulda, polisle ilişkide, sağlıkta, havada ve yoksullukta görünür.", linkLabel: "Gündelik bağlamı gör" },
      catalog: { title: "Haklar kataloğu", description: "Her biri ayrı bir sayfada gelişebilen bireysel haklar dizisi.", linkLabel: "Kataloğu aç" },
      rightsInSerbia: { title: "Sırbistan'da haklar", description: "Sırbistan bağlamındaki yasalar, kurumlar, formlar ve rehberler.", linkLabel: "Sırbistan kaynaklarını aç" },
      legalCompass: { title: "Hukuk Pusulası", description: "Avangarda'nın yasa, rehber, belge ve resmi kaynak alanı.", linkLabel: "Hukuk Pusulasına gir" },
      internationalFramework: { title: "Uluslararası çerçeve", description: "BM, Avrupa Konseyi, AB ve diğer uluslararası belgeler.", linkLabel: "Uluslararası kaynakları gör" },
    },
    openSectionLabel: "Bölümü aç",
    openRightLabel: "Hakkı aç",
    openResourceLabel: "Kaynağı aç",
    browseResourcesLabel: "Hukuki kaynak ara",
    linkedStoriesLabel: "İlişkili metinler",
    relatedResourcesLabel: "İlişkili hukuki kaynaklar",
    relatedRightsLabel: "İlişkili haklar",
    relatedTopicsLabel: "İlişkili temalar",
    relatedLocationsLabel: "İlişkili konumlar",
    relatedArticlesLabel: "İlişkili metinler",
    legalAreaLabel: "Hukuk alanı",
    resourceTypeLabel: "Kaynak türü",
    frameworkLabel: "Ülke / çerçeve",
    connectedRightsLabel: "İlişkili haklar",
    officialSourceLabel: "Resmi kaynak",
    openSourceLabel: "Kaynağı aç",
    openPdfLabel: "PDF'Yİ AÇ",
    downloadPdfLabel: "PDF'Yİ İNDİR",
    downloadDocumentLabel: "Belge indir",
    updatedLabel: "Güncelleme",
    searchResourcesLabel: "Hukuki kaynak ara",
    searchResourcesPlaceholder: "Yasa, rehber, form ya da kurum ara",
    allTypesLabel: "Tüm kaynak türleri",
    allAreasLabel: "Tüm hukuk alanları",
    allFrameworksLabel: "Tüm çerçeveler",
    allRightsLabel: "Tüm haklar",
    clearFiltersLabel: "Filtreleri sıfırla",
    noRightsTitle: "Haklar kataloğu doluyor.",
    noRightsCopy: "Bireysel haklar CMS veya editoryal girişle birlikte burada görünecek.",
    noResourcesTitle: "Hukuk Pusulası doluyor.",
    noResourcesCopy: "İlk rehberler, kaynaklar ve şablonlar yakında eklenecek.",
    noResultsTitle: "Sonuç yok",
    noResultsCopy: "Başka bir kaynak türü, hukuk alanı ya da daha geniş bir arama dene.",
    notFoundTitle: "Bu içerik henüz hazır değil.",
    notFoundCopy: "CMS üzerinden eklendiğinde ve yayınlandığında görünecek.",
    disclaimer: "Avangarda hukuki temsil sunmaz. Materyaller yalnızca bilgilendirme ve hakların daha anlaşılır hale gelmesi içindir. Somut bir hukuki işlem için bir avukata, adli yardım servisine ya da ilgili kuruma başvurun.",
    disclaimerCompact: "Bu materyal bilgilendirme içindir.",
    whatItMeansLabel: "Bu hak ne anlama gelir?",
    whyItMattersLabel: "Neden önemlidir?",
    everydayExamplesLabel: "Gündelik örnekler",
    legalBasisLabel: "Hukuki dayanak",
    serbiaFrameworkLabel: "Sırbistan çerçevesi",
    internationalFrameworkLabel: "Uluslararası çerçeve",
    whatIsThisForLabel: "Bu ne için?",
    whoCanUseItLabel: "Kim kullanabilir?",
    whenToUseItLabel: "Ne zaman kullanılır?",
    fallbackExplain: "İnsan hakları, her şey bittikten sonra gelen ek bir başlık değildir. Devletten, işverenden, okuldan, polisten, hastaneden ve kamusal alandan ne beklenebileceğini belirler.",
    fallbackEverydayLife: "Haklardan söz ettiğimizde insanların soluduğu havadan, geçindikleri ücretten, konuştukları dilden, cezalandırılamayan inançtan ve lüks olmaması gereken onurdan söz ederiz.",
  },
  fr: {
    humanRightsLabel: "Droits humains",
    legalCompassLabel: "Boussole juridique",
    heroTitle: "Les droits humains ne sont pas un slogan. Ils déterminent la façon dont une personne vit.",
    heroText: "Avangarda ouvre un espace où le langage juridique revient à la vie quotidienne: travail, santé, école, air, langue, institutions et dignité.",
    introText: "Ce n'est pas une base juridique pour elle-même. C'est un espace pour comprendre ce que deviennent les droits quand ils quittent la loi et entrent dans une vie.",
    introSectionLabel: "Que sont les droits humains ?",
    everydaySectionLabel: "Les droits dans la vie quotidienne",
    rightsCatalogLabel: "Catalogue des droits",
    rightsCatalogTitle: "Catalogue des droits",
    rightsCatalogCopy: "Des guides courts pour chaque droit: ce qu'il signifie, pourquoi il compte et où il se brise dans le réel.",
    legalCompassSectionTitle: "Boussole juridique",
    legalCompassSectionCopy: "Lois, guides, modèles et sources officielles pour relier le langage juridique à la vie vécue.",
    cards: {
      whatAreRights: { title: "Que sont les droits humains ?", description: "Le cadre de base: pourquoi les droits existent et pourquoi ils ne sont pas une formule abstraite.", linkLabel: "Ouvrir l'explication" },
      everydayLife: { title: "Les droits au quotidien", description: "Les droits apparaissent dans le travail, l'école, la police, la santé, l'air et la pauvreté.", linkLabel: "Voir le cadre quotidien" },
      catalog: { title: "Catalogue des droits", description: "Une série de droits individuels qui peuvent être développés en pages distinctes.", linkLabel: "Ouvrir le catalogue" },
      rightsInSerbia: { title: "Droits en Serbie", description: "Lois, institutions, modèles et ressources liées aux droits en Serbie.", linkLabel: "Ouvrir les ressources de Serbie" },
      legalCompass: { title: "Boussole juridique", description: "L'espace de ressources d'Avangarda pour lois, guides, documents et sources officielles.", linkLabel: "Entrer dans la boussole" },
      internationalFramework: { title: "Cadre international", description: "ONU, Conseil de l'Europe, UE et autres documents qui structurent le champ des droits.", linkLabel: "Voir les sources internationales" },
    },
    openSectionLabel: "Ouvrir la section",
    openRightLabel: "Ouvrir le droit",
    openResourceLabel: "Ouvrir la ressource",
    browseResourcesLabel: "Chercher des ressources juridiques",
    linkedStoriesLabel: "Textes liés",
    relatedResourcesLabel: "Ressources juridiques liées",
    relatedRightsLabel: "Droits liés",
    relatedTopicsLabel: "Thèmes liés",
    relatedLocationsLabel: "Lieux liés",
    relatedArticlesLabel: "Textes liés",
    legalAreaLabel: "Domaine juridique",
    resourceTypeLabel: "Type de ressource",
    frameworkLabel: "Pays / cadre",
    connectedRightsLabel: "Droits liés",
    officialSourceLabel: "Source officielle",
    openSourceLabel: "Ouvrir la source",
    openPdfLabel: "OUVRIR LE PDF",
    downloadPdfLabel: "TÉLÉCHARGER LE PDF",
    downloadDocumentLabel: "Télécharger le document",
    updatedLabel: "Mis à jour",
    searchResourcesLabel: "Chercher des ressources juridiques",
    searchResourcesPlaceholder: "Chercher une loi, un guide, un modèle ou une institution",
    allTypesLabel: "Tous les types",
    allAreasLabel: "Tous les domaines",
    allFrameworksLabel: "Tous les cadres",
    allRightsLabel: "Tous les droits",
    clearFiltersLabel: "Réinitialiser les filtres",
    noRightsTitle: "Le catalogue des droits se remplit.",
    noRightsCopy: "Les premiers droits apparaîtront ici dès qu'ils seront saisis dans le CMS.",
    noResourcesTitle: "La boussole juridique se remplit.",
    noResourcesCopy: "Les premiers guides, sources et modèles seront disponibles bientôt.",
    noResultsTitle: "Aucun résultat",
    noResultsCopy: "Essaie un autre type de ressource, un autre domaine ou une recherche plus large.",
    notFoundTitle: "Ce contenu n'est pas encore disponible.",
    notFoundCopy: "La page apparaîtra dès qu'elle sera saisie et publiée via le CMS.",
    disclaimer: "Avangarda ne fournit pas de représentation juridique. Les matériaux servent à informer et à rendre les droits plus compréhensibles. Pour une procédure concrète, adresse-toi à un avocat, à un service d'aide juridique ou à l'institution compétente.",
    disclaimerCompact: "Ce matériel sert à informer.",
    whatItMeansLabel: "Que signifie ce droit ?",
    whyItMattersLabel: "Pourquoi est-ce important ?",
    everydayExamplesLabel: "Exemples du quotidien",
    legalBasisLabel: "Base juridique",
    serbiaFrameworkLabel: "Cadre en Serbie",
    internationalFrameworkLabel: "Cadre international",
    whatIsThisForLabel: "À quoi cela sert-il ?",
    whoCanUseItLabel: "Qui peut l'utiliser ?",
    whenToUseItLabel: "Quand l'utiliser ?",
    fallbackExplain: "Les droits humains ne viennent pas après tout le reste. Ils fixent ce qu'une personne peut attendre de l'État, d'un employeur, de l'école, de la police, d'un hôpital et de l'espace public.",
    fallbackEverydayLife: "Parler des droits, c'est parler de l'air qu'on respire, du salaire qui fait vivre, de la langue que l'on parle, de la foi qui ne doit pas être punie et d'une dignité qui ne peut pas devenir un luxe.",
  },
  de: {
    humanRightsLabel: "Menschenrechte",
    legalCompassLabel: "Rechtskompass",
    heroTitle: "Menschenrechte sind kein Slogan. Sie entscheiden darüber, wie ein Mensch lebt.",
    heroText: "Avangarda schafft einen Raum, in dem juristische Sprache in den Alltag zurückkehrt: Arbeit, Gesundheit, Schule, Luft, Sprache, Institutionen und Würde.",
    introText: "Das ist keine Rechtsdatenbank um ihrer selbst willen. Es ist ein Ort, um zu verstehen, wie Rechte aussehen, wenn sie das Gesetz verlassen und in ein Leben eintreten.",
    introSectionLabel: "Was sind Menschenrechte?",
    everydaySectionLabel: "Rechte im Alltag",
    rightsCatalogLabel: "Katalog der Rechte",
    rightsCatalogTitle: "Katalog der Rechte",
    rightsCatalogCopy: "Einzelne Rechte als kurze Leitfäden: was sie bedeuten, warum sie wichtig sind und wo sie in der Wirklichkeit brechen.",
    legalCompassSectionTitle: "Rechtskompass",
    legalCompassSectionCopy: "Gesetze, Leitfäden, Vorlagen und offizielle Quellen, die juristische Sprache mit dem gelebten Alltag verbinden.",
    cards: {
      whatAreRights: { title: "Was sind Menschenrechte?", description: "Der Grundrahmen: warum Rechte existieren und warum sie keine abstrakte Formel sind.", linkLabel: "Erklärung öffnen" },
      everydayLife: { title: "Rechte im Alltag", description: "Rechte werden in Arbeit, Schule, Polizei, Gesundheit, Luft und Armut sichtbar.", linkLabel: "Alltagsrahmen ansehen" },
      catalog: { title: "Katalog der Rechte", description: "Ein wachsender Bestand einzelner Rechte mit eigenen Seiten.", linkLabel: "Katalog öffnen" },
      rightsInSerbia: { title: "Rechte in Serbien", description: "Gesetze, Institutionen, Vorlagen und Ressourcen für Rechte in Serbien.", linkLabel: "Serbien-Ressourcen öffnen" },
      legalCompass: { title: "Rechtskompass", description: "Avangardas Ressourcenseite für Gesetze, Leitfäden, Dokumente und offizielle Quellen.", linkLabel: "Rechtskompass öffnen" },
      internationalFramework: { title: "Internationaler Rahmen", description: "UNO, Europarat, EU und andere Dokumente, die das Feld der Rechte prägen.", linkLabel: "Internationale Quellen ansehen" },
    },
    openSectionLabel: "Bereich öffnen",
    openRightLabel: "Recht öffnen",
    openResourceLabel: "Ressource öffnen",
    browseResourcesLabel: "Juristische Ressourcen durchsuchen",
    linkedStoriesLabel: "Verknüpfte Texte",
    relatedResourcesLabel: "Verknüpfte Rechtsressourcen",
    relatedRightsLabel: "Verknüpfte Rechte",
    relatedTopicsLabel: "Verknüpfte Themen",
    relatedLocationsLabel: "Verknüpfte Orte",
    relatedArticlesLabel: "Verknüpfte Texte",
    legalAreaLabel: "Rechtsgebiet",
    resourceTypeLabel: "Ressourcentyp",
    frameworkLabel: "Land / Rahmen",
    connectedRightsLabel: "Verknüpfte Rechte",
    officialSourceLabel: "Offizielle Quelle",
    openSourceLabel: "Quelle öffnen",
    openPdfLabel: "PDF ÖFFNEN",
    downloadPdfLabel: "PDF HERUNTERLADEN",
    downloadDocumentLabel: "Dokument herunterladen",
    updatedLabel: "Aktualisiert",
    searchResourcesLabel: "Juristische Ressourcen durchsuchen",
    searchResourcesPlaceholder: "Gesetz, Leitfaden, Vorlage oder Institution suchen",
    allTypesLabel: "Alle Typen",
    allAreasLabel: "Alle Rechtsgebiete",
    allFrameworksLabel: "Alle Rahmen",
    allRightsLabel: "Alle Rechte",
    clearFiltersLabel: "Filter zurücksetzen",
    noRightsTitle: "Der Rechtekatalog füllt sich.",
    noRightsCopy: "Die ersten Rechte erscheinen hier, sobald sie im CMS eingetragen werden.",
    noResourcesTitle: "Der Rechtskompass füllt sich.",
    noResourcesCopy: "Die ersten Leitfäden, Quellen und Vorlagen werden bald verfügbar sein.",
    noResultsTitle: "Keine Ergebnisse",
    noResultsCopy: "Versuche einen anderen Ressourcentyp, ein anderes Rechtsgebiet oder einen breiteren Suchbegriff.",
    notFoundTitle: "Dieser Inhalt ist noch nicht verfügbar.",
    notFoundCopy: "Die Seite erscheint, sobald sie im CMS eingetragen und veröffentlicht wurde.",
    disclaimer: "Avangarda bietet keine rechtliche Vertretung an. Diese Materialien dienen der Information und einem leichteren Verständnis von Rechten. Für ein konkretes Verfahren wende dich an einen Anwalt, eine Rechtsberatungsstelle oder die zuständige Institution.",
    disclaimerCompact: "Dieses Material dient der Information.",
    whatItMeansLabel: "Was bedeutet dieses Recht?",
    whyItMattersLabel: "Warum ist es wichtig?",
    everydayExamplesLabel: "Alltagsbeispiele",
    legalBasisLabel: "Rechtsgrundlage",
    serbiaFrameworkLabel: "Rahmen in Serbien",
    internationalFrameworkLabel: "Internationaler Rahmen",
    whatIsThisForLabel: "Wofür ist das?",
    whoCanUseItLabel: "Wer kann es nutzen?",
    whenToUseItLabel: "Wann wird es genutzt?",
    fallbackExplain: "Menschenrechte sind nicht das, was nach allem anderen kommt. Sie bestimmen, was ein Mensch vom Staat, von einem Arbeitgeber, von der Schule, der Polizei, einem Krankenhaus und dem öffentlichen Raum erwarten darf.",
    fallbackEverydayLife: "Wenn wir über Rechte sprechen, sprechen wir über die Luft, die Menschen atmen, den Lohn, von dem sie leben, die Sprache, die sie sprechen, den Glauben, der nicht bestraft werden darf, und über Würde, die kein Luxus werden darf.",
  },
  es: {
    humanRightsLabel: "Derechos humanos",
    legalCompassLabel: "Brújula legal",
    heroTitle: "Los derechos humanos no son una consigna. Deciden cómo vive una persona.",
    heroText: "Avangarda abre un espacio donde el lenguaje jurídico vuelve a la vida cotidiana: trabajo, salud, escuela, aire, lengua, instituciones y dignidad.",
    introText: "Esto no es una base jurídica por sí misma. Es un lugar para entender qué aspecto tienen los derechos cuando salen de la ley y entran en una vida.",
    introSectionLabel: "¿Qué son los derechos humanos?",
    everydaySectionLabel: "Derechos en la vida cotidiana",
    rightsCatalogLabel: "Catálogo de derechos",
    rightsCatalogTitle: "Catálogo de derechos",
    rightsCatalogCopy: "Derechos individuales como guías breves: qué significan, por qué importan y dónde se rompen en la realidad.",
    legalCompassSectionTitle: "Brújula legal",
    legalCompassSectionCopy: "Leyes, guías, plantillas y fuentes oficiales para conectar el lenguaje jurídico con la vida vivida.",
    cards: {
      whatAreRights: { title: "¿Qué son los derechos humanos?", description: "El marco básico: por qué existen los derechos y por qué no son una frase abstracta.", linkLabel: "Abrir explicación" },
      everydayLife: { title: "Derechos en la vida cotidiana", description: "Los derechos se vuelven visibles en el trabajo, la escuela, la policía, la salud, el aire y la pobreza.", linkLabel: "Ver el contexto cotidiano" },
      catalog: { title: "Catálogo de derechos", description: "Un conjunto de derechos individuales que puede crecer con páginas propias.", linkLabel: "Abrir catálogo" },
      rightsInSerbia: { title: "Derechos en Serbia", description: "Leyes, instituciones, formularios y recursos ligados a los derechos en Serbia.", linkLabel: "Abrir recursos de Serbia" },
      legalCompass: { title: "Brújula legal", description: "El espacio de recursos de Avangarda para leyes, guías, documentos y fuentes oficiales.", linkLabel: "Entrar en la brújula" },
      internationalFramework: { title: "Marco internacional", description: "ONU, Consejo de Europa, UE y otros documentos que estructuran el campo de los derechos.", linkLabel: "Ver fuentes internacionales" },
    },
    openSectionLabel: "Abrir sección",
    openRightLabel: "Abrir derecho",
    openResourceLabel: "Abrir recurso",
    browseResourcesLabel: "Buscar recursos legales",
    linkedStoriesLabel: "Textos relacionados",
    relatedResourcesLabel: "Recursos legales relacionados",
    relatedRightsLabel: "Derechos relacionados",
    relatedTopicsLabel: "Temas relacionados",
    relatedLocationsLabel: "Ubicaciones relacionadas",
    relatedArticlesLabel: "Textos relacionados",
    legalAreaLabel: "Área jurídica",
    resourceTypeLabel: "Tipo de recurso",
    frameworkLabel: "País / marco",
    connectedRightsLabel: "Derechos vinculados",
    officialSourceLabel: "Fuente oficial",
    openSourceLabel: "Abrir fuente",
    openPdfLabel: "ABRIR PDF",
    downloadPdfLabel: "DESCARGAR PDF",
    downloadDocumentLabel: "Descargar documento",
    updatedLabel: "Actualizado",
    searchResourcesLabel: "Buscar recursos legales",
    searchResourcesPlaceholder: "Busca una ley, una guía, un formulario o una institución",
    allTypesLabel: "Todos los tipos",
    allAreasLabel: "Todas las áreas",
    allFrameworksLabel: "Todos los marcos",
    allRightsLabel: "Todos los derechos",
    clearFiltersLabel: "Restablecer filtros",
    noRightsTitle: "El catálogo de derechos se está llenando.",
    noRightsCopy: "Los primeros derechos aparecerán aquí en cuanto se carguen desde el CMS.",
    noResourcesTitle: "La brújula legal se está llenando.",
    noResourcesCopy: "Las primeras guías, fuentes y formularios estarán disponibles pronto.",
    noResultsTitle: "Sin resultados",
    noResultsCopy: "Prueba con otro tipo de recurso, otra área o una búsqueda más amplia.",
    notFoundTitle: "Este contenido todavía no está disponible.",
    notFoundCopy: "La página aparecerá en cuanto se cargue y publique desde el CMS.",
    disclaimer: "Avangarda no ofrece representación jurídica. Estos materiales sirven para informar y facilitar la comprensión de los derechos. Para un procedimiento concreto, consulta a un abogado, un servicio de asistencia jurídica o la institución competente.",
    disclaimerCompact: "Este material es informativo.",
    whatItMeansLabel: "¿Qué significa este derecho?",
    whyItMattersLabel: "¿Por qué importa?",
    everydayExamplesLabel: "Ejemplos cotidianos",
    legalBasisLabel: "Base jurídica",
    serbiaFrameworkLabel: "Marco en Serbia",
    internationalFrameworkLabel: "Marco internacional",
    whatIsThisForLabel: "¿Para qué sirve?",
    whoCanUseItLabel: "¿Quién puede usarlo?",
    whenToUseItLabel: "¿Cuándo se usa?",
    fallbackExplain: "Los derechos humanos no llegan después de todo lo demás. Determinan qué puede esperar una persona del Estado, de un empleador, de la escuela, de la policía, de un hospital y del espacio público.",
    fallbackEverydayLife: "Hablar de derechos es hablar del aire que se respira, del salario con el que se vive, de la lengua que se habla, de la fe que no debe castigarse y de una dignidad que no puede convertirse en lujo.",
  },
  el: {
    humanRightsLabel: "Ανθρώπινα δικαιώματα",
    legalCompassLabel: "Νομική πυξίδα",
    heroTitle: "Τα ανθρώπινα δικαιώματα δεν είναι σύνθημα. Καθορίζουν το πώς ζει ένας άνθρωπος.",
    heroText: "Η Avangarda ανοίγει έναν χώρο όπου η νομική γλώσσα επιστρέφει στην καθημερινή ζωή: εργασία, υγεία, σχολείο, αέρας, γλώσσα, θεσμοί και αξιοπρέπεια.",
    introText: "Δεν πρόκειται για νομική βάση μόνο για τη βάση. Είναι ένας τόπος για να γίνει κατανοητό πώς μοιάζουν τα δικαιώματα όταν βγαίνουν από τον νόμο και μπαίνουν σε μια ζωή.",
    introSectionLabel: "Τι είναι τα ανθρώπινα δικαιώματα;",
    everydaySectionLabel: "Δικαιώματα στην καθημερινή ζωή",
    rightsCatalogLabel: "Κατάλογος δικαιωμάτων",
    rightsCatalogTitle: "Κατάλογος δικαιωμάτων",
    rightsCatalogCopy: "Μεμονωμένα δικαιώματα ως σύντομοι οδηγοί: τι σημαίνουν, γιατί έχουν σημασία και πού σπάνε στην πραγματικότητα.",
    legalCompassSectionTitle: "Νομική πυξίδα",
    legalCompassSectionCopy: "Νόμοι, οδηγοί, πρότυπα και επίσημες πηγές που συνδέουν τη νομική γλώσσα με την πραγματική ζωή.",
    cards: {
      whatAreRights: { title: "Τι είναι τα ανθρώπινα δικαιώματα;", description: "Το βασικό πλαίσιο: γιατί υπάρχουν τα δικαιώματα και γιατί δεν είναι αφηρημένη φράση.", linkLabel: "Άνοιξε την εξήγηση" },
      everydayLife: { title: "Δικαιώματα στην καθημερινότητα", description: "Τα δικαιώματα γίνονται ορατά στην εργασία, στο σχολείο, στην αστυνομία, στην υγεία, στον αέρα και στη φτώχεια.", linkLabel: "Δες το καθημερινό πλαίσιο" },
      catalog: { title: "Κατάλογος δικαιωμάτων", description: "Ένα σύνολο ατομικών δικαιωμάτων που μπορεί να αναπτυχθεί σε ξεχωριστές σελίδες.", linkLabel: "Άνοιξε τον κατάλογο" },
      rightsInSerbia: { title: "Δικαιώματα στη Σερβία", description: "Νόμοι, θεσμοί, πρότυπα και πόροι για τα δικαιώματα στη Σερβία.", linkLabel: "Άνοιξε τους πόρους της Σερβίας" },
      legalCompass: { title: "Νομική πυξίδα", description: "Ο χώρος πόρων της Avangarda για νόμους, οδηγούς, έγγραφα και επίσημες πηγές.", linkLabel: "Μπες στη νομική πυξίδα" },
      internationalFramework: { title: "Διεθνές πλαίσιο", description: "ΟΗΕ, Συμβούλιο της Ευρώπης, ΕΕ και άλλα έγγραφα που διαμορφώνουν το πεδίο των δικαιωμάτων.", linkLabel: "Δες τις διεθνείς πηγές" },
    },
    openSectionLabel: "Άνοιξε την ενότητα",
    openRightLabel: "Άνοιξε το δικαίωμα",
    openResourceLabel: "Άνοιξε τον πόρο",
    browseResourcesLabel: "Αναζήτησε νομικούς πόρους",
    linkedStoriesLabel: "Σχετικά κείμενα",
    relatedResourcesLabel: "Σχετικοί νομικοί πόροι",
    relatedRightsLabel: "Σχετικά δικαιώματα",
    relatedTopicsLabel: "Σχετικά θέματα",
    relatedLocationsLabel: "Σχετικές τοποθεσίες",
    relatedArticlesLabel: "Σχετικά κείμενα",
    legalAreaLabel: "Νομικό πεδίο",
    resourceTypeLabel: "Τύπος πόρου",
    frameworkLabel: "Χώρα / πλαίσιο",
    connectedRightsLabel: "Συνδεδεμένα δικαιώματα",
    officialSourceLabel: "Επίσημη πηγή",
    openSourceLabel: "Άνοιξε την πηγή",
    openPdfLabel: "ΑΝΟΙΓΜΑ PDF",
    downloadPdfLabel: "ΛΗΨΗ PDF",
    downloadDocumentLabel: "Λήψη εγγράφου",
    updatedLabel: "Ενημέρωση",
    searchResourcesLabel: "Αναζήτησε νομικούς πόρους",
    searchResourcesPlaceholder: "Αναζήτησε νόμο, οδηγό, πρότυπο ή θεσμό",
    allTypesLabel: "Όλοι οι τύποι",
    allAreasLabel: "Όλα τα πεδία",
    allFrameworksLabel: "Όλα τα πλαίσια",
    allRightsLabel: "Όλα τα δικαιώματα",
    clearFiltersLabel: "Καθαρισμός φίλτρων",
    noRightsTitle: "Ο κατάλογος δικαιωμάτων γεμίζει.",
    noRightsCopy: "Τα πρώτα δικαιώματα θα εμφανιστούν εδώ μόλις προστεθούν στο CMS.",
    noResourcesTitle: "Η νομική πυξίδα γεμίζει.",
    noResourcesCopy: "Οι πρώτοι οδηγοί, πηγές και φόρμες θα είναι διαθέσιμοι σύντομα.",
    noResultsTitle: "Δεν υπάρχουν αποτελέσματα",
    noResultsCopy: "Δοκίμασε άλλο τύπο πόρου, άλλο πεδίο ή πιο ανοιχτό όρο αναζήτησης.",
    notFoundTitle: "Αυτό το περιεχόμενο δεν είναι ακόμη διαθέσιμο.",
    notFoundCopy: "Η σελίδα θα εμφανιστεί μόλις προστεθεί και δημοσιευθεί μέσω του CMS.",
    disclaimer: "Η Avangarda δεν παρέχει νομική εκπροσώπηση. Το υλικό έχει ενημερωτικό χαρακτήρα και βοηθά στην κατανόηση των δικαιωμάτων. Για συγκεκριμένη νομική διαδικασία απευθύνσου σε δικηγόρο, υπηρεσία νομικής βοήθειας ή στην αρμόδια αρχή.",
    disclaimerCompact: "Το υλικό αυτό είναι ενημερωτικό.",
    whatItMeansLabel: "Τι σημαίνει αυτό το δικαίωμα;",
    whyItMattersLabel: "Γιατί έχει σημασία;",
    everydayExamplesLabel: "Παραδείγματα από την καθημερινότητα",
    legalBasisLabel: "Νομική βάση",
    serbiaFrameworkLabel: "Πλαίσιο στη Σερβία",
    internationalFrameworkLabel: "Διεθνές πλαίσιο",
    whatIsThisForLabel: "Σε τι χρησιμεύει;",
    whoCanUseItLabel: "Ποιος μπορεί να το χρησιμοποιήσει;",
    whenToUseItLabel: "Πότε χρησιμοποιείται;",
    fallbackExplain: "Τα ανθρώπινα δικαιώματα δεν έρχονται μετά από όλα τα υπόλοιπα. Καθορίζουν τι μπορεί να περιμένει ένας άνθρωπος από το κράτος, τον εργοδότη, το σχολείο, την αστυνομία, το νοσοκομείο και τον δημόσιο χώρο.",
    fallbackEverydayLife: "Όταν μιλάμε για δικαιώματα, μιλάμε για τον αέρα που αναπνέεται, για τον μισθό από τον οποίο ζει κανείς, για τη γλώσσα που μιλά, για την πίστη που δεν πρέπει να τιμωρείται και για μια αξιοπρέπεια που δεν μπορεί να γίνει πολυτέλεια.",
  },
  ar: {
    humanRightsLabel: "حقوق الإنسان",
    legalCompassLabel: "البوصلة القانونية",
    heroTitle: "حقوق الإنسان ليست شعارًا. إنها مسألة كيف يعيش الإنسان.",
    heroText: "تفتح أفانغاردا مساحة يعود فيها الخطاب القانوني إلى الحياة اليومية: العمل، الصحة، المدرسة، الهواء، اللغة، المؤسسات والكرامة.",
    introText: "هذه ليست قاعدة قانونية من أجل الشكل. إنها مساحة لفهم شكل الحقوق حين تخرج من النص القانوني وتدخل حياة الناس.",
    introSectionLabel: "ما هي حقوق الإنسان؟",
    everydaySectionLabel: "الحقوق في الحياة اليومية",
    rightsCatalogLabel: "دليل الحقوق",
    rightsCatalogTitle: "دليل الحقوق",
    rightsCatalogCopy: "حقوق فردية على شكل أدلة قصيرة: ماذا تعني، ولماذا تهم، وأين تنكسر في الواقع.",
    legalCompassSectionTitle: "البوصلة القانونية",
    legalCompassSectionCopy: "قوانين وأدلة ونماذج ومصادر رسمية تربط اللغة القانونية بالحياة الفعلية.",
    cards: {
      whatAreRights: { title: "ما هي حقوق الإنسان؟", description: "الإطار الأساسي: لماذا توجد الحقوق ولماذا ليست عبارة مجردة.", linkLabel: "افتح الشرح" },
      everydayLife: { title: "الحقوق في الحياة اليومية", description: "تظهر الحقوق في العمل والمدرسة والشرطة والصحة والهواء والفقر.", linkLabel: "اعرض السياق اليومي" },
      catalog: { title: "دليل الحقوق", description: "مجموعة من الحقوق الفردية يمكن تطويرها في صفحات مستقلة.", linkLabel: "افتح الدليل" },
      rightsInSerbia: { title: "الحقوق في صربيا", description: "قوانين ومؤسسات ونماذج وموارد مرتبطة بالحقوق في صربيا.", linkLabel: "افتح موارد صربيا" },
      legalCompass: { title: "البوصلة القانونية", description: "مساحة أفانغاردا للموارد القانونية والوثائق والمصادر الرسمية.", linkLabel: "ادخل إلى البوصلة" },
      internationalFramework: { title: "الإطار الدولي", description: "الأمم المتحدة ومجلس أوروبا والاتحاد الأوروبي وغيرها من الوثائق التي تشكل مجال الحقوق.", linkLabel: "اعرض المصادر الدولية" },
    },
    openSectionLabel: "افتح القسم",
    openRightLabel: "افتح الحق",
    openResourceLabel: "افتح المورد",
    browseResourcesLabel: "ابحث في الموارد القانونية",
    linkedStoriesLabel: "نصوص مرتبطة",
    relatedResourcesLabel: "موارد قانونية مرتبطة",
    relatedRightsLabel: "حقوق مرتبطة",
    relatedTopicsLabel: "موضوعات مرتبطة",
    relatedLocationsLabel: "أماكن مرتبطة",
    relatedArticlesLabel: "نصوص مرتبطة",
    legalAreaLabel: "مجال الحق",
    resourceTypeLabel: "نوع المورد",
    frameworkLabel: "الدولة / الإطار",
    connectedRightsLabel: "الحقوق المرتبطة",
    officialSourceLabel: "المصدر الرسمي",
    openSourceLabel: "افتح المصدر",
    openPdfLabel: "افتح PDF",
    downloadPdfLabel: "تنزيل PDF",
    downloadDocumentLabel: "نزّل المستند",
    updatedLabel: "تحديث",
    searchResourcesLabel: "ابحث في الموارد القانونية",
    searchResourcesPlaceholder: "ابحث عن قانون أو دليل أو نموذج أو مؤسسة",
    allTypesLabel: "كل الأنواع",
    allAreasLabel: "كل المجالات",
    allFrameworksLabel: "كل الأطر",
    allRightsLabel: "كل الحقوق",
    clearFiltersLabel: "إعادة ضبط الفلاتر",
    noRightsTitle: "دليل الحقوق قيد الامتلاء.",
    noRightsCopy: "ستظهر أولى الحقوق هنا بمجرد إضافتها من خلال نظام الإدارة.",
    noResourcesTitle: "البوصلة القانونية قيد الامتلاء.",
    noResourcesCopy: "ستتوفر الأدلة والمصادر والنماذج الأولى قريبًا.",
    noResultsTitle: "لا توجد نتائج",
    noResultsCopy: "جرّب نوعًا آخر من الموارد أو مجالًا مختلفًا أو بحثًا أوسع.",
    notFoundTitle: "هذا المحتوى غير متاح بعد.",
    notFoundCopy: "ستظهر هذه الصفحة فور إدخالها ونشرها عبر نظام الإدارة.",
    disclaimer: "لا تقدّم أفانغاردا تمثيلًا قانونيًا. هذه المواد مخصّصة للمعلومة ولتسهيل فهم الحقوق. من أجل إجراء قانوني محدد، تواصل مع محامٍ أو خدمة مساعدة قانونية أو المؤسسة المختصة.",
    disclaimerCompact: "هذه المادة مخصّصة للمعلومة.",
    whatItMeansLabel: "ماذا يعني هذا الحق؟",
    whyItMattersLabel: "لماذا هو مهم؟",
    everydayExamplesLabel: "أمثلة من الحياة اليومية",
    legalBasisLabel: "الأساس القانوني",
    serbiaFrameworkLabel: "الإطار في صربيا",
    internationalFrameworkLabel: "الإطار الدولي",
    whatIsThisForLabel: "ما الغرض منه؟",
    whoCanUseItLabel: "من يمكنه استخدامه؟",
    whenToUseItLabel: "متى يُستخدم؟",
    fallbackExplain: "حقوق الإنسان ليست ما يأتي بعد كل شيء آخر. إنها تحدد ما الذي يمكن للإنسان أن يتوقعه من الدولة وصاحب العمل والمدرسة والشرطة والمستشفى والفضاء العام.",
    fallbackEverydayLife: "حين نتحدث عن الحقوق فنحن نتحدث عن الهواء الذي يُتنفَّس، والأجر الذي يُعاش منه، واللغة التي تُقال، والإيمان الذي لا يجب أن يُعاقب، والكرامة التي لا يجوز أن تصبح رفاهية.",
  },
};

export function getHumanRightsCopy(lang: Lang) {
  return humanRightsCopyByLang[lang];
}

export function getHumanRightsLabel(lang: Lang) {
  return getHumanRightsCopy(lang).humanRightsLabel;
}

export function getLegalCompassLabel(lang: Lang) {
  return getHumanRightsCopy(lang).legalCompassLabel;
}

export function getHumanRightsSeo(lang: Lang) {
  const copy = getHumanRightsCopy(lang);
  return {
    title: `${copy.humanRightsLabel} | Avangarda`,
    description:
      lang === "sr"
        ? "Edukativni prostor Avangarde za razumevanje ljudskih prava kroz svakodnevni život, institucije i društveni kontekst."
        : lang === "en"
          ? "Avangarda's educational space for understanding human rights through everyday life, institutions and social context."
          : copy.introText,
  };
}

export function getLegalCompassSeo(lang: Lang) {
  const copy = getHumanRightsCopy(lang);
  return {
    title: `${copy.legalCompassLabel} | Avangarda`,
    description:
      lang === "sr"
        ? "Avangardin resursni centar za zakone, vodiče, obrasce i zvanične izvore povezane sa ljudskim pravima."
        : lang === "en"
          ? "Avangarda's resource hub for laws, guides, templates and official sources related to human rights."
          : copy.legalCompassSectionCopy,
  };
}

function buildFallbackCards(lang: Lang): ResourceLinkCard[] {
  const copy = getHumanRightsCopy(lang);
  return [
    { key: "whatAreRights", href: `${withLang("/ljudska-prava", lang)}#sta-su-ljudska-prava`, ...copy.cards.whatAreRights },
    { key: "everydayLife", href: `${withLang("/ljudska-prava", lang)}#prava-u-svakodnevnom-zivotu`, ...copy.cards.everydayLife },
    { key: "catalog", href: `${withLang("/ljudska-prava", lang)}#katalog-prava`, ...copy.cards.catalog },
    { key: "rightsInSerbia", href: withLang("/pravni-kompas?framework=serbia", lang), ...copy.cards.rightsInSerbia },
    { key: "legalCompass", href: withLang("/pravni-kompas", lang), ...copy.cards.legalCompass },
    { key: "internationalFramework", href: withLang("/pravni-kompas?type=international_document", lang), ...copy.cards.internationalFramework },
  ];
}

export function getFallbackHumanRightsPage(lang: Lang): HumanRightsPageData {
  const copy = getHumanRightsCopy(lang);
  return {
    title: copy.humanRightsLabel,
    slug: "ljudska-prava",
    heroText: copy.heroText,
    introText: copy.introText,
    body: "",
    cards: buildFallbackCards(lang),
  };
}

const HUMAN_RIGHTS_PAGE_POPULATE_QUERY = [
  "populate[cards]=*",
  "populate[seo]=*",
].join("&");

const HUMAN_RIGHTS_RELATION_QUERY = [
  "populate[relatedArticles]=*",
  "populate[relatedTopics]=*",
  "populate[relatedLocations]=*",
  "populate[relatedLegalResources]=*",
  "populate[seo]=*",
].join("&");

const LEGAL_RESOURCES_RELATION_QUERY = [
  "populate[pdfFile]=*",
  "populate[downloadableFile]=*",
  "populate[tags]=*",
  "populate[relatedHumanRights]=*",
  "populate[relatedArticles]=*",
  "populate[relatedTopics]=*",
  "populate[relatedLocations]=*",
  "populate[seo]=*",
].join("&");

export async function fetchHumanRightsPage(lang: Lang): Promise<HumanRightsPageData> {
  const copy = getHumanRightsCopy(lang);
  const response = await strapiGet<{ data?: unknown }>(`/api/human-rights-page?${HUMAN_RIGHTS_PAGE_POPULATE_QUERY}`);
  const record = unwrapStrapiSingle<HumanRightsPageRecord>(response);

  if (!record) {
    return getFallbackHumanRightsPage(lang);
  }

  return localizeHumanRightsPage(record, lang, copy);
}

export async function fetchHumanRightsCatalog(lang: Lang): Promise<HumanRightItem[]> {
  const response = await strapiGet<{ data?: unknown }>(
    `/api/human-rights?sort[0]=isFeatured:desc&sort[1]=title:asc&pagination[pageSize]=120&${HUMAN_RIGHTS_RELATION_QUERY}`
  );

  return unwrapStrapiCollection<HumanRightRecord>(response)
    .map((record) => localizeHumanRight(record, lang))
    .filter((record) => record.title && record.slug);
}

export async function fetchHumanRightBySlug(lang: Lang, slug: string): Promise<HumanRightItem | null> {
  const response = await strapiGet<{ data?: unknown }>(
    `/api/human-rights?filters[slug][$eq]=${encodeURIComponent(slug)}&pagination[pageSize]=1&${HUMAN_RIGHTS_RELATION_QUERY}`
  );
  const record = unwrapStrapiCollection<HumanRightRecord>(response)[0];
  return record ? localizeHumanRight(record, lang) : null;
}

export async function fetchLegalResources(lang: Lang): Promise<LegalResourceItem[]> {
  const response = await strapiGet<{ data?: unknown }>(
    `/api/legal-resources?sort[0]=isFeatured:desc&sort[1]=dateUpdated:desc&sort[2]=title:asc&pagination[pageSize]=160&${LEGAL_RESOURCES_RELATION_QUERY}`
  );

  return unwrapStrapiCollection<LegalResourceRecord>(response)
    .map((record) => localizeLegalResource(record, lang))
    .filter((record) => record.title && record.slug);
}

export async function fetchLegalResourceBySlug(lang: Lang, slug: string): Promise<LegalResourceItem | null> {
  const response = await strapiGet<{ data?: unknown }>(
    `/api/legal-resources?filters[slug][$eq]=${encodeURIComponent(slug)}&pagination[pageSize]=1&${LEGAL_RESOURCES_RELATION_QUERY}`
  );
  const record = unwrapStrapiCollection<LegalResourceRecord>(response)[0];
  return record ? localizeLegalResource(record, lang) : null;
}

export function filterLegalResources(
  resources: LegalResourceItem[],
  {
    q = "",
    type = "",
    area = "",
    framework = "",
    right = "",
  }: {
    q?: string;
    type?: string;
    area?: string;
    framework?: string;
    right?: string;
  }
) {
  const normalizedQuery = q.trim().toLowerCase();
  const normalizedType = type.trim().toLowerCase();
  const normalizedArea = area.trim().toLowerCase();
  const normalizedFramework = framework.trim().toLowerCase();
  const normalizedRight = right.trim().toLowerCase();

  return resources.filter((resource) => {
    if (normalizedType && resource.type !== normalizedType) return false;
    if (normalizedFramework && resource.countryOrFramework !== normalizedFramework) return false;
    if (normalizedArea && resource.legalArea.toLowerCase() !== normalizedArea) return false;
    if (
      normalizedRight &&
      !resource.relatedHumanRights.some((entry) => entry.slug.toLowerCase() === normalizedRight)
    ) {
      return false;
    }

    if (!normalizedQuery) return true;

    const haystack = [
      resource.title,
      resource.shortDescription,
      resource.body,
      resource.legalArea,
      resource.sourceName,
      resource.whatIsThisFor,
      resource.whoCanUseIt,
      resource.whenToUseIt,
      ...resource.relatedHumanRights.map((entry) => entry.title),
      ...resource.tags.map((entry) => entry.name),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  });
}

export function getLegalResourceTypeLabel(type: LegalResourceType, lang: Lang) {
  const labels: Record<LegalResourceType, string> = {
    law: lang === "sr" ? "Zakon" : lang === "en" ? "Law" : lang === "tr" ? "Yasa" : lang === "fr" ? "Loi" : lang === "de" ? "Gesetz" : lang === "es" ? "Ley" : lang === "el" ? "Νόμος" : "قانون",
    guide: lang === "sr" ? "Vodič" : lang === "en" ? "Guide" : lang === "tr" ? "Rehber" : lang === "fr" ? "Guide" : lang === "de" ? "Leitfaden" : lang === "es" ? "Guía" : lang === "el" ? "Οδηγός" : "دليل",
    template: lang === "sr" ? "Obrazac" : lang === "en" ? "Template" : lang === "tr" ? "Şablon" : lang === "fr" ? "Modèle" : lang === "de" ? "Vorlage" : lang === "es" ? "Plantilla" : lang === "el" ? "Πρότυπο" : "نموذج",
    explainer: lang === "sr" ? "Objašnjenje" : lang === "en" ? "Explainer" : lang === "tr" ? "Açıklama" : lang === "fr" ? "Explication" : lang === "de" ? "Erklärung" : lang === "es" ? "Explicación" : lang === "el" ? "Επεξήγηση" : "شرح",
    international_document: lang === "sr" ? "Međunarodni dokument" : lang === "en" ? "International document" : lang === "tr" ? "Uluslararası belge" : lang === "fr" ? "Document international" : lang === "de" ? "Internationales Dokument" : lang === "es" ? "Documento internacional" : lang === "el" ? "Διεθνές έγγραφο" : "وثيقة دولية",
    official_source: lang === "sr" ? "Zvanični izvor" : lang === "en" ? "Official source" : lang === "tr" ? "Resmi kaynak" : lang === "fr" ? "Source officielle" : lang === "de" ? "Offizielle Quelle" : lang === "es" ? "Fuente oficial" : lang === "el" ? "Επίσημη πηγή" : "مصدر رسمي",
    other: lang === "sr" ? "Drugo" : lang === "en" ? "Other" : lang === "tr" ? "Diğer" : lang === "fr" ? "Autre" : lang === "de" ? "Andere" : lang === "es" ? "Otro" : lang === "el" ? "Άλλο" : "أخرى",
  };

  return labels[type];
}

export function getFrameworkLabel(framework: LegalResourceFramework, lang: Lang) {
  const labels: Record<LegalResourceFramework, string> = {
    serbia: lang === "sr" ? "Srbija" : lang === "en" ? "Serbia" : lang === "tr" ? "Sırbistan" : lang === "fr" ? "Serbie" : lang === "de" ? "Serbien" : lang === "es" ? "Serbia" : lang === "el" ? "Σερβία" : "صربيا",
    regional: lang === "sr" ? "Regionalno" : lang === "en" ? "Regional" : lang === "tr" ? "Bölgesel" : lang === "fr" ? "Régional" : lang === "de" ? "Regional" : lang === "es" ? "Regional" : lang === "el" ? "Περιφερειακό" : "إقليمي",
    international: lang === "sr" ? "Međunarodno" : lang === "en" ? "International" : lang === "tr" ? "Uluslararası" : lang === "fr" ? "International" : lang === "de" ? "International" : lang === "es" ? "Internacional" : lang === "el" ? "Διεθνές" : "دولي",
    eu: lang === "sr" ? "Evropska unija" : lang === "en" ? "European Union" : lang === "tr" ? "Avrupa Birliği" : lang === "fr" ? "Union européenne" : lang === "de" ? "Europäische Union" : lang === "es" ? "Unión Europea" : lang === "el" ? "Ευρωπαϊκή Ένωση" : "الاتحاد الأوروبي",
    council_of_europe: lang === "sr" ? "Savet Evrope" : lang === "en" ? "Council of Europe" : lang === "tr" ? "Avrupa Konseyi" : lang === "fr" ? "Conseil de l'Europe" : lang === "de" ? "Europarat" : lang === "es" ? "Consejo de Europa" : lang === "el" ? "Συμβούλιο της Ευρώπης" : "مجلس أوروبا",
    un: lang === "sr" ? "Ujedinjene nacije" : lang === "en" ? "United Nations" : lang === "tr" ? "Birleşmiş Milletler" : lang === "fr" ? "Nations unies" : lang === "de" ? "Vereinte Nationen" : lang === "es" ? "Naciones Unidas" : lang === "el" ? "Ηνωμένα Έθνη" : "الأمم المتحدة",
    other: lang === "sr" ? "Drugo" : lang === "en" ? "Other" : lang === "tr" ? "Diğer" : lang === "fr" ? "Autre" : lang === "de" ? "Andere" : lang === "es" ? "Otro" : lang === "el" ? "Άλλο" : "أخرى",
  };

  return labels[framework];
}
