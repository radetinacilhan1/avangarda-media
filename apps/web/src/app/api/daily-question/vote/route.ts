import { NextResponse } from "next/server";

import { checkRateLimit, sanitizeVoteAnswer } from "@/lib/security";

const STRAPI_URL = (
  process.env.STRAPI_URL ||
  process.env.NEXT_PUBLIC_STRAPI_URL ||
  (process.env.NODE_ENV === "development" ? "http://localhost:1337" : "")
).replace(/\/$/, "");

export async function POST(req: Request) {
  const rateLimit = checkRateLimit(req, {
    bucket: "api-daily-question-vote",
    max: 40,
    windowMs: 10 * 60_000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many votes right now." },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfterSeconds),
        },
      }
    );
  }

  if (!STRAPI_URL) {
    return NextResponse.json(
      {
        error: "CMS unavailable"
      },
      {
        status: 503
      }
    );
  }

  try {
    const payload = await req.json();
    const answer = sanitizeVoteAnswer(payload?.answer);

    if (!answer) {
      return NextResponse.json(
        { error: "Invalid vote." },
        { status: 400 }
      );
    }

    const res = await fetch(`${STRAPI_URL}/api/daily-question/vote`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        answer
      }),
      cache: "no-store"
    });

    const data = await res.json().catch(() => ({}));

    return NextResponse.json(data, {
      status: res.status
    });
  } catch {
    return NextResponse.json(
      {
        error: "Vote request failed"
      },
      {
        status: 500
      }
    );
  }
}
