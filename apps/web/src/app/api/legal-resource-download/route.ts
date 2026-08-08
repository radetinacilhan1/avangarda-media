import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const OFFICIAL_PDF_HOSTS = new Set(["www.rik.parlament.gov.rs"]);

function resolveBaseUrl(value?: string | null) {
  const trimmed = value?.trim().replace(/\/$/, "");
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^(localhost|127(?:\.\d{1,3}){3}|\[::1\])(?::\d+)?$/i.test(trimmed)) {
    return `http://${trimmed}`;
  }
  if (/^[a-z0-9.-]+(?::\d+)?$/i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return "";
}

function getStrapiBaseUrl() {
  return resolveBaseUrl(
    process.env.NEXT_PUBLIC_STRAPI_PUBLIC_URL ||
    process.env.NEXT_PUBLIC_STRAPI_URL ||
    process.env.STRAPI_URL ||
    (process.env.NODE_ENV === "development" ? "http://localhost:1337" : "")
  );
}

function getInternalStrapiBaseUrl() {
  return resolveBaseUrl(
    process.env.STRAPI_URL ||
    process.env.NEXT_PUBLIC_STRAPI_URL ||
    process.env.NEXT_PUBLIC_STRAPI_PUBLIC_URL ||
    (process.env.NODE_ENV === "development" ? "http://localhost:1337" : "")
  );
}

function getAllowedOrigins() {
  const origins = [
    process.env.NEXT_PUBLIC_STRAPI_PUBLIC_URL,
    process.env.NEXT_PUBLIC_STRAPI_URL,
    process.env.STRAPI_URL,
    process.env.NODE_ENV === "development" ? "http://localhost:1337" : "",
    process.env.NODE_ENV === "development" ? "http://cms:1337" : "",
  ]
    .map(resolveBaseUrl)
    .flatMap((value) => {
      try {
        return value ? [new URL(value).origin] : [];
      } catch {
        return [];
      }
    });

  return new Set(origins);
}

function resolveTargetUrl(rawUrl: string) {
  try {
    if (rawUrl.startsWith("/")) {
      const baseUrl = getStrapiBaseUrl();
      return baseUrl ? new URL(rawUrl, baseUrl) : null;
    }

    return new URL(rawUrl);
  } catch {
    return null;
  }
}

function sanitizeFilename(value: string) {
  const clean = value
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, "-")
    .replace(/^-+|-+$/g, "");

  const filename = clean || "pravni-resurs.pdf";
  return filename.toLowerCase().endsWith(".pdf") ? filename : `${filename}.pdf`;
}

function isAllowedMediaUrl(url: URL) {
  const isPdfPath = url.pathname.toLowerCase().endsWith(".pdf");

  if (getAllowedOrigins().has(url.origin) && url.pathname.startsWith("/uploads/") && isPdfPath) {
    return true;
  }

  return (
    url.protocol === "https:" &&
    OFFICIAL_PDF_HOSTS.has(url.hostname.toLowerCase()) &&
    isPdfPath
  );
}

function getFetchUrl(url: URL) {
  if (OFFICIAL_PDF_HOSTS.has(url.hostname.toLowerCase())) {
    return url;
  }

  const internalBaseUrl = getInternalStrapiBaseUrl();
  if (!internalBaseUrl) return url;

  try {
    const internalBase = new URL(internalBaseUrl);
    if (url.origin === internalBase.origin) return url;
    return new URL(`${url.pathname}${url.search}`, internalBase);
  } catch {
    return url;
  }
}

export async function GET(req: Request) {
  const requestUrl = new URL(req.url);
  const rawUrl = requestUrl.searchParams.get("url") || "";
  const filename = sanitizeFilename(requestUrl.searchParams.get("filename") || "");
  const targetUrl = resolveTargetUrl(rawUrl);

  if (!targetUrl || !isAllowedMediaUrl(targetUrl)) {
    return NextResponse.json({ error: "INVALID_PDF_URL" }, { status: 400 });
  }

  try {
    const response = await fetch(getFetchUrl(targetUrl), {
      cache: "no-store",
      headers: {
        Accept: "application/pdf,*/*",
      },
    });

    if (!response.ok || !response.body) {
      return NextResponse.json({ error: "PDF_UNAVAILABLE" }, { status: 502 });
    }

    const contentType = response.headers.get("Content-Type") || "";
    if (contentType && !/(?:application\/pdf|application\/octet-stream)/i.test(contentType)) {
      return NextResponse.json({ error: "INVALID_PDF_RESPONSE" }, { status: 502 });
    }

    return new Response(response.body, {
      status: 200,
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Disposition": `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
        "Content-Type": contentType || "application/pdf",
      },
    });
  } catch {
    return NextResponse.json({ error: "PDF_DOWNLOAD_FAILED" }, { status: 502 });
  }
}
