function resolveStrapiUrl(value?: string | null) {
  const trimmed = value?.trim().replace(/\/$/, "");
  if (trimmed) return trimmed;
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

export async function strapiGet<T>(path: string, opts: FetchOpts = {}): Promise<T | null> {
  if (!STRAPI_URL) return null;

  try {
    const url = `${STRAPI_URL}${path}`;
    const res = await fetch(url, { cache: opts.cache ?? "no-store", next: opts.next });
    if (!res.ok) return null;
    return res.json() as Promise<T>;
  } catch {
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
