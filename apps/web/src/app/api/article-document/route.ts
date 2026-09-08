import { NextResponse } from "next/server";
import { getArticleDocuments } from "@/lib/article-documents";
import { strapiGet, unwrapStrapiCollection } from "@/lib/strapi";
import { fetchLegalPdf, sanitizeLegalPdfFilename } from "@/lib/legal-document-source";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const headers = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex", "X-Content-Type-Options": "nosniff" };
const error = (message: string, status: number) => NextResponse.json({ error: message }, { status, headers });

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const slug = params.get("slug") || "";
  const id = Number(params.get("document"));
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 200 || !Number.isSafeInteger(id) || id <= 0) {
    return error("INVALID_DOCUMENT", 400);
  }
  try {
    const response = await strapiGet<{ data: unknown[] }>(
      `/api/articles?filters[slug][$eq]=${encodeURIComponent(slug)}&filters[publishedAt][$notNull]=true&fields[0]=slug&populate[documents][populate][0]=pdfFile`,
      { cache: "no-store" }
    );
    if (!response) return error("CMS_UNAVAILABLE", 503);
    const article = unwrapStrapiCollection<{ documents?: unknown }>(response)[0];
    const document = article && getArticleDocuments(article.documents).find((entry) => entry.id === id);
    if (!document) return error("DOCUMENT_NOT_FOUND", 404);
    // Shared resolver preserves original URLs, checks public HTTPS/DNS, PDF signature and 15 MB limit.
    const pdf = await fetchLegalPdf(document.url);
    const filename = sanitizeLegalPdfFilename(document.title);
    return new Response(pdf.bytes, { headers: { ...headers, "Content-Type": "application/pdf",
      "Content-Length": String(pdf.bytes.byteLength), "Content-Disposition": `inline; filename="${filename}"` } });
  } catch { return error("DOCUMENT_UNAVAILABLE", 502); }
}
