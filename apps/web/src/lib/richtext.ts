import type { Lang } from "@/lib/i18n";
import {
  buildImageCaptionHtml,
  buildImageCreditHtml,
  normalizeImageCredits,
  resolveImageAlt,
  resolveImageCaption,
  resolveImageCredit,
} from "@/lib/image-credits";
import { getStrapiMediaUrl } from "@/lib/strapi";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeAssetUrl(url: string) {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;

  if (
    /^(https?:)?\/\//i.test(trimmed) ||
    /^data:/i.test(trimmed) ||
    /^mailto:/i.test(trimmed) ||
    /^tel:/i.test(trimmed) ||
    trimmed.startsWith("#")
  ) {
    return trimmed;
  }

  if (trimmed.startsWith("/uploads")) {
    return getStrapiMediaUrl(trimmed);
  }

  if (trimmed.startsWith("uploads/")) {
    return getStrapiMediaUrl(`/${trimmed}`);
  }

  return trimmed;
}

function normalizeSrcSet(value: string) {
  return value
    .split(",")
    .map((entry) => {
      const parts = entry.trim().split(/\s+/);
      if (!parts[0]) return "";
      const normalized = normalizeAssetUrl(parts[0]);
      return [normalized, ...parts.slice(1)].join(" ").trim();
    })
    .filter(Boolean)
    .join(", ");
}

function paragraphizePlainText(value: string) {
  return value
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br />")}</p>`)
    .join("");
}

function getTagAttribute(tag: string, name: string) {
  const match = new RegExp(`\\b${name}=(["'])(.*?)\\1`, "i").exec(tag);
  return match?.[2] || "";
}

function setTagAttribute(tag: string, name: string, value: string) {
  const pattern = new RegExp(`\\b${name}=(["'])(.*?)\\1`, "i");
  if (pattern.test(tag)) {
    return tag.replace(pattern, `${name}="${escapeHtml(value)}"`);
  }

  return tag.replace(/\s*\/?>$/, (ending) => ` ${name}="${escapeHtml(value)}"${ending}`);
}

function hasTagAttribute(tag: string, name: string) {
  return new RegExp(`\\b${name}=`, "i").test(tag);
}

function absolutizeAssetAttributes(html: string) {
  return html
    .replace(/\b(src|href)=["']([^"']+)["']/gi, (_match, attribute: string, url: string) => {
      return `${attribute}="${normalizeAssetUrl(url)}"`;
    })
    .replace(/\bsrcset=["']([^"']+)["']/gi, (_match, value: string) => {
      return `srcset="${normalizeSrcSet(value)}"`;
    });
}

function enrichImageTag(tag: string, options: RichTextOptions) {
  const src = normalizeAssetUrl(getTagAttribute(tag, "src"));
  const credit = resolveImageCredit(src, options.imageCredits, options.lang);
  const alt = resolveImageAlt({
    existingAlt: getTagAttribute(tag, "alt"),
    credit,
    articleTitle: options.articleTitle,
  });

  let nextTag = setTagAttribute(tag, "src", src);
  nextTag = setTagAttribute(nextTag, "alt", alt);
  nextTag = setTagAttribute(nextTag, "decoding", "async");
  nextTag = setTagAttribute(nextTag, "draggable", "false");
  nextTag = setTagAttribute(nextTag, "data-protected-media", "true");

  if (!hasTagAttribute(nextTag, "loading")) {
    nextTag = setTagAttribute(nextTag, "loading", "lazy");
  }

  if (credit.downloadable) {
    nextTag = setTagAttribute(nextTag, "data-downloadable", "true");
  }

  if (credit.watermark) {
    nextTag = setTagAttribute(nextTag, "data-watermark", "true");
  }

  if (!hasTagAttribute(nextTag, "width") && credit.mediaWidth) {
    nextTag = setTagAttribute(nextTag, "width", String(credit.mediaWidth));
  }

  if (!hasTagAttribute(nextTag, "height") && credit.mediaHeight) {
    nextTag = setTagAttribute(nextTag, "height", String(credit.mediaHeight));
  }

  return nextTag;
}

type RichTextOptions = {
  lang: Lang;
  articleTitle?: string;
  imageCredits: ReturnType<typeof normalizeImageCredits>;
};

function injectFigureMeta(figureHtml: string, options: RichTextOptions) {
  const imageMatch = figureHtml.match(/<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/i);
  if (!imageMatch) return figureHtml;

  const src = normalizeAssetUrl(imageMatch[1]);
  const credit = resolveImageCredit(src, options.imageCredits, options.lang);
  const hasCaption = /<figcaption\b/i.test(figureHtml);
  const captionHtml = !hasCaption ? buildImageCaptionHtml(resolveImageCaption(credit)) : "";
  const creditHtml = buildImageCreditHtml(credit, options.lang);

  return figureHtml.replace(/<\/figure>\s*$/i, `${captionHtml}${creditHtml}</figure>`);
}

function wrapStandaloneImage(paragraphHtml: string, options: RichTextOptions) {
  const imageMatch = paragraphHtml.match(/<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/i);
  if (!imageMatch) return paragraphHtml;

  const src = normalizeAssetUrl(imageMatch[1]);
  const credit = resolveImageCredit(src, options.imageCredits, options.lang);
  const captionHtml = buildImageCaptionHtml(resolveImageCaption(credit));
  const creditHtml = buildImageCreditHtml(credit, options.lang);

  return `<figure class="article-media-block">${paragraphHtml}${captionHtml}${creditHtml}</figure>`;
}

function enrichRichTextHtml(html: string, options: RichTextOptions) {
  return absolutizeAssetAttributes(html)
    .replace(/<img\b[^>]*>/gi, (tag) => enrichImageTag(tag, options))
    .replace(/<figure\b[\s\S]*?<\/figure>/gi, (figure) => injectFigureMeta(figure, options))
    .replace(/<p>\s*((?:<a\b[^>]*>\s*)?<img\b[^>]*>(?:\s*<\/a>)?)\s*<\/p>/gi, (_match, imageHtml: string) => {
      return wrapStandaloneImage(imageHtml, options);
    });
}

export function getRichTextHtml(
  value?: string | null,
  options: {
    lang?: Lang;
    articleTitle?: string;
    imageCredits?: unknown;
  } = {}
) {
  const source = (value || "").trim();
  if (!source) return "";

  const html = /<[^>]+>/.test(source) ? source : paragraphizePlainText(source);
  return enrichRichTextHtml(html, {
    lang: options.lang || "sr",
    articleTitle: options.articleTitle,
    imageCredits: normalizeImageCredits(options.imageCredits, options.lang || "sr"),
  });
}
