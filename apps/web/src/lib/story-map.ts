import { getAuthorNames, localizeTopic } from "@/lib/content";
import type { DocumentaryItem } from "@/lib/documentaries";
import type { PublishedArticle } from "@/lib/editorial";
import type { Lang } from "@/lib/i18n";
import { getDictionary, withLang } from "@/lib/i18n";
import { unwrapStrapiCollection } from "@/lib/strapi";

type StoryMapCopy = {
  label: string;
  title: string;
  intro: string;
  searchPlaceholder: string;
  allLocations: string;
  allSections: string;
  allTopics: string;
  allContentLabel: string;
  openStory: string;
  showAllFromLocation: string;
  noStoriesForLocation: string;
  emptyTitle: string;
  emptyCopy: string;
  locationPanelLabel: string;
  mapStageLabel: string;
  filtersLabel: string;
  closeLabel: string;
  textsLabel: string;
  textsOnlyLabel: string;
  documentariesLabel: string;
  documentariesOnlyLabel: string;
  mapLoadingTitle: string;
  mapLoadingCopy: string;
  zoomInLabel: string;
  zoomOutLabel: string;
  resetViewLabel: string;
  storiesCountSingular: string;
  storiesCountPlural: string;
};

type StoryMapLocalizedNames = Record<Lang, string>;

type StoryMapCatalogEntry = {
  slug: string;
  canonicalName: string;
  country?: string;
  region?: string;
  latitude: number;
  longitude: number;
  names: StoryMapLocalizedNames;
  aliases?: string[];
};

type StoryMapLocationRecord = {
  name: string;
  name_en?: string;
  name_tr?: string;
  name_fr?: string;
  name_de?: string;
  name_es?: string;
  name_el?: string;
  name_ar?: string;
  slug: string;
  country?: string;
  region?: string;
  latitude?: number;
  longitude?: number;
  active?: boolean;
};

export type StoryMapEntryType = "article" | "documentary";

export type StoryMapEntry = {
  id: string;
  type: StoryMapEntryType;
  title: string;
  href: string;
  sectionKey: string;
  sectionLabel: string;
  date?: string;
  publishedAt?: string;
  author?: string;
  topics: string[];
  topicSlugs: string[];
  locationSlug: string;
};

export type StoryMapLocationGroup = {
  slug: string;
  name: string;
  canonicalName: string;
  country?: string;
  region?: string;
  latitude: number;
  longitude: number;
  x: number;
  y: number;
  totalCount: number;
  articleCount: number;
  documentaryCount: number;
  entries: StoryMapEntry[];
  archiveHref: string;
  searchHref: string;
};

export type StoryMapData = {
  groups: StoryMapLocationGroup[];
  topics: Array<{ slug: string; name: string }>;
  sections: Array<{ key: string; label: string }>;
};

const MAP_BOUNDS = {
  minLongitude: 10,
  maxLongitude: 41,
  minLatitude: 30,
  maxLatitude: 48,
};

const storyMapCopyByLang: Record<Lang, StoryMapCopy> = {
  sr: {
    label: "Mapa priča",
    title: "MAPA PRIČA",
    intro: "Istraži Avangardine priče kroz mesta, zajednice i događaje koji ih oblikuju.",
    searchPlaceholder: "Pronađi priče po mestu",
    allLocations: "Sve lokacije",
    allSections: "Sve sekcije",
    allTopics: "Sve teme",
    allContentLabel: "Sve",
    openStory: "Otvori priču",
    showAllFromLocation: "Prikaži sve sa ove lokacije",
    noStoriesForLocation: "Nema priča za ovu lokaciju",
    emptyTitle: "Mapa priča se puni.",
    emptyCopy: "Prve lokacije biće vidljive uskoro.",
    locationPanelLabel: "Lokacije",
    mapStageLabel: "Mapa priča",
    filtersLabel: "Filteri",
    closeLabel: "Zatvori",
    textsLabel: "Tekstovi",
    textsOnlyLabel: "Samo tekstovi",
    documentariesLabel: "Dokumentarci",
    documentariesOnlyLabel: "Samo dokumentarci",
    mapLoadingTitle: "Mapa se učitava.",
    mapLoadingCopy: "Pripremamo lokacije i priče za pregled.",
    zoomInLabel: "Uvećaj mapu",
    zoomOutLabel: "Umanji mapu",
    resetViewLabel: "Vrati pregled",
    storiesCountSingular: "priča",
    storiesCountPlural: "priče",
  },
  en: {
    label: "Story Map",
    title: "STORY MAP",
    intro: "Explore Avangarda’s stories through the places, communities and events behind them.",
    searchPlaceholder: "Find stories by place",
    allLocations: "All locations",
    allSections: "All sections",
    allTopics: "All topics",
    allContentLabel: "Everything",
    openStory: "Open story",
    showAllFromLocation: "Show all from this location",
    noStoriesForLocation: "No stories for this location",
    emptyTitle: "The story map is filling up.",
    emptyCopy: "The first locations will appear soon.",
    locationPanelLabel: "Locations",
    mapStageLabel: "Story map",
    filtersLabel: "Filters",
    closeLabel: "Close",
    textsLabel: "Stories",
    textsOnlyLabel: "Stories only",
    documentariesLabel: "Documentaries",
    documentariesOnlyLabel: "Documentaries only",
    mapLoadingTitle: "Loading the map.",
    mapLoadingCopy: "Preparing locations and stories for the map.",
    zoomInLabel: "Zoom in",
    zoomOutLabel: "Zoom out",
    resetViewLabel: "Reset view",
    storiesCountSingular: "story",
    storiesCountPlural: "stories",
  },
  tr: {
    label: "Hikâye Haritası",
    title: "HIKÂYE HARITASI",
    intro: "Avangarda’nın hikâyelerini onları biçimlendiren yerler, topluluklar ve olaylar üzerinden keşfet.",
    searchPlaceholder: "Hikâyeleri konuma göre bul",
    allLocations: "Tüm konumlar",
    allSections: "Tüm bölümler",
    allTopics: "Tüm temalar",
    allContentLabel: "Tümü",
    openStory: "Hikâyeyi aç",
    showAllFromLocation: "Bu konumdaki tüm içerikleri göster",
    noStoriesForLocation: "Bu konum için hikâye yok",
    emptyTitle: "Hikâye haritası doluyor.",
    emptyCopy: "İlk konumlar yakında görünecek.",
    locationPanelLabel: "Konumlar",
    mapStageLabel: "Hikâye haritası",
    filtersLabel: "Filtreler",
    closeLabel: "Kapat",
    textsLabel: "Metinler",
    textsOnlyLabel: "Yalnızca metinler",
    documentariesLabel: "Belgeseller",
    documentariesOnlyLabel: "Yalnızca belgeseller",
    mapLoadingTitle: "Harita yükleniyor.",
    mapLoadingCopy: "Konumlar ve hikâyeler hazırlanıyor.",
    zoomInLabel: "Yakınlaştır",
    zoomOutLabel: "Uzaklaştır",
    resetViewLabel: "Görünümü sıfırla",
    storiesCountSingular: "hikâye",
    storiesCountPlural: "hikâye",
  },
  fr: {
    label: "Carte des récits",
    title: "CARTE DES RÉCITS",
    intro: "Explore les récits d’Avangarda à travers les lieux, les communautés et les événements qui les façonnent.",
    searchPlaceholder: "Trouver des récits par lieu",
    allLocations: "Tous les lieux",
    allSections: "Toutes les sections",
    allTopics: "Tous les thèmes",
    allContentLabel: "Tout",
    openStory: "Ouvrir le récit",
    showAllFromLocation: "Afficher tout depuis ce lieu",
    noStoriesForLocation: "Aucun récit pour ce lieu",
    emptyTitle: "La carte des récits se remplit.",
    emptyCopy: "Les premiers lieux apparaîtront bientôt.",
    locationPanelLabel: "Lieux",
    mapStageLabel: "Carte des récits",
    filtersLabel: "Filtres",
    closeLabel: "Fermer",
    textsLabel: "Récits",
    textsOnlyLabel: "Récits seulement",
    documentariesLabel: "Documentaires",
    documentariesOnlyLabel: "Documentaires seulement",
    mapLoadingTitle: "Chargement de la carte.",
    mapLoadingCopy: "Les lieux et les récits se préparent.",
    zoomInLabel: "Zoomer",
    zoomOutLabel: "Dézoomer",
    resetViewLabel: "Réinitialiser la vue",
    storiesCountSingular: "récit",
    storiesCountPlural: "récits",
  },
  de: {
    label: "Karte der Geschichten",
    title: "KARTE DER GESCHICHTEN",
    intro: "Erkunde Avangardas Geschichten durch Orte, Gemeinschaften und Ereignisse, die sie prägen.",
    searchPlaceholder: "Geschichten nach Ort finden",
    allLocations: "Alle Orte",
    allSections: "Alle Sektionen",
    allTopics: "Alle Themen",
    allContentLabel: "Alles",
    openStory: "Geschichte öffnen",
    showAllFromLocation: "Alles von diesem Ort anzeigen",
    noStoriesForLocation: "Keine Geschichten für diesen Ort",
    emptyTitle: "Die Karte der Geschichten füllt sich.",
    emptyCopy: "Die ersten Orte werden bald sichtbar sein.",
    locationPanelLabel: "Orte",
    mapStageLabel: "Karte der Geschichten",
    filtersLabel: "Filter",
    closeLabel: "Schließen",
    textsLabel: "Texte",
    textsOnlyLabel: "Nur Texte",
    documentariesLabel: "Dokumentarfilme",
    documentariesOnlyLabel: "Nur Dokumentarfilme",
    mapLoadingTitle: "Karte wird geladen.",
    mapLoadingCopy: "Orte und Geschichten werden vorbereitet.",
    zoomInLabel: "Vergrößern",
    zoomOutLabel: "Verkleinern",
    resetViewLabel: "Ansicht zurücksetzen",
    storiesCountSingular: "Geschichte",
    storiesCountPlural: "Geschichten",
  },
  es: {
    label: "Mapa de historias",
    title: "MAPA DE HISTORIAS",
    intro: "Explora las historias de Avangarda a través de los lugares, las comunidades y los acontecimientos que las moldean.",
    searchPlaceholder: "Encuentra historias por lugar",
    allLocations: "Todas las ubicaciones",
    allSections: "Todas las secciones",
    allTopics: "Todos los temas",
    allContentLabel: "Todo",
    openStory: "Abrir historia",
    showAllFromLocation: "Mostrar todo desde esta ubicación",
    noStoriesForLocation: "No hay historias para esta ubicación",
    emptyTitle: "El mapa de historias se está llenando.",
    emptyCopy: "Las primeras ubicaciones aparecerán pronto.",
    locationPanelLabel: "Ubicaciones",
    mapStageLabel: "Mapa de historias",
    filtersLabel: "Filtros",
    closeLabel: "Cerrar",
    textsLabel: "Textos",
    textsOnlyLabel: "Solo textos",
    documentariesLabel: "Documentales",
    documentariesOnlyLabel: "Solo documentales",
    mapLoadingTitle: "Cargando el mapa.",
    mapLoadingCopy: "Estamos preparando ubicaciones e historias.",
    zoomInLabel: "Acercar",
    zoomOutLabel: "Alejar",
    resetViewLabel: "Restablecer vista",
    storiesCountSingular: "historia",
    storiesCountPlural: "historias",
  },
  el: {
    label: "Χάρτης ιστοριών",
    title: "ΧΑΡΤΗΣ ΙΣΤΟΡΙΩΝ",
    intro: "Εξερεύνησε τις ιστορίες της Avangarda μέσα από τους τόπους, τις κοινότητες και τα γεγονότα που τις διαμορφώνουν.",
    searchPlaceholder: "Βρες ιστορίες ανά τοποθεσία",
    allLocations: "Όλες οι τοποθεσίες",
    allSections: "Όλες οι ενότητες",
    allTopics: "Όλα τα θέματα",
    allContentLabel: "Όλα",
    openStory: "Άνοιγμα ιστορίας",
    showAllFromLocation: "Εμφάνιση όλων από αυτή την τοποθεσία",
    noStoriesForLocation: "Δεν υπάρχουν ιστορίες για αυτή την τοποθεσία",
    emptyTitle: "Ο χάρτης ιστοριών γεμίζει.",
    emptyCopy: "Οι πρώτες τοποθεσίες θα εμφανιστούν σύντομα.",
    locationPanelLabel: "Τοποθεσίες",
    mapStageLabel: "Χάρτης ιστοριών",
    filtersLabel: "Φίλτρα",
    closeLabel: "Κλείσιμο",
    textsLabel: "Κείμενα",
    textsOnlyLabel: "Μόνο κείμενα",
    documentariesLabel: "Ντοκιμαντέρ",
    documentariesOnlyLabel: "Μόνο ντοκιμαντέρ",
    mapLoadingTitle: "Ο χάρτης φορτώνει.",
    mapLoadingCopy: "Ετοιμάζουμε τοποθεσίες και ιστορίες.",
    zoomInLabel: "Μεγέθυνση",
    zoomOutLabel: "Σμίκρυνση",
    resetViewLabel: "Επαναφορά προβολής",
    storiesCountSingular: "ιστορία",
    storiesCountPlural: "ιστορίες",
  },
  ar: {
    label: "خريطة القصص",
    title: "خريطة القصص",
    intro: "استكشف قصص أفانغاردا من خلال الأماكن والمجتمعات والأحداث التي تصوغها.",
    searchPlaceholder: "اعثر على القصص حسب المكان",
    allLocations: "كل المواقع",
    allSections: "كل الأقسام",
    allTopics: "كل الموضوعات",
    allContentLabel: "الكل",
    openStory: "افتح القصة",
    showAllFromLocation: "اعرض كل ما يتعلق بهذا الموقع",
    noStoriesForLocation: "لا توجد قصص لهذا الموقع",
    emptyTitle: "خريطة القصص قيد الامتلاء.",
    emptyCopy: "ستظهر أولى المواقع قريباً.",
    locationPanelLabel: "المواقع",
    mapStageLabel: "خريطة القصص",
    filtersLabel: "الفلاتر",
    closeLabel: "إغلاق",
    textsLabel: "النصوص",
    textsOnlyLabel: "النصوص فقط",
    documentariesLabel: "الوثائقيات",
    documentariesOnlyLabel: "الوثائقيات فقط",
    mapLoadingTitle: "يتم تحميل الخريطة.",
    mapLoadingCopy: "نجهز المواقع والقصص لعرضها.",
    zoomInLabel: "تكبير",
    zoomOutLabel: "تصغير",
    resetViewLabel: "إعادة الضبط",
    storiesCountSingular: "قصة",
    storiesCountPlural: "قصص",
  },
};

const storyMapCatalog: StoryMapCatalogEntry[] = [
  {
    slug: "novi-pazar",
    canonicalName: "Novi Pazar",
    country: "Serbia",
    region: "Sandzak",
    latitude: 43.1367,
    longitude: 20.5161,
    names: {
      sr: "Novi Pazar",
      en: "Novi Pazar",
      tr: "Novi Pazar",
      fr: "Novi Pazar",
      de: "Novi Pazar",
      es: "Novi Pazar",
      el: "Νόβι Παζάρ",
      ar: "نوفي بازار",
    },
  },
  {
    slug: "rogozna",
    canonicalName: "Rogozna",
    country: "Serbia",
    region: "Sandzak",
    latitude: 43.014444,
    longitude: 20.58,
    names: {
      sr: "Rogozna",
      en: "Rogozna",
      tr: "Rogozna",
      fr: "Rogozna",
      de: "Rogozna",
      es: "Rogozna",
      el: "Ρογκόζνα",
      ar: "روغوزنا",
    },
  },
  {
    slug: "palestina",
    canonicalName: "Palestina",
    country: "Palestine",
    region: "Levant",
    latitude: 31.9522,
    longitude: 35.2332,
    names: {
      sr: "Palestina",
      en: "Palestine",
      tr: "Filistin",
      fr: "Palestine",
      de: "Palästina",
      es: "Palestina",
      el: "Παλαιστίνη",
      ar: "فلسطين",
    },
    aliases: ["west bank", "gaza"],
  },
  {
    slug: "beograd",
    canonicalName: "Beograd",
    country: "Serbia",
    region: "Belgrade",
    latitude: 44.7866,
    longitude: 20.4489,
    names: {
      sr: "Beograd",
      en: "Belgrade",
      tr: "Belgrad",
      fr: "Belgrade",
      de: "Belgrad",
      es: "Belgrado",
      el: "Βελιγράδι",
      ar: "بلغراد",
    },
  },
  {
    slug: "bor",
    canonicalName: "Bor",
    country: "Serbia",
    region: "Eastern Serbia",
    latitude: 44.0749,
    longitude: 22.0959,
    names: {
      sr: "Bor",
      en: "Bor",
      tr: "Bor",
      fr: "Bor",
      de: "Bor",
      es: "Bor",
      el: "Μπορ",
      ar: "بور",
    },
  },
  {
    slug: "majdanpek",
    canonicalName: "Majdanpek",
    country: "Serbia",
    region: "Eastern Serbia",
    latitude: 44.4277,
    longitude: 21.9459,
    names: {
      sr: "Majdanpek",
      en: "Majdanpek",
      tr: "Majdanpek",
      fr: "Majdanpek",
      de: "Majdanpek",
      es: "Majdanpek",
      el: "Μάιντανπεκ",
      ar: "مايدانبيك",
    },
  },
  {
    slug: "pancevo",
    canonicalName: "Pančevo",
    country: "Serbia",
    region: "Vojvodina",
    latitude: 44.8718,
    longitude: 20.6403,
    names: {
      sr: "Pančevo",
      en: "Pancevo",
      tr: "Pançevo",
      fr: "Pančevo",
      de: "Pancevo",
      es: "Pančevo",
      el: "Πάντσεβο",
      ar: "بانتشيفو",
    },
    aliases: ["pancevo"],
  },
  {
    slug: "vranje",
    canonicalName: "Vranje",
    country: "Serbia",
    region: "Southern Serbia",
    latitude: 42.5514,
    longitude: 21.9003,
    names: {
      sr: "Vranje",
      en: "Vranje",
      tr: "Vranje",
      fr: "Vranje",
      de: "Vranje",
      es: "Vranje",
      el: "Βράνιε",
      ar: "فرانيه",
    },
  },
  {
    slug: "kraljevo",
    canonicalName: "Kraljevo",
    country: "Serbia",
    region: "Central Serbia",
    latitude: 43.7234,
    longitude: 20.6870,
    names: {
      sr: "Kraljevo",
      en: "Kraljevo",
      tr: "Kraljevo",
      fr: "Kraljevo",
      de: "Kraljevo",
      es: "Kraljevo",
      el: "Κράλιεβο",
      ar: "كرالييفو",
    },
  },
  {
    slug: "rozaje",
    canonicalName: "Rožaje",
    country: "Montenegro",
    region: "Sandzak",
    latitude: 42.8330,
    longitude: 20.1665,
    names: {
      sr: "Rožaje",
      en: "Rozaje",
      tr: "Rozaje",
      fr: "Rožaje",
      de: "Rozaje",
      es: "Rozaje",
      el: "Ροζάγιε",
      ar: "روجايه",
    },
    aliases: ["rozaje"],
  },
  {
    slug: "konstanca",
    canonicalName: "Konstanca",
    country: "Romania",
    region: "Dobruja",
    latitude: 44.1598,
    longitude: 28.6348,
    names: {
      sr: "Konstanca",
      en: "Constanța",
      tr: "Köstence",
      fr: "Constanța",
      de: "Konstanza",
      es: "Constanza",
      el: "Κωνστάντζα",
      ar: "كونستانتسا",
    },
    aliases: ["constanta", "constanța", "constanza"],
  },
  {
    slug: "zapadni-balkan",
    canonicalName: "Zapadni Balkan",
    country: "Balkans",
    region: "Western Balkans",
    latitude: 43.5,
    longitude: 19.5,
    names: {
      sr: "Zapadni Balkan",
      en: "Western Balkans",
      tr: "Batı Balkanlar",
      fr: "Balkans occidentaux",
      de: "Westbalkan",
      es: "Balcanes occidentales",
      el: "Δυτικά Βαλκάνια",
      ar: "غرب البلقان",
    },
  },
  {
    slug: "srbija",
    canonicalName: "Srbija",
    country: "Serbia",
    region: "Serbia",
    latitude: 44.0165,
    longitude: 21.0059,
    names: {
      sr: "Srbija",
      en: "Serbia",
      tr: "Sırbistan",
      fr: "Serbie",
      de: "Serbien",
      es: "Serbia",
      el: "Σερβία",
      ar: "صربيا",
    },
  },
  {
    slug: "balkan",
    canonicalName: "Balkan",
    country: "Balkans",
    region: "Southeast Europe",
    latitude: 42.7,
    longitude: 22.0,
    names: {
      sr: "Balkan",
      en: "Balkans",
      tr: "Balkan",
      fr: "Balkans",
      de: "Balkan",
      es: "Balcanes",
      el: "Βαλκάνια",
      ar: "البلقان",
    },
  },
];

function normalizeValue(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function toNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function getLocalizedLocationName(record: StoryMapLocationRecord, lang: Lang) {
  if (lang === "sr") {
    return record.name.trim();
  }

  const suffixByLang: Record<Exclude<Lang, "sr">, keyof StoryMapLocationRecord> = {
    en: "name_en",
    tr: "name_tr",
    fr: "name_fr",
    de: "name_de",
    es: "name_es",
    el: "name_el",
    ar: "name_ar",
  };

  const localizedKey = suffixByLang[lang];
  const localizedValue = record[localizedKey];
  return typeof localizedValue === "string" && localizedValue.trim() ? localizedValue.trim() : record.name.trim();
}

function formatDate(value: string | undefined, lang: Lang) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat(lang === "sr" ? "sr-Latn-RS" : lang, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function getSectionLabel(section: string | undefined, lang: Lang) {
  const t = getDictionary(lang);
  switch (section) {
    case "front":
      return t.navNews;
    case "analysis":
      return t.navAnalysis;
    case "interview":
      return t.navInterview;
    case "column":
      return t.navColumn;
    default:
      return t.navArchive;
  }
}

function getDocumentaryLabel(lang: Lang) {
  return getStoryMapCopy(lang).documentariesLabel;
}

function getStoryCountLabel(count: number, lang: Lang) {
  const copy = getStoryMapCopy(lang);
  if (count === 1) {
    return `1 ${copy.storiesCountSingular}`;
  }
  return `${count} ${copy.storiesCountPlural}`;
}

function buildStoryMapHref(pathname: string, lang: Lang, params?: Record<string, string>) {
  const url = new URL(`https://avangarda.media${withLang(pathname, lang)}`);
  for (const [key, value] of Object.entries(params || {})) {
    if (value.trim()) {
      url.searchParams.set(key, value);
    }
  }

  return `${url.pathname}?${url.searchParams.toString()}`;
}

function buildAliases(entry: StoryMapCatalogEntry) {
  const aliases = new Set<string>();
  aliases.add(normalizeValue(entry.slug.replace(/-/g, " ")));
  aliases.add(normalizeValue(entry.canonicalName));
  aliases.add(normalizeValue(entry.slug));
  for (const value of Object.values(entry.names)) {
    aliases.add(normalizeValue(value));
  }
  for (const alias of entry.aliases || []) {
    aliases.add(normalizeValue(alias));
  }
  return Array.from(aliases).filter(Boolean);
}

function longestSharedPrefix(left: string, right: string) {
  const limit = Math.min(left.length, right.length);
  let count = 0;

  for (let index = 0; index < limit; index += 1) {
    if (left[index] !== right[index]) {
      break;
    }
    count += 1;
  }

  return count;
}

const catalogIndex = storyMapCatalog.map((entry) => ({
  ...entry,
  normalizedAliases: buildAliases(entry),
}));

function getLocationRecords(value: unknown): StoryMapLocationRecord[] {
  return unwrapStrapiCollection<Record<string, unknown>>(value)
    .map((record) => ({
      name: typeof record.name === "string" ? record.name.trim() : "",
      name_en: typeof record.name_en === "string" ? record.name_en.trim() : "",
      name_tr: typeof record.name_tr === "string" ? record.name_tr.trim() : "",
      name_fr: typeof record.name_fr === "string" ? record.name_fr.trim() : "",
      name_de: typeof record.name_de === "string" ? record.name_de.trim() : "",
      name_es: typeof record.name_es === "string" ? record.name_es.trim() : "",
      name_el: typeof record.name_el === "string" ? record.name_el.trim() : "",
      name_ar: typeof record.name_ar === "string" ? record.name_ar.trim() : "",
      slug: typeof record.slug === "string" ? record.slug.trim() : "",
      country: typeof record.country === "string" ? record.country.trim() : "",
      region: typeof record.region === "string" ? record.region.trim() : "",
      latitude: toNumber(record.latitude) ?? undefined,
      longitude: toNumber(record.longitude) ?? undefined,
      active: record.active !== false,
    }))
    .filter((record) => record.active !== false && (record.name || record.slug));
}

type ResolvedLocation = {
  slug: string;
  canonicalName: string;
  name: string;
  country?: string;
  region?: string;
  latitude: number;
  longitude: number;
};

function resolveCatalogLocationByValue(value: string) {
  const normalized = normalizeValue(value);
  if (!normalized) return null;
  return catalogIndex.find((entry) => entry.normalizedAliases.includes(normalized)) || null;
}

function resolveLocationRecord(record: StoryMapLocationRecord, lang: Lang): ResolvedLocation | null {
  const bySlug = record.slug ? resolveCatalogLocationByValue(record.slug) : null;
  const byName = record.name ? resolveCatalogLocationByValue(record.name) : null;
  const match = bySlug || byName;
  const localizedName = getLocalizedLocationName(record, lang);
  const canonicalName = record.name || record.slug;

  if (match) {
    return {
      slug: record.slug || match.slug,
      canonicalName: canonicalName || match.canonicalName,
      name: localizedName || match.names[lang],
      country: record.country || match.country,
      region: record.region || match.region,
      latitude: record.latitude ?? match.latitude,
      longitude: record.longitude ?? match.longitude,
    };
  }

  if (record.latitude != null && record.longitude != null && (record.name || record.slug)) {
    const fallbackName = localizedName || record.name || record.slug;
    return {
      slug: record.slug || normalizeValue(fallbackName).replace(/\s+/g, "-"),
      canonicalName: canonicalName || fallbackName,
      name: fallbackName,
      country: record.country,
      region: record.region,
      latitude: record.latitude,
      longitude: record.longitude,
    };
  }

  return null;
}

function resolveDocumentaryLocation(value: string | undefined, lang: Lang): ResolvedLocation | null {
  if (!value) return null;
  const match = resolveCatalogLocationByValue(value);
  if (!match) return null;

  return {
    slug: match.slug,
    canonicalName: match.canonicalName,
    name: match.names[lang],
    country: match.country,
    region: match.region,
    latitude: match.latitude,
    longitude: match.longitude,
  };
}

function getMapPosition(latitude: number, longitude: number) {
  const x = ((longitude - MAP_BOUNDS.minLongitude) / (MAP_BOUNDS.maxLongitude - MAP_BOUNDS.minLongitude)) * 100;
  const y = (1 - (latitude - MAP_BOUNDS.minLatitude) / (MAP_BOUNDS.maxLatitude - MAP_BOUNDS.minLatitude)) * 100;

  return {
    x: Math.min(92, Math.max(8, Number(x.toFixed(2)))),
    y: Math.min(88, Math.max(10, Number(y.toFixed(2)))),
  };
}

export function getStoryMapLabel(lang: Lang) {
  return getStoryMapCopy(lang).label;
}

export function getStoryMapCopy(lang: Lang) {
  return storyMapCopyByLang[lang];
}

export function findStoryMapLocationQuery(message: string, lang: Lang) {
  const normalized = normalizeValue(message);
  const tokens = normalized.split(" ").filter(Boolean);
  const byLongest = [...catalogIndex]
    .map((entry) => {
      let matchedAlias = "";
      let score = 0;

      for (const alias of entry.normalizedAliases) {
        if (!alias) continue;

        if (normalized.includes(alias)) {
          const exactScore = 200 + alias.length;
          if (exactScore > score) {
            matchedAlias = alias;
            score = exactScore;
          }
          continue;
        }

        for (const token of tokens) {
          const shared = longestSharedPrefix(token, alias);
          if (shared >= 5) {
            const fuzzyScore = 100 + shared - Math.abs(token.length - alias.length);
            if (fuzzyScore > score) {
              matchedAlias = alias;
              score = fuzzyScore;
            }
          }
        }
      }

      return matchedAlias
        ? {
            slug: entry.slug,
            canonicalName: entry.canonicalName,
            name: entry.names[lang],
            matchedAlias,
            score,
          }
        : null;
    })
    .filter(Boolean)
    .sort((left, right) => right!.score - left!.score || right!.matchedAlias.length - left!.matchedAlias.length)[0];

  return byLongest || null;
}

export function buildStoryMapData({
  articles,
  documentaries,
  lang,
}: {
  articles: PublishedArticle[];
  documentaries: DocumentaryItem[];
  lang: Lang;
}): StoryMapData {
  const grouped = new Map<
    string,
    {
      meta: ResolvedLocation;
      entries: StoryMapEntry[];
      articleCount: number;
      documentaryCount: number;
    }
  >();
  const topics = new Map<string, { slug: string; name: string }>();
  const sections = [
    { key: "", label: getStoryMapCopy(lang).allSections },
    { key: "front", label: getSectionLabel("front", lang) },
    { key: "analysis", label: getSectionLabel("analysis", lang) },
    { key: "interview", label: getSectionLabel("interview", lang) },
    { key: "column", label: getSectionLabel("column", lang) },
  ];

  for (const article of articles) {
    const articleTopics = unwrapStrapiCollection<Record<string, unknown>>(article.topics).map((topic) => {
      const localized = localizeTopic(topic, lang);
      return {
        slug: typeof localized.slug === "string" ? localized.slug.trim() : "",
        name: typeof localized.name === "string" ? localized.name.trim() : "",
      };
    });

    for (const topic of articleTopics) {
      if (topic.slug && topic.name && !topics.has(topic.slug)) {
        topics.set(topic.slug, topic);
      }
    }

    const locations = getLocationRecords(article.locations)
      .map((location) => resolveLocationRecord(location, lang))
      .filter((location): location is ResolvedLocation => Boolean(location));

    for (const location of locations) {
      const existing = grouped.get(location.slug) || {
        meta: location,
        entries: [],
        articleCount: 0,
        documentaryCount: 0,
      };

      existing.articleCount += 1;
      existing.entries.push({
        id: `article-${article.id}-${location.slug}`,
        type: "article",
        title: article.title,
        href: withLang(`/a/${article.slug}`, lang),
        sectionKey: article.section || "",
        sectionLabel: getSectionLabel(article.section, lang),
        date: formatDate(article.publishedAt, lang),
        publishedAt: article.publishedAt,
        author: getAuthorNames(article.authors).join(", "),
        topics: articleTopics.map((topic) => topic.name).filter(Boolean),
        topicSlugs: articleTopics.map((topic) => topic.slug).filter(Boolean),
        locationSlug: location.slug,
      });

      grouped.set(location.slug, existing);
    }
  }

  for (const documentary of documentaries) {
    const location = resolveDocumentaryLocation(documentary.location, lang);
    if (!location) continue;

    const existing = grouped.get(location.slug) || {
      meta: location,
      entries: [],
      articleCount: 0,
      documentaryCount: 0,
    };

    existing.documentaryCount += 1;
    existing.entries.push({
      id: `documentary-${documentary.id}-${location.slug}`,
      type: "documentary",
      title: documentary.title,
      href: withLang("/dokumentarci", lang),
      sectionKey: "documentary",
      sectionLabel: getDocumentaryLabel(lang),
      date: formatDate(documentary.date, lang),
      publishedAt: documentary.date,
      author: documentary.director || "",
      topics: [],
      topicSlugs: [],
      locationSlug: location.slug,
    });

    grouped.set(location.slug, existing);
  }

  const groups = Array.from(grouped.values())
    .map(({ meta, entries, articleCount, documentaryCount }) => {
      const position = getMapPosition(meta.latitude, meta.longitude);
      const sortedEntries = entries.sort((left, right) => {
        const leftDate = left.publishedAt ? Date.parse(left.publishedAt) : 0;
        const rightDate = right.publishedAt ? Date.parse(right.publishedAt) : 0;
        return rightDate - leftDate;
      });

      return {
        slug: meta.slug,
        name: meta.name,
        canonicalName: meta.canonicalName,
        country: meta.country,
        region: meta.region,
        latitude: meta.latitude,
        longitude: meta.longitude,
        x: position.x,
        y: position.y,
        totalCount: sortedEntries.length,
        articleCount,
        documentaryCount,
        entries: sortedEntries,
        archiveHref: buildStoryMapHref("/archive", lang, { location: meta.slug }),
        searchHref: buildStoryMapHref("/search", lang, { q: meta.canonicalName }),
      };
    })
    .sort((left, right) => right.totalCount - left.totalCount || left.name.localeCompare(right.name));

  return {
    groups,
    topics: [
      { slug: "", name: getStoryMapCopy(lang).allTopics },
      ...Array.from(topics.values()).sort((left, right) => left.name.localeCompare(right.name)),
    ],
    sections,
  };
}

export function getStoryMapSeo(lang: Lang) {
  const copy = getStoryMapCopy(lang);

  return {
    title: `${copy.label} | Avangarda`,
    description: copy.intro,
  };
}

export function getStoryMapEntryLink(entry: StoryMapEntry, lang: Lang) {
  return buildStoryMapHref(entry.href.replace(/\?lang=[^&]+/, ""), lang);
}

export function getStoryMapLocationLink(locationSlug: string, lang: Lang) {
  return buildStoryMapHref("/mapa", lang, { location: locationSlug });
}

export function getStoryMapSearchHref(locationName: string, lang: Lang) {
  return buildStoryMapHref("/search", lang, { q: locationName });
}

export function getStoryMapCountLabel(count: number, lang: Lang) {
  return getStoryCountLabel(count, lang);
}
