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

function absolutizeRichTextAssets(html: string) {
  return html
    .replace(/\b(src|href)=["']([^"']+)["']/gi, (_match, attribute: string, url: string) => {
      return `${attribute}="${normalizeAssetUrl(url)}"`;
    })
    .replace(/\bsrcset=["']([^"']+)["']/gi, (_match, value: string) => {
      return `srcset="${normalizeSrcSet(value)}"`;
    })
    .replace(/<img\b(?![^>]*\bloading=)(?![^>]*\bdecoding=)/gi, '<img loading="lazy" decoding="async"');
}

export function getRichTextHtml(value?: string | null) {
  const source = (value || "").trim();
  if (!source) return "";

  const html = /<[^>]+>/.test(source) ? source : paragraphizePlainText(source);
  return absolutizeRichTextAssets(html);
}
