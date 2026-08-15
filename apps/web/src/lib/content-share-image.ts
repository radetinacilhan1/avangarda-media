import type { Lang } from "@/lib/i18n";
import { SITE_OG_IMAGE } from "@/lib/seo";

export const CONTENT_SHARE_IMAGE_WIDTH = 1200;
export const CONTENT_SHARE_IMAGE_HEIGHT = 630;
export const CONTENT_SHARE_IMAGE_TYPE = "image/jpeg";

const CONTENT_SHARE_IMAGE_VERSION = "content-v3";
const CLOUDINARY_UPLOAD_MARKER = "/image/upload/";
const CLOUDINARY_SHARE_TRANSFORMATION =
  "c_fill,f_jpg,fl_progressive,g_auto,h_630,q_70,w_1200";

const imageLabelByLang: Record<Lang, string> = {
  sr: "Slika uz članak",
  en: "Article image",
  tr: "Makale görseli",
  fr: "Image de l’article",
  de: "Artikelbild",
  es: "Imagen del artículo",
  el: "Εικόνα άρθρου",
  ar: "صورة المقال",
};

function buildCloudinaryShareUrl(sourceUrl: string) {
  try {
    const url = new URL(sourceUrl);

    if (url.hostname !== "res.cloudinary.com" || !url.pathname.includes(CLOUDINARY_UPLOAD_MARKER)) {
      return null;
    }

    url.pathname = url.pathname.replace(
      CLOUDINARY_UPLOAD_MARKER,
      `${CLOUDINARY_UPLOAD_MARKER}${CLOUDINARY_SHARE_TRANSFORMATION}/`
    );
    url.searchParams.set("share", CONTENT_SHARE_IMAGE_VERSION);
    return url.toString();
  } catch {
    return null;
  }
}

export function getContentShareImage(sourceUrl: string | undefined, title: string, lang: Lang) {
  return {
    url: (sourceUrl && buildCloudinaryShareUrl(sourceUrl)) || SITE_OG_IMAGE,
    width: CONTENT_SHARE_IMAGE_WIDTH,
    height: CONTENT_SHARE_IMAGE_HEIGHT,
    type: CONTENT_SHARE_IMAGE_TYPE,
    alt: `${imageLabelByLang[lang]}: ${title} - Avangarda`,
  };
}
