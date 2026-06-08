import { NextResponse } from "next/server";
import {
  checkRateLimit,
  COMMENT_CONTENT_MAX_LENGTH,
  COMMENT_CONTENT_MIN_LENGTH,
  COMMENT_EMAIL_MAX_LENGTH,
  COMMENT_NAME_MAX_LENGTH,
  sanitizeEmailInput,
  sanitizeLangInput,
  sanitizePathInput,
  sanitizeSlugInput,
  sanitizeTextInput,
} from "@/lib/security";

const STRAPI_URL = (
  process.env.STRAPI_URL ||
  process.env.NEXT_PUBLIC_STRAPI_URL ||
  (process.env.NODE_ENV === "development" ? "http://localhost:1337" : "")
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

  if (!slug) {
    return `${siteOrigin}/?lang=${lang}`;
  }

  return `${siteOrigin}/a/${slug}?lang=${lang}`;
}

function articleRedirect(req: Request, slug: string, lang = "sr", returnTo = "") {
  return NextResponse.redirect(safeRedirectTarget(getSiteOrigin(req), returnTo, slug, lang));
}

export async function POST(req: Request) {
  const rateLimit = checkRateLimit(req, {
    bucket: "api-comments",
    max: 8,
    windowMs: 10 * 60_000,
  });

  const form = await req.formData();
  const slug = sanitizeSlugInput(form.get("slug"));
  const lang = sanitizeLangInput(form.get("lang"));
  const returnTo = sanitizePathInput(form.get("returnTo"), "");
  const authorName = sanitizeTextInput(form.get("authorName"), COMMENT_NAME_MAX_LENGTH);
  const authorEmailRaw = sanitizeTextInput(form.get("authorEmail"), COMMENT_EMAIL_MAX_LENGTH);
  const authorEmail = authorEmailRaw ? sanitizeEmailInput(authorEmailRaw) : "";
  const content = sanitizeTextInput(form.get("content"), COMMENT_CONTENT_MAX_LENGTH, { allowNewlines: true });
  const honeypot = sanitizeTextInput(form.get("website"), 120);

  if (honeypot) return articleRedirect(req, slug, lang, returnTo);
  if (!rateLimit.allowed) return articleRedirect(req, slug, lang, returnTo);
  if (!slug || content.length < COMMENT_CONTENT_MIN_LENGTH) return articleRedirect(req, slug, lang, returnTo);
  if (authorEmailRaw && !authorEmail) return articleRedirect(req, slug, lang, returnTo);
  if (!STRAPI_URL) return articleRedirect(req, slug, lang, returnTo);

  try {
    const find = await fetch(`${STRAPI_URL}/api/articles?filters[slug][$eq]=${encodeURIComponent(slug)}`, {
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });
    if (!find.ok) return articleRedirect(req, slug, lang, returnTo);

    const findJson = await find.json();
    const articleId = findJson?.data?.[0]?.id;

    if (!articleId) return articleRedirect(req, slug, lang, returnTo);

    const create = await fetch(`${STRAPI_URL}/api/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        data: {
          content,
          status: "approved",
          authorName: authorName || undefined,
          authorEmail: authorEmail || undefined,
          article: articleId,
        },
      }),
      cache: "no-store",
    });

    if (!create.ok) {
      return articleRedirect(req, slug, lang, returnTo);
    }
  } catch {
    return articleRedirect(req, slug, lang, returnTo);
  }

  return articleRedirect(req, slug, lang, returnTo);
}
