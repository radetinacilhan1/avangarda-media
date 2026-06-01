import type { Lang } from "@/lib/i18n";
import { getStrapiMediaUrl, unwrapStrapiSingle } from "@/lib/strapi";

const localizedSuffix: Record<Exclude<Lang, "sr">, string> = {
  en: "_en",
  tr: "_tr",
  fr: "_fr",
  de: "_de",
  es: "_es",
  el: "_el",
  ar: "_ar",
};

const creditCopyByLang = {
  sr: {
    brand: "Avangarda",
    photo: "Foto",
    source: "Izvor",
    archive: "Arhiva",
    illustration: "Ilustracija",
    takenFrom: "preuzeto sa",
    generatedNote: "generisana vizuelna obrada",
    fallbackAlt: "Avangarda",
  },
  en: {
    brand: "Avangarda",
    photo: "Photo",
    source: "Source",
    archive: "Archive",
    illustration: "Illustration",
    takenFrom: "retrieved from",
    generatedNote: "generated visual treatment",
    fallbackAlt: "Avangarda",
  },
  tr: {
    brand: "Avangarda",
    photo: "Fotoğraf",
    source: "Kaynak",
    archive: "Arşiv",
    illustration: "İllüstrasyon",
    takenFrom: "şuradan alındı",
    generatedNote: "üretilmiş görsel işleme",
    fallbackAlt: "Avangarda",
  },
  fr: {
    brand: "Avangarda",
    photo: "Photo",
    source: "Source",
    archive: "Archive",
    illustration: "Illustration",
    takenFrom: "repris de",
    generatedNote: "traitement visuel généré",
    fallbackAlt: "Avangarda",
  },
  de: {
    brand: "Avangarda",
    photo: "Foto",
    source: "Quelle",
    archive: "Archiv",
    illustration: "Illustration",
    takenFrom: "übernommen von",
    generatedNote: "generierte visuelle Bearbeitung",
    fallbackAlt: "Avangarda",
  },
  es: {
    brand: "Avangarda",
    photo: "Foto",
    source: "Fuente",
    archive: "Archivo",
    illustration: "Ilustración",
    takenFrom: "tomado de",
    generatedNote: "tratamiento visual generado",
    fallbackAlt: "Avangarda",
  },
  el: {
    brand: "Avangarda",
    photo: "Φωτογραφία",
    source: "Πηγή",
    archive: "Αρχείο",
    illustration: "Εικονογράφηση",
    takenFrom: "λήφθηκε από",
    generatedNote: "παραγόμενη οπτική επεξεργασία",
    fallbackAlt: "Avangarda",
  },
  ar: {
    brand: "Avangarda",
    photo: "صورة",
    source: "المصدر",
    archive: "الأرشيف",
    illustration: "معالجة بصرية",
    takenFrom: "منقول من",
    generatedNote: "معالجة بصرية مولدة",
    fallbackAlt: "Avangarda",
  },
} as const satisfies Record<Lang, {
  brand: string;
  photo: string;
  source: string;
  archive: string;
  illustration: string;
  takenFrom: string;
  generatedNote: string;
  fallbackAlt: string;
}>;

export type ImageCreditType =
  | "own"
  | "avangarda"
  | "external"
  | "agency"
  | "archive"
  | "generated"
  | "unknown";

type LocalizedRecord = Record<string, unknown>;

type StrapiImageAsset = {
  url?: string;
  alternativeText?: string;
  caption?: string;
  width?: number;
  height?: number;
  formats?: {
    large?: { url?: string };
    medium?: { url?: string };
    small?: { url?: string };
    thumbnail?: { url?: string };
  };
};

export type ResolvedImageCredit = {
  imageUrl?: string;
  imageMatchKeys: string[];
  altText?: string;
  caption?: string;
  mediaAlternativeText?: string;
  mediaCaption?: string;
  mediaWidth?: number;
  mediaHeight?: number;
  creditType: ImageCreditType;
  authorName?: string;
  sourceName?: string;
  sourceUrl?: string;
  year?: string;
  license?: string;
  copyrightNotice?: string;
  showCredit: boolean;
  downloadable: boolean;
  watermark: boolean;
};

export type ImageCreditDisplay = {
  prefix: string;
  mainText: string;
  preLinkText?: string;
  linkText?: string;
  linkUrl?: string;
  suffixText?: string;
  plainText: string;
};

function asText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function getLocalizedField(record: LocalizedRecord, field: string, lang: Lang) {
  const baseValue = asText(record[field]);
  if (lang === "sr") return baseValue;

  const translatedValue = asText(record[`${field}${localizedSuffix[lang]}`]);
  return translatedValue || baseValue;
}

function asBoolean(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function normalizeCreditType(value: unknown): ImageCreditType {
  switch (asText(value).toLowerCase()) {
    case "own":
    case "avangarda":
    case "external":
    case "agency":
    case "archive":
    case "generated":
      return asText(value).toLowerCase() as ImageCreditType;
    default:
      return "unknown";
  }
}

function normalizeYear(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return asText(value);
}

function absolutizeMediaUrl(value?: string | null) {
  const url = asText(value);
  if (!url) return "";

  if (/^(https?:)?\/\//i.test(url)) {
    return url.startsWith("//") ? `https:${url}` : url;
  }

  if (url.startsWith("/uploads")) {
    return getStrapiMediaUrl(url);
  }

  if (url.startsWith("uploads/")) {
    return getStrapiMediaUrl(`/${url}`);
  }

  return url;
}

function normalizePathname(value: string) {
  return value.replace(/\/{2,}/g, "/").replace(/\/$/, "");
}

export function createImageMatchKey(value?: string | null) {
  const raw = absolutizeMediaUrl(value);
  if (!raw) return "";

  try {
    const parsed = raw.startsWith("http://") || raw.startsWith("https://")
      ? new URL(raw)
      : new URL(raw, "https://avangarda.media");
    const path = normalizePathname(decodeURIComponent(parsed.pathname));
    const search = parsed.search || "";

    if (parsed.origin === "https://avangarda.media" || path.startsWith("/uploads")) {
      return `${path}${search}`.toLowerCase();
    }

    return `${parsed.hostname.toLowerCase()}${path}${search}`.toLowerCase();
  } catch {
    return raw.toLowerCase();
  }
}

function getReadableSourceLabel(value?: string) {
  const sourceUrl = asText(value);
  if (!sourceUrl) return "";

  try {
    const parsed = new URL(sourceUrl);
    return parsed.hostname.replace(/^www\./i, "");
  } catch {
    return sourceUrl.replace(/^https?:\/\//i, "").replace(/^www\./i, "");
  }
}

function collectImageUrls(asset: StrapiImageAsset | null, matchUrl: string) {
  const urls = [
    matchUrl,
    asset?.url,
    asset?.formats?.large?.url,
    asset?.formats?.medium?.url,
    asset?.formats?.small?.url,
    asset?.formats?.thumbnail?.url,
  ]
    .map((value) => absolutizeMediaUrl(value))
    .filter(Boolean);

  return Array.from(new Set(urls));
}

function normalizeImageCreditEntry(record: LocalizedRecord, lang: Lang): ResolvedImageCredit {
  const image = unwrapStrapiSingle<StrapiImageAsset>(record.image) || null;
  const matchUrl = absolutizeMediaUrl(asText(record.matchUrl));
  const imageUrls = collectImageUrls(image, matchUrl);

  return {
    imageUrl: imageUrls[0] || undefined,
    imageMatchKeys: Array.from(new Set(imageUrls.map((value) => createImageMatchKey(value)).filter(Boolean))),
    altText: getLocalizedField(record, "altText", lang) || undefined,
    caption: getLocalizedField(record, "caption", lang) || undefined,
    mediaAlternativeText: asText(image?.alternativeText) || undefined,
    mediaCaption: asText(image?.caption) || undefined,
    mediaWidth: typeof image?.width === "number" ? image.width : undefined,
    mediaHeight: typeof image?.height === "number" ? image.height : undefined,
    creditType: normalizeCreditType(record.creditType),
    authorName: asText(record.authorName) || undefined,
    sourceName: asText(record.sourceName) || undefined,
    sourceUrl: asText(record.sourceUrl) || undefined,
    year: normalizeYear(record.year) || undefined,
    license: asText(record.license) || undefined,
    copyrightNotice: asText(record.copyrightNotice) || undefined,
    showCredit: asBoolean(record.showCredit, true),
    downloadable: asBoolean(record.downloadable, false),
    watermark: asBoolean(record.watermark, false),
  };
}

export function normalizeImageCredits(value: unknown, lang: Lang) {
  if (!Array.isArray(value)) return [];

  return value
    .filter((entry): entry is LocalizedRecord => !!entry && typeof entry === "object")
    .map((entry) => normalizeImageCreditEntry(entry, lang))
    .filter((entry) =>
      entry.imageMatchKeys.length > 0 ||
      entry.caption ||
      entry.altText ||
      entry.authorName ||
      entry.sourceName ||
      entry.sourceUrl
    );
}

export function resolveCoverImageCredit(value: unknown, lang: Lang) {
  if (!value || typeof value !== "object") return null;
  return normalizeImageCreditEntry(value as LocalizedRecord, lang);
}

export function findImageCreditMatch(src: string | undefined, credits: ResolvedImageCredit[]) {
  const key = createImageMatchKey(src);
  if (!key) return null;
  return credits.find((entry) => entry.imageMatchKeys.includes(key)) || null;
}

export function createFallbackImageCredit(lang: Lang): ResolvedImageCredit {
  const brand = creditCopyByLang[lang].brand;

  return {
    imageMatchKeys: [],
    creditType: "avangarda",
    authorName: brand,
    showCredit: true,
    downloadable: false,
    watermark: false,
  };
}

export function resolveImageCredit(src: string | undefined, credits: ResolvedImageCredit[], lang: Lang) {
  return findImageCreditMatch(src, credits) || createFallbackImageCredit(lang);
}

export function resolveImageAlt(input: {
  existingAlt?: string;
  credit?: ResolvedImageCredit | null;
  articleTitle?: string;
}) {
  const existingAlt = asText(input.existingAlt);
  if (existingAlt) return existingAlt;

  const credit = input.credit;
  return (
    credit?.altText ||
    credit?.mediaAlternativeText ||
    credit?.caption ||
    credit?.mediaCaption ||
    asText(input.articleTitle) ||
    "Avangarda"
  );
}

export function resolveImageCaption(credit?: ResolvedImageCredit | null) {
  return credit?.caption || credit?.mediaCaption || "";
}

function joinSuffixParts(parts: Array<string | undefined>) {
  return parts.map((part) => asText(part)).filter(Boolean).join(", ");
}

export function getImageCreditDisplay(credit: ResolvedImageCredit | null | undefined, lang: Lang): ImageCreditDisplay | null {
  if (credit?.showCredit === false) {
    return null;
  }

  const meta = credit || createFallbackImageCredit(lang);
  const copy = creditCopyByLang[lang];
  const brand = copy.brand;
  const year = meta.year;
  const license = meta.license;
  const copyrightNotice = meta.copyrightNotice;
  const commonSuffix = joinSuffixParts([year, license, copyrightNotice]);
  const readableSourceLink = getReadableSourceLabel(meta.sourceUrl);

  let prefix: string = copy.photo;
  let mainText: string = meta.authorName || meta.sourceName || brand;
  let preLinkText: string = "";
  let linkText: string = "";
  let linkUrl: string = "";
  let suffixText: string = commonSuffix;

  switch (meta.creditType) {
    case "own":
      prefix = copy.photo;
      mainText = meta.authorName ? `${meta.authorName} / ${brand}` : brand;
      break;
    case "avangarda":
      prefix = copy.photo;
      mainText = brand;
      break;
    case "external":
    case "agency":
      prefix = copy.source;
      mainText = meta.sourceName || meta.authorName || brand;
      preLinkText = meta.sourceUrl ? copy.takenFrom : "";
      linkText = meta.sourceUrl ? readableSourceLink : "";
      linkUrl = meta.sourceUrl || "";
      break;
    case "archive":
      prefix = copy.archive;
      mainText = meta.sourceName
        ? `${brand} / ${meta.sourceName}`
        : meta.authorName
          ? `${brand} / ${meta.authorName}`
          : brand;
      break;
    case "generated":
      prefix = copy.illustration;
      mainText = meta.authorName ? `${meta.authorName} / ${brand}` : brand;
      suffixText = joinSuffixParts([copy.generatedNote, year, license, copyrightNotice]);
      break;
    case "unknown":
    default:
      prefix = copy.photo;
      mainText = meta.authorName || meta.sourceName || brand;
      preLinkText = meta.sourceUrl ? copy.takenFrom : "";
      linkText = meta.sourceUrl ? readableSourceLink : "";
      linkUrl = meta.sourceUrl || "";
      break;
  }

  const plainParts = [
    `${prefix}: ${mainText}`.trim(),
    preLinkText ? `${preLinkText} ${linkText || linkUrl}`.trim() : linkText || "",
    suffixText,
  ].filter(Boolean);

  return {
    prefix,
    mainText,
    preLinkText: preLinkText || undefined,
    linkText: linkText || undefined,
    linkUrl: linkUrl || undefined,
    suffixText: suffixText || undefined,
    plainText: plainParts.join(", "),
  };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildImageCaptionHtml(caption: string) {
  const cleanCaption = asText(caption);
  if (!cleanCaption) return "";
  return `<figcaption class="article-media__caption" dir="auto">${escapeHtml(cleanCaption)}</figcaption>`;
}

export function buildImageCreditHtml(credit: ResolvedImageCredit | null | undefined, lang: Lang) {
  const display = getImageCreditDisplay(credit, lang);
  if (!display) return "";

  const fragments = [
    `<span class="article-media__credit-prefix">${escapeHtml(display.prefix)}:</span>`,
    `<span class="article-media__credit-main">${escapeHtml(display.mainText)}</span>`,
  ];

  if (display.preLinkText) {
    fragments.push(`<span class="article-media__credit-extra">${escapeHtml(display.preLinkText)}</span>`);
  }

  if (display.linkText && display.linkUrl) {
    fragments.push(
      `<a class="article-media__credit-link" href="${escapeHtml(display.linkUrl)}" target="_blank" rel="noreferrer noopener nofollow">${escapeHtml(display.linkText)}</a>`
    );
  }

  if (display.suffixText) {
    fragments.push(`<span class="article-media__credit-extra">${escapeHtml(display.suffixText)}</span>`);
  }

  return `<div class="article-media__credit" dir="auto">${fragments.join("")}</div>`;
}
