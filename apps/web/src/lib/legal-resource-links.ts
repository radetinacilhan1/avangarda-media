import type { Lang } from "@/lib/i18n";

export function getSafeOfficialSourceUrl(value: string | undefined) {
  if (!value) return "";

  try {
    const url = new URL(value.trim());
    const hostname = url.hostname.toLowerCase();
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      (url.port && url.port !== "443") ||
      !hostname ||
      hostname === "localhost" ||
      hostname.endsWith(".localhost") ||
      hostname.endsWith(".local")
    ) {
      return "";
    }

    return url.href;
  } catch {
    return "";
  }
}

export function buildLegalDocumentEndpoint(slug: string, locale: Lang, mode: "inline" | "attachment") {
  const params = new URLSearchParams({ slug, locale, mode });
  return `/api/legal-resource-download?${params.toString()}`;
}
