import type { Lang } from "@/lib/i18n";
import { getStrapiMediaUrl, strapiGet, unwrapStrapiCollection } from "@/lib/strapi";
import { getYouTubeEmbedUrl, getYouTubeThumbnailUrl, getYouTubeVideoId, getYouTubeWatchUrl } from "@/lib/video";

const localizedSuffix: Record<Exclude<Lang, "sr">, string> = {
  en: "_en",
  tr: "_tr",
  fr: "_fr",
  de: "_de",
  es: "_es",
  el: "_el",
  ar: "_ar",
};

type LocalizedDocumentaryRecord = Record<string, unknown> & {
  id?: number | string;
  title?: string;
  title_en?: string;
  title_tr?: string;
  title_fr?: string;
  title_de?: string;
  slug?: string;
  description?: string;
  description_en?: string;
  description_tr?: string;
  description_fr?: string;
  description_de?: string;
  youtubeUrl?: string;
  youtubeVideoId?: string;
  thumbnail?: {
    url?: string;
    formats?: {
      large?: { url?: string };
      medium?: { url?: string };
      small?: { url?: string };
      thumbnail?: { url?: string };
    };
  };
  date?: string;
  location?: string;
  location_en?: string;
  location_tr?: string;
  location_fr?: string;
  location_de?: string;
  director?: string;
  director_en?: string;
  director_tr?: string;
  director_fr?: string;
  director_de?: string;
  duration?: string;
  duration_en?: string;
  duration_tr?: string;
  duration_fr?: string;
  duration_de?: string;
  isFeatured?: boolean;
  order?: number;
  isActive?: boolean;
};

const documentaryTextRepairs: Array<[string, string]> = [
  ["priÄe", "priče"],
  ["Å¡to", "što"],
  ["obiÄno", "obično"],
  ["najÄeÅ¡Ä‡e", "najčešće"],
  ["reÅ¾ija", "režija"],
  ["joÅ¡", "još"],
  ["SahayÄ±, insanlarÄ±, sistemi ve Ã§oÄŸu zaman kadraj dÄ±ÅŸÄ±nda kalan ÅŸeyi izleyen belgesel", "Sahayi, insanlari, sistemi ve çoğu zaman kadraj dışında kalan şeyi izleyen belgesel"],
  ["Tum belgeselleri ac", "Tüm belgeselleri aç"],
  ["Tum belgeseller", "Tüm belgeseller"],
  ["Yazar / yonetim", "Yazar / yönetim"],
  ["Sure", "Süre"],
  ["Video yakinda", "Video yakında"],
  ["YouTube baglantisi henuz gomulu oynatma icin gecerli degil", "YouTube bağlantısı henüz gömülü oynatma için geçerli değil"],
  ["rÃ©cits", "récits"],
  ["systÃ¨me", "système"],
  ["Recits video Avangarda", "Récits vidéo Avangarda"],
  ["realisation", "réalisation"],
  ["Duree", "Durée"],
  ["Video bientot", "Vidéo bientôt"],
  ["systeme", "système"],
  ["Ã¼ber", "über"],
  ["auÃŸerhalb", "außerhalb"],
  ["Ã¶ffnen", "öffnen"],
  ["fÃ¼r", "für"],
];

function normalizeDocumentaryText(value: string) {
  return documentaryTextRepairs.reduce((current, [broken, fixed]) => current.replaceAll(broken, fixed), value);
}

export type DocumentaryItem = {
  id: number | string;
  title: string;
  slug: string;
  description: string;
  youtubeUrl?: string;
  youtubeVideoId?: string;
  embedUrl?: string | null;
  externalUrl?: string | null;
  thumbnailUrl?: string | null;
  date?: string;
  location?: string;
  director?: string;
  duration?: string;
  isFeatured: boolean;
  order: number;
  isActive: boolean;
};

export type DocumentaryUiCopy = {
  label: string;
  headline: string;
  pageTitle: string;
  pageIntro: string;
  videoCueLabel: string;
  watchLabel: string;
  archiveLabel: string;
  watchAllLabel: string;
  locationLabel: string;
  directorLabel: string;
  durationLabel: string;
  dateLabel: string;
  unavailableLabel: string;
  unavailableCopy: string;
};

const fallbackDocumentariesByLang: Record<Lang, Array<Omit<DocumentaryItem, "embedUrl" | "externalUrl" | "thumbnailUrl">>> = {
  sr: [
    {
      id: "fallback-documentary-1",
      title: "Avangarda dokumentarci",
      slug: "avangarda-dokumentarci",
      description: "Dokumentarne priče koje prate teren, ljude, sistem i ono što obično ostane van kadra.",
      youtubeUrl: "https://www.youtube.com/watch?v=N1tVQEorBN0",
      youtubeVideoId: "N1tVQEorBN0",
      date: "2025-06-24",
      isFeatured: true,
      order: 1,
      isActive: true,
    },
  ],
  en: [
    {
      id: "fallback-documentary-1",
      title: "Avangarda documentaries",
      slug: "avangarda-documentaries",
      description: "Documentary stories following the field, the people, the system and what usually stays outside the frame.",
      youtubeUrl: "https://www.youtube.com/watch?v=N1tVQEorBN0",
      youtubeVideoId: "N1tVQEorBN0",
      date: "2025-06-24",
      isFeatured: true,
      order: 1,
      isActive: true,
    },
  ],
  tr: [
    {
      id: "fallback-documentary-1",
      title: "Avangarda belgeselleri",
      slug: "avangarda-belgeselleri",
      description: "Sahayi, insanları, sistemi ve çoğu zaman kadraj dışında kalan şeyi izleyen belgesel hikayeler.",
      youtubeUrl: "https://www.youtube.com/watch?v=N1tVQEorBN0",
      youtubeVideoId: "N1tVQEorBN0",
      date: "2025-06-24",
      isFeatured: true,
      order: 1,
      isActive: true,
    },
  ],
  fr: [
    {
      id: "fallback-documentary-1",
      title: "Documentaires Avangarda",
      slug: "documentaires-avangarda",
      description: "Des récits documentaires qui suivent le terrain, les personnes, le système et tout ce qui reste habituellement hors champ.",
      youtubeUrl: "https://www.youtube.com/watch?v=N1tVQEorBN0",
      youtubeVideoId: "N1tVQEorBN0",
      date: "2025-06-24",
      isFeatured: true,
      order: 1,
      isActive: true,
    },
  ],
  de: [
    {
      id: "fallback-documentary-1",
      title: "Avangarda Dokumentarfilme",
      slug: "avangarda-dokumentarfilme",
      description: "Dokumentarische Geschichten über Terrain, Menschen, Systeme und das, was meist außerhalb des Bildes bleibt.",
      youtubeUrl: "https://www.youtube.com/watch?v=N1tVQEorBN0",
      youtubeVideoId: "N1tVQEorBN0",
      date: "2025-06-24",
      isFeatured: true,
      order: 1,
      isActive: true,
    },
  ],
  es: [
    {
      id: "fallback-documentary-1",
      title: "Documentales de Avangarda",
      slug: "documentales-avangarda",
      description: "Historias documentales que siguen el terreno, la gente, el sistema y aquello que suele quedar fuera de cuadro.",
      youtubeUrl: "https://www.youtube.com/watch?v=N1tVQEorBN0",
      youtubeVideoId: "N1tVQEorBN0",
      date: "2025-06-24",
      isFeatured: true,
      order: 1,
      isActive: true,
    },
  ],
  el: [
    {
      id: "fallback-documentary-1",
      title: "Ντοκιμαντέρ Avangarda",
      slug: "ntokimanter-avangarda",
      description: "Ντοκιμαντερίστικες ιστορίες που ακολουθούν το πεδίο, τους ανθρώπους, το σύστημα και ό,τι συνήθως μένει έξω από το κάδρο.",
      youtubeUrl: "https://www.youtube.com/watch?v=N1tVQEorBN0",
      youtubeVideoId: "N1tVQEorBN0",
      date: "2025-06-24",
      isFeatured: true,
      order: 1,
      isActive: true,
    },
  ],
  ar: [
    {
      id: "fallback-documentary-1",
      title: "وثائقيات أفانغاردا",
      slug: "wathaiqiat-avangarda",
      description: "قصص وثائقية تتابع الميدان والناس والنظام وما يبقى غالباً خارج الكادر.",
      youtubeUrl: "https://www.youtube.com/watch?v=N1tVQEorBN0",
      youtubeVideoId: "N1tVQEorBN0",
      date: "2025-06-24",
      isFeatured: true,
      order: 1,
      isActive: true,
    },
  ],
};

const documentaryUiCopyByLang: Record<Lang, Omit<DocumentaryUiCopy, "videoCueLabel">> = {
  sr: {
    label: "Dokumentarci",
    headline: "Video priče Avangarde",
    pageTitle: "Dokumentarci",
    pageIntro: "Dokumentarne forme koje prate teren, ljude, sistem i ono što najčešće ostane van kadra.",
    watchLabel: "Pogledaj dokumentarac",
    archiveLabel: "Svi dokumentarci",
    watchAllLabel: "Otvorite sve dokumentarce",
    locationLabel: "Lokacija",
    directorLabel: "Autor / režija",
    durationLabel: "Trajanje",
    dateLabel: "Datum",
    unavailableLabel: "Video uskoro",
    unavailableCopy: "Dokumentarac je dodat u sistem, ali YouTube link još nije validan za embed prikaz.",
  },
  en: {
    label: "Documentaries",
    headline: "Avangarda video stories",
    pageTitle: "Documentaries",
    pageIntro: "Documentary forms following the field, the people, the system and what usually stays outside the frame.",
    watchLabel: "Watch documentary",
    archiveLabel: "All documentaries",
    watchAllLabel: "Open all documentaries",
    locationLabel: "Location",
    directorLabel: "Author / direction",
    durationLabel: "Duration",
    dateLabel: "Date",
    unavailableLabel: "Video soon",
    unavailableCopy: "The documentary is in the system, but the YouTube link is not yet valid for embedded playback.",
  },
  tr: {
    label: "Belgeseller",
    headline: "Avangarda video hikayeleri",
    pageTitle: "Belgeseller",
    pageIntro: "Sahayı, insanları, sistemi ve çoğu zaman kadraj dışında kalan şeyi izleyen belgesel formlar.",
    watchLabel: "Belgeseli izle",
    archiveLabel: "Tum belgeseller",
    watchAllLabel: "Tum belgeselleri ac",
    locationLabel: "Konum",
    directorLabel: "Yazar / yonetim",
    durationLabel: "Sure",
    dateLabel: "Tarih",
    unavailableLabel: "Video yakinda",
    unavailableCopy: "Belgesel sisteme eklendi ancak YouTube baglantisi henuz gomulu oynatma icin gecerli degil.",
  },
  fr: {
    label: "Documentaires",
    headline: "Recits video Avangarda",
    pageTitle: "Documentaires",
    pageIntro: "Des formes documentaires qui suivent le terrain, les personnes, le systeme et ce qui reste habituellement hors champ.",
    watchLabel: "Voir le documentaire",
    archiveLabel: "Tous les documentaires",
    watchAllLabel: "Ouvrir tous les documentaires",
    locationLabel: "Lieu",
    directorLabel: "Auteur / realisation",
    durationLabel: "Duree",
    dateLabel: "Date",
    unavailableLabel: "Video bientot",
    unavailableCopy: "Le documentaire existe dans le systeme, mais le lien YouTube n'est pas encore valide pour un embed.",
  },
  de: {
    label: "Dokumentarfilme",
    headline: "Avangarda Videogeschichten",
    pageTitle: "Dokumentarfilme",
    pageIntro: "Dokumentarische Formen, die Terrain, Menschen, Systeme und das verfolgen, was meist außerhalb des Bildes bleibt.",
    watchLabel: "Dokumentation ansehen",
    archiveLabel: "Alle Dokumentarfilme",
    watchAllLabel: "Alle Dokumentarfilme öffnen",
    locationLabel: "Ort",
    directorLabel: "Autor / Regie",
    durationLabel: "Dauer",
    dateLabel: "Datum",
    unavailableLabel: "Video folgt",
    unavailableCopy: "Die Dokumentation ist bereits im System, aber der YouTube-Link ist noch nicht für Embed-Wiedergabe gültig.",
  },
  es: {
    label: "Documentales",
    headline: "Historias en video de Avangarda",
    pageTitle: "Documentales",
    pageIntro: "Formas documentales que siguen el terreno, la gente, el sistema y lo que suele quedar fuera de cuadro.",
    watchLabel: "Ver documental",
    archiveLabel: "Todos los documentales",
    watchAllLabel: "Abrir todos los documentales",
    locationLabel: "Lugar",
    directorLabel: "Autor / dirección",
    durationLabel: "Duración",
    dateLabel: "Fecha",
    unavailableLabel: "Video pronto",
    unavailableCopy: "El documental ya está en el sistema, pero el enlace de YouTube todavía no es válido para reproducción embebida.",
  },
  el: {
    label: "Ντοκιμαντέρ",
    headline: "Ιστορίες βίντεο της Avangarda",
    pageTitle: "Ντοκιμαντέρ",
    pageIntro: "Ντοκιμαντερίστικες φόρμες που ακολουθούν το πεδίο, τους ανθρώπους, το σύστημα και όσα συνήθως μένουν έξω από το κάδρο.",
    watchLabel: "Δες το ντοκιμαντέρ",
    archiveLabel: "Όλα τα ντοκιμαντέρ",
    watchAllLabel: "Άνοιγμα όλων των ντοκιμαντέρ",
    locationLabel: "Τοποθεσία",
    directorLabel: "Συντάκτης / σκηνοθεσία",
    durationLabel: "Διάρκεια",
    dateLabel: "Ημερομηνία",
    unavailableLabel: "Βίντεο σύντομα",
    unavailableCopy: "Το ντοκιμαντέρ υπάρχει ήδη στο σύστημα, αλλά ο σύνδεσμος YouTube δεν είναι ακόμη έτοιμος για ενσωματωμένη αναπαραγωγή.",
  },
  ar: {
    label: "وثائقيات",
    headline: "قصص فيديو من أفانغاردا",
    pageTitle: "وثائقيات",
    pageIntro: "أشكال وثائقية تتابع الميدان والناس والنظام وما يبقى غالباً خارج الكادر.",
    watchLabel: "شاهد الوثائقي",
    archiveLabel: "كل الوثائقيات",
    watchAllLabel: "فتح كل الوثائقيات",
    locationLabel: "المكان",
    directorLabel: "الكاتب / الإخراج",
    durationLabel: "المدة",
    dateLabel: "التاريخ",
    unavailableLabel: "الفيديو قريباً",
    unavailableCopy: "الوثائقي موجود في النظام، لكن رابط YouTube ليس جاهزاً بعد للتشغيل المضمّن.",
  },
};

function pickLocalizedValue<T extends Record<string, unknown>>(record: T, key: string, lang: Lang) {
  const base = record[key];
  if (lang === "sr") {
    return typeof base === "string" ? normalizeDocumentaryText(base) : "";
  }

  const suffix = localizedSuffix[lang as Exclude<Lang, "sr">];
  const localized = record[`${key}${suffix}`];
  const value = typeof localized === "string" && localized.trim() ? localized : typeof base === "string" ? base : "";
  return typeof value === "string" ? normalizeDocumentaryText(value) : "";
}

function sortDocumentaries(items: DocumentaryItem[]) {
  return [...items].sort((left, right) => {
    const orderDelta = (left.order || 0) - (right.order || 0);
    if (orderDelta !== 0) return orderDelta;

    const dateDelta = Date.parse(right.date || "") - Date.parse(left.date || "");
    if (Number.isFinite(dateDelta) && dateDelta !== 0) return dateDelta;

    return Number(right.isFeatured) - Number(left.isFeatured);
  });
}

function normalizeDocumentaryRecord(
  record: LocalizedDocumentaryRecord,
  lang: Lang,
  autoplay = true
): DocumentaryItem | null {
  const title = pickLocalizedValue(record, "title", lang).trim();
  const description = pickLocalizedValue(record, "description", lang).trim();

  if (!title || !description) {
    return null;
  }

  const youtubeUrl = typeof record.youtubeUrl === "string" ? record.youtubeUrl.trim() : "";
  const youtubeVideoId = typeof record.youtubeVideoId === "string" ? record.youtubeVideoId.trim() : "";
  const thumbnailFromCms = record.thumbnail?.url
    ? getStrapiMediaUrl(
        record.thumbnail.formats?.large?.url ||
        record.thumbnail.formats?.medium?.url ||
        record.thumbnail.formats?.small?.url ||
        record.thumbnail.formats?.thumbnail?.url ||
        record.thumbnail.url
      )
    : "";

  const resolvedVideoId = getYouTubeVideoId(youtubeUrl, youtubeVideoId);

  return {
    id: record.id ?? `documentary-${title.toLowerCase().replace(/\s+/g, "-")}`,
    title,
    slug: typeof record.slug === "string" && record.slug.trim()
      ? record.slug.trim()
      : title.toLowerCase().replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, ""),
    description,
    youtubeUrl: youtubeUrl || undefined,
    youtubeVideoId: resolvedVideoId || undefined,
    embedUrl: getYouTubeEmbedUrl(youtubeUrl, "documentary", {
      autoplay,
      explicitId: youtubeVideoId || resolvedVideoId || null,
    }),
    externalUrl: getYouTubeWatchUrl(youtubeUrl, youtubeVideoId || resolvedVideoId || null),
    thumbnailUrl: thumbnailFromCms || getYouTubeThumbnailUrl(youtubeUrl, youtubeVideoId || resolvedVideoId || null),
    date: typeof record.date === "string" ? record.date : undefined,
    location: pickLocalizedValue(record, "location", lang).trim() || undefined,
    director: pickLocalizedValue(record, "director", lang).trim() || undefined,
    duration: pickLocalizedValue(record, "duration", lang).trim() || undefined,
    isFeatured: Boolean(record.isFeatured),
    order: typeof record.order === "number" ? record.order : 0,
    isActive: record.isActive !== false,
  };
}

async function fetchCmsDocumentaries(lang: Lang, autoplay = true) {
  const response = await strapiGet<{ data: unknown[] }>(
    "/api/documentaries?filters[isActive][$eq]=true&populate[thumbnail]=*&sort[0]=order:asc&sort[1]=date:desc&pagination[pageSize]=24"
  );

  return sortDocumentaries(
    unwrapStrapiCollection<LocalizedDocumentaryRecord>(response?.data)
      .map((record) => normalizeDocumentaryRecord(record, lang, autoplay))
      .filter((record): record is DocumentaryItem => !!record && record.isActive)
  );
}

function getFallbackDocumentaries(lang: Lang, autoplay = true) {
  return sortDocumentaries(
    fallbackDocumentariesByLang[lang]
      .map((record) => normalizeDocumentaryRecord(record, lang, autoplay))
      .filter((record): record is DocumentaryItem => !!record && record.isActive)
  );
}

export function getDocumentaryUiCopy(lang: Lang) {
  const base = documentaryUiCopyByLang[lang];
  const videoCueLabel =
    lang === "es" ? "Vídeo" :
    lang === "el" ? "Βίντεο" :
    lang === "ar" ? "فيديو" :
    "Video";

  return {
    label: normalizeDocumentaryText(base.label),
    headline: normalizeDocumentaryText(base.headline),
    pageTitle: normalizeDocumentaryText(base.pageTitle),
    pageIntro: normalizeDocumentaryText(base.pageIntro),
    videoCueLabel,
    watchLabel: normalizeDocumentaryText(base.watchLabel),
    archiveLabel: normalizeDocumentaryText(base.archiveLabel),
    watchAllLabel: normalizeDocumentaryText(base.watchAllLabel),
    locationLabel: normalizeDocumentaryText(base.locationLabel),
    directorLabel: normalizeDocumentaryText(base.directorLabel),
    durationLabel: normalizeDocumentaryText(base.durationLabel),
    dateLabel: normalizeDocumentaryText(base.dateLabel),
    unavailableLabel: normalizeDocumentaryText(base.unavailableLabel),
    unavailableCopy: normalizeDocumentaryText(base.unavailableCopy),
  };
}

export function getFallbackDocumentaryData(lang: Lang, autoplay = true) {
  return getFallbackDocumentaries(lang, autoplay);
}

export async function fetchHomepageFeaturedDocumentary(lang: Lang) {
  const cmsItems = await fetchCmsDocumentaries(lang, true);
  if (cmsItems.length) {
    const featuredItem = cmsItems.find((item) => item.isFeatured);
    return featuredItem ?? cmsItems[0] ?? null;
  }

  const fallbackItems = getFallbackDocumentaries(lang, true);
  return fallbackItems.find((item) => item.isFeatured) ?? fallbackItems[0] ?? null;
}

export async function fetchDocumentaryArchive(lang: Lang, autoplay = false) {
  const cmsItems = await fetchCmsDocumentaries(lang, autoplay);
  if (cmsItems.length) {
    return cmsItems;
  }

  return getFallbackDocumentaries(lang, autoplay);
}
