import { NextResponse } from "next/server";

const STRAPI_URL = (
  process.env.STRAPI_URL ||
  process.env.NEXT_PUBLIC_STRAPI_URL ||
  "http://localhost:1337"
).replace(/\/$/, "");

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const articleId = Number(body?.articleId);

    if (!Number.isInteger(articleId) || articleId <= 0) {
      return NextResponse.json({ ok: false }, { status: 400 });
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
