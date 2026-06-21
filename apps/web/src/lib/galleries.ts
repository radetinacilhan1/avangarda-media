import { getAuthorNames, localizeArticle, localizeTopic } from "@/lib/content";
import type { Lang } from "@/lib/i18n";
import {
  type ImageCreditDisplay,
  type ResolvedImageCredit,
  getImageCreditDisplay,
  normalizeImageCredits,
  resolveImageAlt,
  resolveImageCaption,
} from "@/lib/image-credits";
import { getStrapiMediaUrl, strapiGet, unwrapStrapiCollection } from "@/lib/strapi";

const localizedSuffix: Record<Exclude<Lang, "sr">, string> = {
  en: "_en",
  tr: "_tr",
  fr: "_fr",
  de: "_de",
  es: "_es",
  el: "_el",
  ar: "_ar",
};

type LocalizedRecord = Record<string, unknown>;

type GalleryLocationRecord = {
  name?: string;
  name_en?: string;
  name_tr?: string;
  name_fr?: string;
  name_de?: string;
  name_es?: string;
  name_el?: string;
  name_ar?: string;
  slug?: string;
  country?: string;
  region?: string;
};

type GalleryTopicRecord = {
  name?: string;
  name_en?: string;
  name_tr?: string;
  name_fr?: string;
  name_de?: string;
  name_es?: string;
  name_el?: string;
  name_ar?: string;
  slug?: string;
};

type GalleryAuthorRecord = {
  id?: number | string;
  name?: string;
  slug?: string;
};

type GalleryRelatedArticleRecord = {
  id?: number | string;
  title?: string;
  title_en?: string;
  title_tr?: string;
  title_fr?: string;
  title_de?: string;
  title_es?: string;
  title_el?: string;
  title_ar?: string;
  subtitle?: string;
  subtitle_en?: string;
  subtitle_tr?: string;
  subtitle_fr?: string;
  subtitle_de?: string;
  subtitle_es?: string;
  subtitle_el?: string;
  subtitle_ar?: string;
  slug?: string;
  section?: string;
  publishedAt?: string;
  authors?: unknown;
  cover?: {
    url?: string;
    formats?: {
      large?: { url?: string };
      medium?: { url?: string };
      small?: { url?: string };
    };
  };
};

type GallerySeoRecord = {
  seoTitle?: string;
  seoTitle_en?: string;
  seoTitle_tr?: string;
  seoTitle_fr?: string;
  seoTitle_de?: string;
  seoTitle_es?: string;
  seoTitle_el?: string;
  seoTitle_ar?: string;
  seoDescription?: string;
  seoDescription_en?: string;
  seoDescription_tr?: string;
  seoDescription_fr?: string;
  seoDescription_de?: string;
  seoDescription_es?: string;
  seoDescription_el?: string;
  seoDescription_ar?: string;
};

type GalleryRecord = {
  id?: number | string;
  title?: string;
  title_en?: string;
  title_tr?: string;
  title_fr?: string;
  title_de?: string;
  title_es?: string;
  title_el?: string;
  title_ar?: string;
  slug?: string;
  description?: string;
  description_en?: string;
  description_tr?: string;
  description_fr?: string;
  description_de?: string;
  description_es?: string;
  description_el?: string;
  description_ar?: string;
  galleryDate?: string;
  publishedAt?: string;
  locationSummary?: string;
  locationSummary_en?: string;
  locationSummary_tr?: string;
  locationSummary_fr?: string;
  locationSummary_de?: string;
  locationSummary_es?: string;
  locationSummary_el?: string;
  locationSummary_ar?: string;
  photographerName?: string;
  authors?: unknown;
  topics?: unknown;
  tags?: unknown;
  locations?: unknown;
  relatedArticles?: unknown;
  images?: unknown;
  shareImage?: {
    url?: string;
    formats?: {
      large?: { url?: string };
      medium?: { url?: string };
      small?: { url?: string };
    };
  };
  isFeatured?: boolean;
  order?: number;
  seo?: unknown;
};

export type GalleryUiCopy = {
  label: string;
  title: string;
  intro: string;
  featuredLabel: string;
  openGallery: string;
  openImage: string;
  relatedArticlesLabel: string;
  relatedGalleryLabel: string;
  allGalleriesLabel: string;
  backToArchive: string;
  locationLabel: string;
  dateLabel: string;
  photographerLabel: string;
  closeLabel: string;
  previousLabel: string;
  nextLabel: string;
  emptyTitle: string;
  emptyCopy: string;
  copyrightLabel: string;
  imagesSingular: string;
  imagesFew: string;
  imagesPlural: string;
};

export type GalleryImageItem = {
  id: string;
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
  downloadable: boolean;
  watermark: boolean;
  credit: ResolvedImageCredit | null;
  creditDisplay: ImageCreditDisplay | null;
};

export type GalleryRelatedArticle = {
  id: number | string;
  title: string;
  subtitle?: string;
  slug: string;
  section?: string;
  publishedAt?: string;
  author?: string;
  coverUrl?: string;
};

export type GalleryTopic = {
  name: string;
  slug: string;
};

export type GalleryItem = {
  id: number | string;
  title: string;
  slug: string;
  description: string;
  galleryDate?: string;
  publishedAt?: string;
  locationSummary?: string;
  photographerLine?: string;
  isFeatured: boolean;
  order: number;
  images: GalleryImageItem[];
  coverImage: GalleryImageItem | null;
  shareImageUrl?: string;
  relatedArticles: GalleryRelatedArticle[];
  topics: GalleryTopic[];
  seoTitle?: string;
  seoDescription?: string;
};

const galleryCopyByLang: Record<Lang, GalleryUiCopy> = {
  sr: {
    label: "Galerija",
    title: "GALERIJA",
    intro: "Fotografske sekvence, terenski tragovi i urednicki okviri koji ostaju i kada tekst stane.",
    featuredLabel: "Istaknuto",
    openGallery: "Otvori galeriju",
    openImage: "Otvori fotografiju",
    relatedArticlesLabel: "Povezani tekstovi",
    relatedGalleryLabel: "Povezana galerija",
    allGalleriesLabel: "Iz arhive",
    backToArchive: "Nazad na galeriju",
    locationLabel: "Lokacija",
    dateLabel: "Datum",
    photographerLabel: "Fotograf",
    closeLabel: "Zatvori",
    previousLabel: "Prethodna",
    nextLabel: "Sledeca",
    emptyTitle: "Galerija se priprema.",
    emptyCopy: "Prve foto-sekvence bice vidljive uskoro.",
    copyrightLabel: "Napomena o koriscenju",
    imagesSingular: "fotografija",
    imagesFew: "fotografije",
    imagesPlural: "fotografija",
  },
  en: {
    label: "Galleries",
    title: "GALLERIES",
    intro: "Photo sequences, field traces and editorial frames that keep speaking after the story ends.",
    featuredLabel: "Featured",
    openGallery: "Open gallery",
    openImage: "Open image",
    relatedArticlesLabel: "Related stories",
    relatedGalleryLabel: "Related gallery",
    allGalleriesLabel: "All galleries",
    backToArchive: "Back to galleries",
    locationLabel: "Location",
    dateLabel: "Date",
    photographerLabel: "Photographer",
    closeLabel: "Close",
    previousLabel: "Previous",
    nextLabel: "Next",
    emptyTitle: "Galleries are on the way.",
    emptyCopy: "The first photo essays will appear here soon.",
    copyrightLabel: "Usage note",
    imagesSingular: "image",
    imagesFew: "images",
    imagesPlural: "images",
  },
  tr: {
    label: "Galeriler",
    title: "GALERILER",
    intro: "Metin durduktan sonra da konusan fotograflar, saha izleri ve editoryal sekanslar.",
    featuredLabel: "One cikan",
    openGallery: "Galeriyi ac",
    openImage: "Fotografi ac",
    relatedArticlesLabel: "Baglantili metinler",
    relatedGalleryLabel: "Baglantili galeri",
    allGalleriesLabel: "Tum galeriler",
    backToArchive: "Galerilere don",
    locationLabel: "Konum",
    dateLabel: "Tarih",
    photographerLabel: "Fotograf",
    closeLabel: "Kapat",
    previousLabel: "Onceki",
    nextLabel: "Sonraki",
    emptyTitle: "Galeriler hazirlaniyor.",
    emptyCopy: "Ilk fotografik sekanslar yakinda burada olacak.",
    copyrightLabel: "Kullanim notu",
    imagesSingular: "fotograf",
    imagesFew: "fotograf",
    imagesPlural: "fotograf",
  },
  fr: {
    label: "Galeries",
    title: "GALERIES",
    intro: "Sequences photographiques, traces de terrain et cadres editoriaux qui continuent apres le texte.",
    featuredLabel: "A la une",
    openGallery: "Ouvrir la galerie",
    openImage: "Ouvrir l'image",
    relatedArticlesLabel: "Recits lies",
    relatedGalleryLabel: "Galerie liee",
    allGalleriesLabel: "Toutes les galeries",
    backToArchive: "Retour aux galeries",
    locationLabel: "Lieu",
    dateLabel: "Date",
    photographerLabel: "Photographe",
    closeLabel: "Fermer",
    previousLabel: "Precedente",
    nextLabel: "Suivante",
    emptyTitle: "Les galeries arrivent.",
    emptyCopy: "Les premieres sequences photo apparaitront bientot.",
    copyrightLabel: "Note d'usage",
    imagesSingular: "image",
    imagesFew: "images",
    imagesPlural: "images",
  },
  de: {
    label: "Galerien",
    title: "GALERIEN",
    intro: "Fotosequenzen, Feldspuren und redaktionelle Frames, die bleiben, wenn der Text endet.",
    featuredLabel: "Im Fokus",
    openGallery: "Galerie offnen",
    openImage: "Bild offnen",
    relatedArticlesLabel: "Verwandte Texte",
    relatedGalleryLabel: "Verwandte Galerie",
    allGalleriesLabel: "Alle Galerien",
    backToArchive: "Zuruck zu den Galerien",
    locationLabel: "Ort",
    dateLabel: "Datum",
    photographerLabel: "Fotograf",
    closeLabel: "Schliessen",
    previousLabel: "Zuruck",
    nextLabel: "Weiter",
    emptyTitle: "Galerien folgen.",
    emptyCopy: "Die ersten Fotostrecken erscheinen bald.",
    copyrightLabel: "Nutzungshinweis",
    imagesSingular: "Bild",
    imagesFew: "Bilder",
    imagesPlural: "Bilder",
  },
  es: {
    label: "Galerias",
    title: "GALERIAS",
    intro: "Secuencias fotograficas, huellas de campo y marcos editoriales que siguen hablando despues del texto.",
    featuredLabel: "Destacado",
    openGallery: "Abrir galeria",
    openImage: "Abrir imagen",
    relatedArticlesLabel: "Textos relacionados",
    relatedGalleryLabel: "Galeria relacionada",
    allGalleriesLabel: "Todas las galerias",
    backToArchive: "Volver a galerias",
    locationLabel: "Ubicacion",
    dateLabel: "Fecha",
    photographerLabel: "Fotografo",
    closeLabel: "Cerrar",
    previousLabel: "Anterior",
    nextLabel: "Siguiente",
    emptyTitle: "Las galerias llegan pronto.",
    emptyCopy: "Las primeras secuencias fotograficas apareceran aqui pronto.",
    copyrightLabel: "Nota de uso",
    imagesSingular: "imagen",
    imagesFew: "imagenes",
    imagesPlural: "imagenes",
  },
  el: {
    label: "Συλλογές φωτογραφιών",
    title: "ΣΥΛΛΟΓΕΣ",
    intro: "Φωτογραφικές ακολουθίες, ίχνη πεδίου και εκδοτικά κάδρα που μένουν όταν σταματά το κείμενο.",
    featuredLabel: "Προτεινόμενο",
    openGallery: "Άνοιγμα συλλογής",
    openImage: "Άνοιγμα εικόνας",
    relatedArticlesLabel: "Σχετικά κείμενα",
    relatedGalleryLabel: "Σχετική συλλογή",
    allGalleriesLabel: "Όλες οι συλλογές",
    backToArchive: "Επιστροφή στις συλλογές",
    locationLabel: "Τοποθεσία",
    dateLabel: "Ημερομηνία",
    photographerLabel: "Φωτογράφος",
    closeLabel: "Κλείσιμο",
    previousLabel: "Προηγούμενη",
    nextLabel: "Επόμενη",
    emptyTitle: "Οι συλλογές ετοιμάζονται.",
    emptyCopy: "Οι πρώτες φωτογραφικές ακολουθίες θα εμφανιστούν σύντομα εδώ.",
    copyrightLabel: "Σημείωση χρήσης",
    imagesSingular: "εικόνα",
    imagesFew: "εικόνες",
    imagesPlural: "εικόνες",
  },
  ar: {
    label: "المعارض",
    title: "المعارض",
    intro: "تسلسلات بصرية وملاحظات ميدانية واطارات تحريرية تبقى حية بعد توقف النص.",
    featuredLabel: "مميز",
    openGallery: "افتح المعرض",
    openImage: "افتح الصورة",
    relatedArticlesLabel: "نصوص مرتبطة",
    relatedGalleryLabel: "معرض مرتبط",
    allGalleriesLabel: "كل المعارض",
    backToArchive: "العودة الى المعارض",
    locationLabel: "الموقع",
    dateLabel: "التاريخ",
    photographerLabel: "المصور",
    closeLabel: "اغلاق",
    previousLabel: "السابق",
    nextLabel: "التالي",
    emptyTitle: "المعارض قيد التحضير.",
    emptyCopy: "ستظهر اولى السلاسل الفوتوغرافية هنا قريبا.",
    copyrightLabel: "ملاحظة الاستخدام",
    imagesSingular: "صورة",
    imagesFew: "صورتان",
    imagesPlural: "صور",
  },
};

const GALLERY_POPULATE_QUERY = [
  "populate[authors]=*",
  "populate[topics]=*",
  "populate[tags]=*",
  "populate[locations]=*",
  "populate[relatedArticles][populate][authors]=*",
  "populate[relatedArticles][populate][cover]=*",
  "populate[images][populate][0]=image",
  "populate[shareImage]=*",
  "populate[seo]=*",
].join("&");

function asText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function getLocalizedValue(record: LocalizedRecord, field: string, lang: Lang) {
  const baseValue = asText(record[field]);
  if (lang === "sr") return baseValue;

  const localizedValue = asText(record[`${field}${localizedSuffix[lang]}`]);
  return localizedValue || baseValue;
}

function getLocalizedLocationName(record: GalleryLocationRecord, lang: Lang) {
  if (lang === "sr") return asText(record.name);

  const keyByLang: Record<Exclude<Lang, "sr">, keyof GalleryLocationRecord> = {
    en: "name_en",
    tr: "name_tr",
    fr: "name_fr",
    de: "name_de",
    es: "name_es",
    el: "name_el",
    ar: "name_ar",
  };

  return asText(record[keyByLang[lang]]) || asText(record.name);
}

function resolveLocationSummary(record: GalleryRecord, lang: Lang) {
  const explicit = getLocalizedValue(record as LocalizedRecord, "locationSummary", lang);
  if (explicit) return explicit;

  const locations = unwrapStrapiCollection<GalleryLocationRecord>(record.locations);
  if (!locations.length) return "";

  const primary = locations[0];
  const locationName = getLocalizedLocationName(primary, lang);
  const region = asText(primary.region);
  const country = asText(primary.country);

  return [locationName, region || country].filter(Boolean).join(" / ");
}

function normalizeGalleryImages(value: unknown, lang: Lang, galleryTitle: string) {
  return normalizeImageCredits(value, lang)
    .map((credit, index): GalleryImageItem | null => {
      if (!credit.imageUrl) return null;

      return {
        id: `${galleryTitle}-${index + 1}`,
        src: credit.imageUrl,
        alt: resolveImageAlt({ credit, articleTitle: galleryTitle }),
        caption: resolveImageCaption(credit) || undefined,
        width: credit.mediaWidth,
        height: credit.mediaHeight,
        downloadable: credit.downloadable,
        watermark: credit.watermark,
        credit,
        creditDisplay: getImageCreditDisplay(credit, lang),
      };
    })
    .filter((image): image is GalleryImageItem => Boolean(image));
}

function normalizeGalleryRelatedArticles(value: unknown, lang: Lang) {
  return unwrapStrapiCollection<GalleryRelatedArticleRecord>(value)
    .map((article) => localizeArticle(article, lang))
    .filter((article) => Boolean(article.id && article.slug && article.title))
    .map((article) => ({
      id: article.id as number | string,
      title: asText(article.title),
      subtitle: asText(article.subtitle) || undefined,
      slug: asText(article.slug),
      section: asText(article.section) || undefined,
      publishedAt: asText(article.publishedAt) || undefined,
      author: getAuthorNames(article.authors).join(", ") || undefined,
      coverUrl: article.cover?.url
        ? getStrapiMediaUrl(
            article.cover.formats?.medium?.url ||
            article.cover.formats?.small?.url ||
            article.cover.url
          )
        : undefined,
    }));
}

function normalizeGalleryTopics(value: unknown, lang: Lang) {
  return unwrapStrapiCollection<GalleryTopicRecord>(value)
    .map((topic) => localizeTopic(topic, lang))
    .filter((topic) => Boolean(topic.name && topic.slug))
    .map((topic) => ({
      name: asText(topic.name),
      slug: asText(topic.slug),
    }));
}

function normalizeGallerySeo(value: unknown, lang: Lang) {
  const seo = unwrapStrapiCollection<GallerySeoRecord>(value)[0];
  if (!seo) {
    return {
      seoTitle: "",
      seoDescription: "",
    };
  }

  return {
    seoTitle: getLocalizedValue(seo as LocalizedRecord, "seoTitle", lang),
    seoDescription: getLocalizedValue(seo as LocalizedRecord, "seoDescription", lang),
  };
}

function normalizeGalleryRecord(record: GalleryRecord, lang: Lang): GalleryItem | null {
  const title = getLocalizedValue(record as LocalizedRecord, "title", lang);
  const slug = asText(record.slug);
  if (!record.id || !title || !slug) return null;

  const images = normalizeGalleryImages(record.images, lang, title);
  const coverImage = images[0] || null;
  const authorsLine = getAuthorNames(record.authors).join(", ");
  const seo = normalizeGallerySeo(record.seo, lang);
  const shareImageUrl = record.shareImage?.url
    ? getStrapiMediaUrl(
        record.shareImage.formats?.large?.url ||
        record.shareImage.formats?.medium?.url ||
        record.shareImage.formats?.small?.url ||
        record.shareImage.url
      )
    : undefined;

  return {
    id: record.id,
    title,
    slug,
    description: getLocalizedValue(record as LocalizedRecord, "description", lang),
    galleryDate: asText(record.galleryDate) || undefined,
    publishedAt: asText(record.publishedAt) || undefined,
    locationSummary: resolveLocationSummary(record, lang) || undefined,
    photographerLine: asText(record.photographerName) || authorsLine || undefined,
    isFeatured: record.isFeatured === true,
    order: typeof record.order === "number" ? record.order : 0,
    images,
    coverImage,
    shareImageUrl,
    relatedArticles: normalizeGalleryRelatedArticles(record.relatedArticles, lang),
    topics: normalizeGalleryTopics(record.topics, lang),
    seoTitle: seo.seoTitle || undefined,
    seoDescription: seo.seoDescription || undefined,
  };
}

export function normalizeGalleryCollection(value: unknown, lang: Lang) {
  return unwrapStrapiCollection<GalleryRecord>(value)
    .map((record) => normalizeGalleryRecord(record, lang))
    .filter((gallery): gallery is GalleryItem => Boolean(gallery));
}

export function getGalleryLabel(lang: Lang) {
  return galleryCopyByLang[lang].label;
}

export function getGalleryCopy(lang: Lang) {
  return galleryCopyByLang[lang];
}

export function formatGalleryImageCount(count: number, lang: Lang) {
  if (lang === "sr") {
    const mod10 = count % 10;
    const mod100 = count % 100;
    const suffix =
      count === 1 ? galleryCopyByLang[lang].imagesSingular :
      mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)
        ? galleryCopyByLang[lang].imagesFew
        : galleryCopyByLang[lang].imagesPlural;
    return `${count} ${suffix}`;
  }

  if (lang === "ar") {
    const suffix =
      count === 1
        ? galleryCopyByLang[lang].imagesSingular
        : count === 2
          ? galleryCopyByLang[lang].imagesFew
          : galleryCopyByLang[lang].imagesPlural;
    return `${count} ${suffix}`;
  }

  const suffix = count === 1 ? galleryCopyByLang[lang].imagesSingular : galleryCopyByLang[lang].imagesPlural;
  return `${count} ${suffix}`;
}

export function getGalleryHref(slug: string) {
  return `/galerije/${slug}`;
}

export async function fetchGalleryArchive(lang: Lang) {
  const response = await strapiGet<{ data?: unknown }>(
    `/api/galleries?${GALLERY_POPULATE_QUERY}&sort[0]=isFeatured:desc&sort[1]=order:asc&sort[2]=galleryDate:desc&sort[3]=publishedAt:desc&pagination[pageSize]=100&filters[publishedAt][$notNull]=true`
  );

  return normalizeGalleryCollection(response, lang);
}

export async function fetchGalleryBySlug(slug: string, lang: Lang) {
  const response = await strapiGet<{ data?: unknown }>(
    `/api/galleries?filters[slug][$eq]=${encodeURIComponent(slug)}&${GALLERY_POPULATE_QUERY}&pagination[pageSize]=1`
  );

  const record = unwrapStrapiCollection<GalleryRecord>(response)[0];
  if (!record) return null;

  return normalizeGalleryRecord(record, lang);
}

export function getGalleryMetaItems(gallery: GalleryItem, lang: Lang) {
  const copy = getGalleryCopy(lang);
  const meta: Array<{ label: string; value: string }> = [];

  if (gallery.galleryDate || gallery.publishedAt) {
    meta.push({
      label: copy.dateLabel,
      value: gallery.galleryDate || gallery.publishedAt || "",
    });
  }

  if (gallery.locationSummary) {
    meta.push({
      label: copy.locationLabel,
      value: gallery.locationSummary,
    });
  }

  if (gallery.photographerLine) {
    meta.push({
      label: copy.photographerLabel,
      value: gallery.photographerLine,
    });
  }

  if (gallery.images.length) {
    meta.push({
      label: copy.label,
      value: formatGalleryImageCount(gallery.images.length, lang),
    });
  }

  return meta;
}

export function getGalleryCardSectionLabel(lang: Lang) {
  return getGalleryCopy(lang).label;
}

export function getGalleryCardTopicLabel(topic: GalleryTopic) {
  return topic.name;
}

export function getGalleryCoverImage(gallery: GalleryItem) {
  return gallery.coverImage;
}

export function getGallerySeoTitle(gallery: GalleryItem) {
  return gallery.seoTitle || gallery.title;
}

export function getGallerySeoDescription(gallery: GalleryItem) {
  return gallery.seoDescription || gallery.description;
}

export function getGallerySeoImage(gallery: GalleryItem) {
  return gallery.shareImageUrl || gallery.coverImage?.src;
}
