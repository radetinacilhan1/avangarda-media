import type { Lang } from "@/lib/i18n";
import { withLangPrefix } from "@/lib/i18n";
import {
  buildImageCreditHtml,
  buildImageMetaHtml,
  normalizeImageCredits,
  resolveImageAlt,
  resolveImageCaption,
  type ResolvedImageCredit,
  resolveImageCredit,
} from "@/lib/image-credits";
import { getStrapiMediaUrl } from "@/lib/strapi";
import { getYouTubeVideoId } from "@/lib/video";
import MarkdownIt from "markdown-it";
import sanitizeHtml from "sanitize-html";

const markdown = new MarkdownIt({
  breaks: false,
  html: true,
  linkify: true,
  typographer: false,
});

const ALLOWED_RICH_TEXT_TAGS = [
  "p", "br", "h2", "h3", "h4", "strong", "b", "em", "i", "u", "s", "del",
  "ul", "ol", "li", "blockquote", "a", "img", "figure", "figcaption", "pre", "code", "hr",
];

const VIDEO_DIRECTIVE_PATTERN = /^@\[video\]\((\S+?)(?:\s+"([^"]*)")?\)$/i;
const SAFE_VIDEO_FILE_PATTERN = /\.(?:mp4|webm|ogg)(?:[?#].*)?$/i;

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

function isUnsafeAttributeUrl(value: string) {
  return /^(?:javascript:|vbscript:|data:text\/html)/i.test(value.trim());
}

function buildSafeVideoHtml(value: string, title: string, articleTitle?: string) {
  const trimmed = value.trim();
  const accessibleTitle = escapeHtml(title.trim() || articleTitle?.trim() || "Video u članku");
  const youtubeId = getYouTubeVideoId(trimmed);

  if (youtubeId) {
    const src = `https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=0&controls=1&rel=0`;
    return `<figure class="article-video-embed"><div class="article-video-embed__frame"><iframe src="${src}" title="${accessibleTitle}" loading="lazy" allow="encrypted-media; picture-in-picture" allowfullscreen></iframe></div><figcaption>${accessibleTitle}</figcaption></figure>`;
  }

  try {
    const normalized = normalizeAssetUrl(trimmed);
    const parsed = new URL(normalized, "https://avangarda.media");
    if (!["http:", "https:"].includes(parsed.protocol)) return "";
    const host = parsed.hostname.toLowerCase();

    if (host === "vimeo.com" || host.endsWith(".vimeo.com")) {
      const vimeoId = parsed.pathname.split("/").filter(Boolean).find((part) => /^\d+$/.test(part));
      if (!vimeoId) return "";
      const src = `https://player.vimeo.com/video/${vimeoId}?autoplay=0`;
      return `<figure class="article-video-embed"><div class="article-video-embed__frame"><iframe src="${src}" title="${accessibleTitle}" loading="lazy" allow="encrypted-media; picture-in-picture" allowfullscreen></iframe></div><figcaption>${accessibleTitle}</figcaption></figure>`;
    }

    const isMediaLibraryHost =
      host === "cms.avangarda.media"
      || host === "localhost"
      || host === "127.0.0.1"
      || host === "res.cloudinary.com";
    if (!isMediaLibraryHost || !SAFE_VIDEO_FILE_PATTERN.test(parsed.pathname)) return "";

    return `<figure class="article-video-embed"><video src="${escapeHtml(parsed.href)}" controls preload="metadata" playsinline aria-label="${accessibleTitle}"></video><figcaption>${accessibleTitle}</figcaption></figure>`;
  } catch {
    return "";
  }
}

// A Markdown block rule respects fenced/indented code and never evaluates raw HTML.
markdown.block.ruler.after("fence", "avangarda_video", (state, startLine, _endLine, silent) => {
  if (state.sCount[startLine] - state.blkIndent >= 4) return false;
  const line = state.src.slice(state.bMarks[startLine] + state.tShift[startLine], state.eMarks[startLine]);
  const match = line.match(VIDEO_DIRECTIVE_PATTERN);
  if (!match) return false;
  const html = buildSafeVideoHtml(match[1], match[2] || "", state.env.articleTitle);
  if (!html) return false;
  if (!silent) {
    const index = state.env.videos.push(html) - 1;
    const token = state.push("html_block", "", 0);
    token.content = `<p>AVANGARDAVIDEO${index}TOKEN</p>\n`;
    state.line = startLine + 1;
  }
  return true;
}, { alt: ["paragraph", "reference", "blockquote", "list"] });

function injectVideoDirectives(html: string, videos: string[]) {
  return videos.reduce(
    (output, video, index) => output.replace(`<p>AVANGARDAVIDEO${index}TOKEN</p>`, video),
    html
  );
}

function localizeInternalHref(href: string, lang: Lang) {
  const trimmed = href.trim();
  if (!trimmed || trimmed.startsWith("#") || /^(?:mailto:|tel:)/i.test(trimmed)) return trimmed;

  try {
    const parsed = new URL(trimmed, "https://avangarda.media");
    if (parsed.origin !== "https://avangarda.media" && parsed.origin !== "https://www.avangarda.media") {
      return trimmed;
    }

    return withLangPrefix(`${parsed.pathname}${parsed.search}${parsed.hash}`, lang);
  } catch {
    return trimmed;
  }
}

function sanitizeAnchorTag(tag: string, lang: Lang) {
  const href = getTagAttribute(tag, "href");
  const rel = getTagAttribute(tag, "rel");

  let nextTag = tag;

  if (href && isUnsafeAttributeUrl(href)) {
    nextTag = setTagAttribute(nextTag, "href", "#");
  }

  if (href && !isUnsafeAttributeUrl(href)) {
    const localizedHref = localizeInternalHref(href, lang);
    nextTag = setTagAttribute(nextTag, "href", localizedHref);

    const isExternal = /^(?:https?:)?\/\//i.test(localizedHref) && !/^https?:\/\/(?:www\.)?avangarda\.media(?:\/|$)/i.test(localizedHref);
    if (isExternal) {
      nextTag = setTagAttribute(nextTag, "target", "_blank");
    }
  }

  if (getTagAttribute(nextTag, "target") === "_blank") {
    const safeRelValues = new Set(
      rel
        .split(/\s+/)
        .map((value) => value.trim())
        .filter(Boolean)
    );

    safeRelValues.add("noopener");
    safeRelValues.add("noreferrer");

    nextTag = setTagAttribute(nextTag, "rel", Array.from(safeRelValues).join(" "));
  }

  return nextTag;
}

function sanitizeRichTextHtml(html: string) {
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_RICH_TEXT_TAGS,
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "srcset", "sizes", "alt", "title", "width", "height", "loading", "decoding"],
      figure: ["class"],
      figcaption: ["class"],
      code: ["class"],
      pre: ["class"],
    },
    allowedClasses: {
      figure: ["article-media-block", "article-media-block--richtext", "article-media-block--full", "article-media-block--wide", "article-media-block--inline"],
      figcaption: ["article-media__caption"],
      code: [/^language-[a-z0-9_-]+$/i],
      pre: [/^language-[a-z0-9_-]+$/i],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: {
      img: ["http", "https", "data"],
    },
    allowProtocolRelative: true,
    enforceHtmlBoundary: true,
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
  bodyImages: ReturnType<typeof normalizeImageCredits>;
};

function injectFigureMeta(figureHtml: string, options: RichTextOptions) {
  const imageMatch = figureHtml.match(/<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/i);
  if (!imageMatch) return figureHtml;

  const src = normalizeAssetUrl(imageMatch[1]);
  const credit = resolveImageCredit(src, options.imageCredits, options.lang);
  const hasCaption = /<figcaption\b|article-media__caption/i.test(figureHtml);
  const metaHtml = hasCaption
    ? buildImageCreditHtml(credit, options.lang)
    : buildImageMetaHtml({
        caption: resolveImageCaption(credit),
        credit,
        lang: options.lang,
      });

  return figureHtml.replace(/<\/figure>\s*$/i, `${metaHtml}</figure>`);
}

function wrapStandaloneImage(paragraphHtml: string, options: RichTextOptions) {
  const imageMatch = paragraphHtml.match(/<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/i);
  if (!imageMatch) return paragraphHtml;

  const src = normalizeAssetUrl(imageMatch[1]);
  const credit = resolveImageCredit(src, options.imageCredits, options.lang);
  const metaHtml = buildImageMetaHtml({
    caption: resolveImageCaption(credit) || getTagAttribute(imageMatch[0], "title"),
    credit,
    lang: options.lang,
  });

  return `<figure class="article-media-block article-media-block--richtext">${paragraphHtml}${metaHtml}</figure>`;
}

function buildInlineImageFigureHtml(image: ResolvedImageCredit, options: RichTextOptions) {
  if (!image.imageUrl) return "";

  const attrs = [
    `src="${escapeHtml(image.imageUrl)}"`,
    `alt="${escapeHtml(resolveImageAlt({ credit: image, articleTitle: options.articleTitle }))}"`,
    `loading="lazy"`,
    `decoding="async"`,
    `draggable="false"`,
    `data-protected-media="true"`,
  ];

  if (image.mediaWidth) {
    attrs.push(`width="${image.mediaWidth}"`);
  }

  if (image.mediaHeight) {
    attrs.push(`height="${image.mediaHeight}"`);
  }

  if (image.downloadable) {
    attrs.push(`data-downloadable="true"`);
  }

  if (image.watermark) {
    attrs.push(`data-watermark="true"`);
  }

  const metaHtml = buildImageMetaHtml({
    caption: resolveImageCaption(image),
    credit: image,
    lang: options.lang,
  });

  return `<figure class="article-media-block article-media-block--${image.layout}"><img ${attrs.join(" ")} />${metaHtml}</figure>`;
}

function injectInlineImageBlocks(html: string, options: RichTextOptions) {
  const queuedBlocks = options.bodyImages
    .filter((image) => image.imageUrl)
    .map((image, index) => ({
      image,
      index,
      position: typeof image.insertAfterParagraph === "number" ? image.insertAfterParagraph : Number.MAX_SAFE_INTEGER,
    }))
    .sort((left, right) => {
      if (left.position === right.position) return left.index - right.index;
      return left.position - right.position;
    });

  if (queuedBlocks.length === 0) return html;

  let queueIndex = 0;
  let paragraphCount = 0;

  const prepend = queuedBlocks
    .filter((entry) => entry.position === 0)
    .map((entry) => buildInlineImageFigureHtml(entry.image, options))
    .join("");

  queueIndex = queuedBlocks.findIndex((entry) => entry.position !== 0);
  if (queueIndex < 0) {
    return prepend + html;
  }

  const withInjectedImages = html.replace(/<\/p>/gi, (paragraphCloseTag) => {
    paragraphCount += 1;
    let injected = "";

    while (queueIndex < queuedBlocks.length && queuedBlocks[queueIndex].position === paragraphCount) {
      injected += buildInlineImageFigureHtml(queuedBlocks[queueIndex].image, options);
      queueIndex += 1;
    }

    return `${paragraphCloseTag}${injected}`;
  });

  const append = queuedBlocks
    .slice(queueIndex)
    .map((entry) => buildInlineImageFigureHtml(entry.image, options))
    .join("");

  return `${prepend}${withInjectedImages}${append}`;
}

function enrichRichTextHtml(html: string, options: RichTextOptions) {
  const transformedHtml = absolutizeAssetAttributes(html)
    .replace(/<a\b[^>]*>/gi, (tag) => sanitizeAnchorTag(tag, options.lang))
    .replace(/<img\b[^>]*>/gi, (tag) => enrichImageTag(tag, options))
    .replace(/<figure\b[\s\S]*?<\/figure>/gi, (figure) => injectFigureMeta(figure, options))
    .replace(/<p>\s*((?:<a\b[^>]*>\s*)?<img\b[^>]*>(?:\s*<\/a>)?)\s*<\/p>/gi, (_match, imageHtml: string) => {
      return wrapStandaloneImage(imageHtml, options);
    });

  return injectInlineImageBlocks(transformedHtml, options);
}

export function getRichTextHtml(
  value?: string | null,
  options: {
    lang?: Lang;
    articleTitle?: string;
    imageCredits?: unknown;
    bodyImages?: unknown;
  } = {}
) {
  const lang = options.lang || "sr";
  const inlineImages = normalizeImageCredits(options.bodyImages, lang);
  const source = (value || "").trim();
  if (!source && inlineImages.length === 0) return "";

  const videos: string[] = [];
  const html = markdown.render(source, { videos, articleTitle: options.articleTitle });
  const enrichedHtml = enrichRichTextHtml(sanitizeRichTextHtml(html), {
    lang,
    articleTitle: options.articleTitle,
    imageCredits: normalizeImageCredits(options.imageCredits, lang),
    bodyImages: inlineImages,
  });
  return injectVideoDirectives(enrichedHtml, videos);
}
