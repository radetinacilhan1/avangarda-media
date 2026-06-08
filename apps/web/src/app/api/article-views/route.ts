import { NextResponse } from "next/server";
import { checkRateLimit, sanitizeTextInput } from "@/lib/security";

const STRAPI_URL = (
  process.env.STRAPI_URL ||
  process.env.NEXT_PUBLIC_STRAPI_URL ||
  (process.env.NODE_ENV === "development" ? "http://localhost:1337" : "")
).replace(/\/$/, "");

export async function POST(req: Request) {
  const rateLimit = checkRateLimit(req, {
    bucket: "api-article-views",
    max: 240,
    windowMs: 5 * 60_000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  try {
    const body = await req.json();
    const rawArticleId = sanitizeTextInput(
      typeof body?.articleId === "number" ? String(body.articleId) : body?.articleId,
      16
    );
    const articleId = Number(rawArticleId);

    if (!Number.isInteger(articleId) || articleId <= 0) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    if (!STRAPI_URL) {
      return NextResponse.json({ ok: true, data: null });
    }

    const response = await fetch(`${STRAPI_URL}/api/articles/${articleId}/view`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      cache: "no-store"
    });

    if (!response.ok) {
      return NextResponse.json({ ok: false }, { status: response.status });
    }

    const payload = await response.json();

    return NextResponse.json({
      ok: true,
      data: payload?.data || null
    });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
