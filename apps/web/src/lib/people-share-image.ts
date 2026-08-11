import type { Lang } from "@/lib/i18n";

export const PEOPLE_SHARE_IMAGE_WIDTH = 1200;
export const PEOPLE_SHARE_IMAGE_HEIGHT = 630;
export const PEOPLE_SHARE_IMAGE_TYPE = "image/jpeg";

const PEOPLE_SHARE_IMAGE_VERSION = "people-v2";
const PEOPLE_SHARE_FALLBACK = `/assets/og/people-fallback-v2.jpg?share=${PEOPLE_SHARE_IMAGE_VERSION}`;
const CLOUDINARY_UPLOAD_MARKER = "/image/upload/";
const CLOUDINARY_SHARE_TRANSFORMATION =
  "c_fill,f_jpg,fl_progressive,g_auto,h_630,q_70,w_1200";

const portraitLabelByLang: Record<Lang, string> = {
  sr: "Profilna fotografija",
  en: "Profile photograph",
  tr: "Profil fotoğrafı",
  fr: "Photo de profil",
  de: "Profilfoto",
  es: "Foto de perfil",
  el: "Φωτογραφία προφίλ",
  ar: "صورة الملف الشخصي",
};

export type PeopleShareImage = {
  url: string;
  width: number;
  height: number;
  type: typeof PEOPLE_SHARE_IMAGE_TYPE;
  alt: string;
};

function buildCloudinaryShareUrl(portraitUrl: string) {
  try {
    const url = new URL(portraitUrl);

    if (url.hostname !== "res.cloudinary.com" || !url.pathname.includes(CLOUDINARY_UPLOAD_MARKER)) {
      return null;
    }

    url.pathname = url.pathname.replace(
      CLOUDINARY_UPLOAD_MARKER,
      `${CLOUDINARY_UPLOAD_MARKER}${CLOUDINARY_SHARE_TRANSFORMATION}/`
    );
    url.searchParams.set("share", PEOPLE_SHARE_IMAGE_VERSION);
    return url.toString();
  } catch {
    return null;
  }
}

export function getPeopleShareImage(portraitUrl: string | undefined, fullName: string, lang: Lang): PeopleShareImage {
  return {
    url: (portraitUrl && buildCloudinaryShareUrl(portraitUrl)) || PEOPLE_SHARE_FALLBACK,
    width: PEOPLE_SHARE_IMAGE_WIDTH,
    height: PEOPLE_SHARE_IMAGE_HEIGHT,
    type: PEOPLE_SHARE_IMAGE_TYPE,
    alt: `${portraitLabelByLang[lang]}: ${fullName} - Avangarda`,
  };
}
