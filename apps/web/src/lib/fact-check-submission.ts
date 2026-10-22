import { isLang } from "@/lib/i18n";

export const FACT_SCREENSHOT_MAX_BYTES = 2 * 1024 * 1024;
export const FACT_SUBMISSION_MAX_BYTES = 3 * 1024 * 1024;
export type FactScreenshot = { name: string; mimeType: string; base64: string };

export function validateFactSubmission(value: unknown) {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const clean = (key: string) => typeof row[key] === "string" ? (row[key] as string).trim() : "";
  const claim = clean("claim"), sourceUrl = clean("sourceUrl"), contact = clean("contact"), website = clean("website");
  if (claim.length < 12 || claim.length > 6000 || contact.length > 240 || sourceUrl.length > 2000 || website || !isLang(row.lang)) return null;
  if (sourceUrl) {
    try {
      const url = new URL(sourceUrl);
      if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) return null;
    } catch { return null; }
  }
  let screenshot: FactScreenshot | undefined;
  if (row.screenshot !== undefined && row.screenshot !== null) {
    if (typeof row.screenshot !== "object") return null;
    const file = row.screenshot as Record<string, unknown>;
    if (typeof file.name !== "string" || typeof file.base64 !== "string" || typeof file.mimeType !== "string") return null;
    const base64 = file.base64;
    if (base64.length > Math.ceil(FACT_SCREENSHOT_MAX_BYTES / 3) * 4 || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(base64)) return null;
    const raw = atob(base64);
    if (!raw.length || raw.length > FACT_SCREENSHOT_MAX_BYTES) return null;
    const byte = (index: number) => raw.charCodeAt(index);
    const riffLength = byte(4) + byte(5) * 256 + byte(6) * 65536 + byte(7) * 16777216;
    const actualType = raw.length >= 24 && raw.startsWith("\x89PNG\r\n\x1a\n") && raw.slice(12, 16) === "IHDR" ? "image/png"
      : raw.length >= 12 && byte(0) === 0xff && byte(1) === 0xd8 && byte(2) === 0xff && byte(raw.length - 2) === 0xff && byte(raw.length - 1) === 0xd9 ? "image/jpeg"
      : raw.length >= 20 && raw.startsWith("RIFF") && raw.slice(8, 12) === "WEBP" && riffLength + 8 === raw.length && ["VP8 ", "VP8L", "VP8X"].includes(raw.slice(12, 16)) ? "image/webp" : "";
    if (!actualType || file.mimeType !== actualType) return null;
    screenshot = { name: file.name.replace(/[\\/\u0000-\u001f]/g, "_").slice(0, 120) || "screenshot", mimeType: actualType, base64 };
  }
  return { claim, sourceUrl, contact, website: "", lang: row.lang, ...(screenshot ? { screenshot } : {}) };
}
