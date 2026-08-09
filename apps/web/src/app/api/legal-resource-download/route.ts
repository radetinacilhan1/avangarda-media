import { NextResponse } from "next/server";

import { fetchLegalResourceBySlug } from "@/lib/human-rights";
import type { Lang } from "@/lib/i18n";
import {
  fetchLegalPdf,
  resolveLegalDocumentSource,
  sanitizeLegalPdfFilename,
} from "@/lib/legal-document-source";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const runtime = "nodejs";

const SUPPORTED_LOCALES = new Set<Lang>(["sr", "en", "tr", "fr", "de", "es", "el", "ar"]);

function getLocale(value: string | null): Lang {
  return value && SUPPORTED_LOCALES.has(value as Lang) ? (value as Lang) : "sr";
}

function isValidSlug(value: string) {
  return value.length > 0 && value.length <= 160 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

function noStoreJson(error: string, status: number) {
  return NextResponse.json(
    { error },
    {
      status,
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
        "CDN-Cache-Control": "no-store",
        "Vercel-CDN-Cache-Control": "no-store",
      },
    },
  );
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const slug = (requestUrl.searchParams.get("slug") || "").trim().toLowerCase();
  const locale = getLocale(requestUrl.searchParams.get("locale"));
  const disposition = requestUrl.searchParams.get("mode") === "inline" ? "inline" : "attachment";

  if (!isValidSlug(slug)) {
    return noStoreJson("INVALID_LEGAL_RESOURCE", 400);
  }

  try {
    const item = await fetchLegalResourceBySlug(locale, slug);
    if (!item) {
      return noStoreJson("LEGAL_RESOURCE_NOT_FOUND", 404);
    }

    const source = await resolveLegalDocumentSource(item);
    if (source.kind !== "pdf") {
      return noStoreJson("PDF_NOT_AVAILABLE", 404);
    }

    const document = await fetchLegalPdf(source.url);
    const filename = sanitizeLegalPdfFilename(item.slug || item.fileLabel || item.title);

    return new Response(document.bytes, {
      status: 200,
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
        "CDN-Cache-Control": "no-store",
        "Content-Disposition": `${disposition}; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
        "Content-Length": String(document.bytes.byteLength),
        "Content-Type": "application/pdf",
        "X-Content-Type-Options": "nosniff",
        "Vercel-CDN-Cache-Control": "no-store",
      },
    });
  } catch {
    return noStoreJson("LEGAL_DOCUMENT_UNAVAILABLE", 502);
  }
}
