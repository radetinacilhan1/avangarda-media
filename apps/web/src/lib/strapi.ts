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

const STRAPI_URL = resolveStrapiUrl(
  process.env.STRAPI_URL ||
  process.env.NEXT_PUBLIC_STRAPI_URL
);
const STRAPI_PUBLIC_URL = resolveStrapiUrl(
  process.env.NEXT_PUBLIC_STRAPI_PUBLIC_URL ||
  process.env.NEXT_PUBLIC_STRAPI_URL ||
  process.env.STRAPI_URL
);

const strapiWarnings = new Set<string>();

type FetchOpts = { cache?: RequestCache; next?: { revalidate?: number } };

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

export async function strapiGet<T>(path: string, opts: FetchOpts = {}): Promise<T | null> {
  if (!STRAPI_URL) {
    warnOnce("[strapi] Missing STRAPI_URL/NEXT_PUBLIC_STRAPI_URL. Frontend will fall back to static content.");
    return null;
  }

  try {
    const url = `${STRAPI_URL}${path}`;
    const res = await fetch(url, { cache: opts.cache ?? "no-store", next: opts.next });
    if (!res.ok) {
      warnOnce(`[strapi] Request failed with ${res.status} for ${url}. Frontend will use fallback content.`);
      return null;
    }

    return res.json() as Promise<T>;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown fetch error";
    warnOnce(`[strapi] Request error for ${path}: ${message}. Frontend will use fallback content.`);
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
