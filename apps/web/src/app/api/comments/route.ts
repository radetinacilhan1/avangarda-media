import { NextResponse } from "next/server";

const STRAPI_URL = (
  process.env.STRAPI_URL ||
  process.env.NEXT_PUBLIC_STRAPI_URL ||
  "http://localhost:1337"
).replace(/\/$/, "");

function getSiteOrigin(req: Request) {
  const configuredOrigin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (configuredOrigin) return configuredOrigin;

  try {
    return new URL(req.url).origin.replace(/\/$/, "");
  } catch {
    return "http://localhost:3000";
  }
}

function safeRedirectTarget(siteOrigin: string, returnTo: string, slug: string, lang = "sr") {
  if (returnTo.startsWith("/")) {
    return `${siteOrigin}${returnTo}`;
  }

  return `${siteOrigin}/a/${slug}?lang=${lang}`;
}

function articleRedirect(req: Request, slug: string, lang = "sr", returnTo = "") {
  return NextResponse.redirect(safeRedirectTarget(getSiteOrigin(req), returnTo, slug, lang));
}

export async function POST(req: Request) {
  const form = await req.formData();
  const slug = String(form.get("slug") || "");
  const lang = String(form.get("lang") || "sr");
  const returnTo = String(form.get("returnTo") || "");
  const authorName = String(form.get("authorName") || "");
  const authorEmail = String(form.get("authorEmail") || "");
  const content = String(form.get("content") || "");

  if (!slug || !content) return articleRedirect(req, slug, lang, returnTo);

  try {
    const find = await fetch(`${STRAPI_URL}/api/articles?filters[slug][$eq]=${encodeURIComponent(slug)}`);
    if (!find.ok) return articleRedirect(req, slug, lang, returnTo);

    const findJson = await find.json();
    const articleId = findJson?.data?.[0]?.id;

    if (!articleId) return articleRedirect(req, slug, lang, returnTo);

    await fetch(`${STRAPI_URL}/api/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: { content, status: "approved", authorName, authorEmail, article: articleId } })
    });
  } catch {
    return articleRedirect(req, slug, lang, returnTo);
  }

  return articleRedirect(req, slug, lang, returnTo);
}
