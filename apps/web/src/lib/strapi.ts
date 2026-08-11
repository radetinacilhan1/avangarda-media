import { unstable_cache } from "next/cache";

function resolveStrapiUrl(value?: string | null) {
  const trimmed = value?.trim().replace(/\/$/, "");
  if (trimmed) {
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return trimmed;
    }

    if (/^(localhost|127(?:\.\d{1,3}){3}|\[::1\])(?::\d+)?$/i.test(trimmed)) {
      return `http://${trimmed}`;
    }

    if (/^[a-z0-9.-]+(?::\d+)?$/i.test(trimmed)) {
      return `https://${trimmed}`;
    }

    return trimmed;
  }

  return process.env.NODE_ENV === "development" ? "http://localhost:1337" : "";
}

const REQUIRED_PRODUCTION_STRAPI_ORIGIN = "https://cms.avangarda.media";

function enforceProductionStrapiOrigin(value: string, variableName: string) {
  if (!value || process.env.VERCEL_ENV !== "production") return value;

  try {
    if (new URL(value).origin === REQUIRED_PRODUCTION_STRAPI_ORIGIN) {
      return value;
    }
  } catch {
    // The warning below covers malformed values without exposing their contents.
  }

  console.error(
    `[strapi] ${variableName} is not configured for the Avangarda CMS origin. ` +
    "The production frontend will not contact that host."
  );
  return "";
}

const STRAPI_URL = enforceProductionStrapiOrigin(resolveStrapiUrl(
  process.env.STRAPI_URL ||
  process.env.NEXT_PUBLIC_STRAPI_URL
), "STRAPI_URL/NEXT_PUBLIC_STRAPI_URL");
const STRAPI_PUBLIC_URL = enforceProductionStrapiOrigin(resolveStrapiUrl(
  process.env.NEXT_PUBLIC_STRAPI_PUBLIC_URL ||
  process.env.NEXT_PUBLIC_STRAPI_URL ||
  process.env.STRAPI_URL
), "NEXT_PUBLIC_STRAPI_PUBLIC_URL");
const STRAPI_FETCH_TIMEOUT_MS = (() => {
  const parsed = Number(process.env.STRAPI_FETCH_TIMEOUT_MS || 55000);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 55000;
})();
const STRAPI_REVALIDATE_SECONDS = (() => {
  const parsed = Number(process.env.STRAPI_REVALIDATE_SECONDS || 300);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 300;
})();

const strapiWarnings = new Set<string>();

type FetchOpts = {
  cache?: RequestCache;
  next?: { revalidate?: number };
  cacheKey?: string;
};

type UnknownRecord = Record<string, unknown> & { id?: number | string; attributes?: Record<string, unknown> };

function isObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function unwrapItem<T>(value: unknown): T | null {
  if (!isObject(value)) return null;

  const record = value as UnknownRecord;
  const base = isObject(record.attributes) ? record.attributes : record;

  return {
    ...base,
    ...(record.id !== undefined ? { id: record.id } : {})
  } as T;
}

function warnOnce(message: string) {
  if (strapiWarnings.has(message)) return;
  strapiWarnings.add(message);
  console.warn(message);
}

async function fetchStrapiJson(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(`Strapi timeout after ${STRAPI_FETCH_TIMEOUT_MS}ms`),
    STRAPI_FETCH_TIMEOUT_MS
  );

  try {
    const res = await fetch(url, {
      cache: "no-store",
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`Strapi returned HTTP ${res.status}`);
    }

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.toLowerCase().includes("application/json")) {
      throw new Error("Strapi returned a non-JSON response");
    }

    return await res.json() as unknown;
  } finally {
    clearTimeout(timeout);
  }
}

function fetchCachedStrapiJson(url: string, cacheIdentity: string, revalidate: number) {
  const cachedFetch = unstable_cache(
    () => fetchStrapiJson(url),
    ["avangarda-public-strapi-json-v2", cacheIdentity],
    { revalidate, tags: ["avangarda-public-cms"] }
  );

  return cachedFetch();
}

export async function strapiGet<T>(path: string, opts: FetchOpts = {}): Promise<T | null> {
  if (!STRAPI_URL) {
    warnOnce("[strapi] Missing or invalid STRAPI_URL/NEXT_PUBLIC_STRAPI_URL. Public CMS content is unavailable.");
    return null;
  }

  try {
    const url = `${STRAPI_URL}${path}`;
    const shouldBypassCache = opts.cache === "no-store" || opts.next?.revalidate === 0;
    const requestedRevalidate = opts.next?.revalidate;
    const revalidate = Number.isFinite(requestedRevalidate) && Number(requestedRevalidate) > 0
      ? Math.floor(Number(requestedRevalidate))
      : STRAPI_REVALIDATE_SECONDS;
    const payload = shouldBypassCache
      ? await fetchStrapiJson(url)
      : await fetchCachedStrapiJson(url, opts.cacheKey || path, revalidate);

    return payload as T;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown fetch error";
    warnOnce(`[strapi] Request error for ${path}: ${message}. No demo content will be used in production.`);
    return null;
  }
}

export function unwrapStrapiCollection<T>(value: unknown): T[] {
  const source = isObject(value) && "data" in value ? (value as { data?: unknown }).data : value;
  if (Array.isArray(source)) return source.map((item) => unwrapItem<T>(item)).filter(Boolean) as T[];
  const single = unwrapItem<T>(source);
  return single ? [single] : [];
}

export function unwrapStrapiSingle<T>(value: unknown): T | null {
  const source = isObject(value) && "data" in value ? (value as { data?: unknown }).data : value;
  return unwrapItem<T>(source);
}

export function formatDisplayDate(value?: string, lang = "sr") {
  if (!value) return "";

  try {
    const locale =
      lang === "en" ? "en-GB" :
      lang === "tr" ? "tr-TR" :
      lang === "fr" ? "fr-FR" :
      lang === "de" ? "de-DE" :
      lang === "es" ? "es-ES" :
      lang === "el" ? "el-GR" :
      lang === "ar" ? "ar" :
      "sr-Latn-RS";

    return new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function getStrapiMediaUrl(value?: string | null) {
  if (!value) return "";
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (!STRAPI_PUBLIC_URL) return value;
  return `${STRAPI_PUBLIC_URL}${value}`;
}
