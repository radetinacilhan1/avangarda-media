import { NextResponse } from "next/server";

import {
  checkRateLimit,
  sanitizeEmailInput,
  sanitizeLangInput,
  sanitizeTextInput,
} from "@/lib/security";

const STRAPI_URL = (
  process.env.STRAPI_URL ||
  process.env.NEXT_PUBLIC_STRAPI_URL ||
  (process.env.NODE_ENV === "development" ? "http://localhost:1337" : "")
).replace(/\/$/, "");

const STORY_SUMMARY_MIN_LENGTH = 24;

function jsonError(error: string, status: number, headers?: HeadersInit) {
  return NextResponse.json({ error }, { status, headers });
}

export async function POST(req: Request) {
  const rateLimit = checkRateLimit(req, {
    bucket: "api-contribute",
    max: 5,
    windowMs: 10 * 60_000,
  });

  if (!rateLimit.allowed) {
    return jsonError("RATE_LIMITED", 429, {
      "Retry-After": String(rateLimit.retryAfterSeconds),
    });
  }

  if (!STRAPI_URL) {
    return jsonError("CMS_UNAVAILABLE", 503);
  }

  try {
    const payload = await req.json();
    const lang = sanitizeLangInput(payload?.lang);
    const fullName = sanitizeTextInput(payload?.fullName, 120);
    const emailRaw = sanitizeTextInput(payload?.email, 160);
    const email = sanitizeEmailInput(emailRaw, 160);
    const storyTitle = sanitizeTextInput(payload?.storyTitle, 180);
    const storySummary = sanitizeTextInput(payload?.storySummary, 4000, { allowNewlines: true });
    const location = sanitizeTextInput(payload?.location, 160);
    const collaborationType = sanitizeTextInput(payload?.collaborationType, 80);
    const links = sanitizeTextInput(payload?.links, 1200, { allowNewlines: true });
    const honeypot = sanitizeTextInput(payload?.website, 120);
    const acknowledged = payload?.acknowledged === true;

    if (honeypot) {
      return NextResponse.json({ data: { received: true } });
    }

    if (!fullName || !email || !storyTitle || storySummary.length < STORY_SUMMARY_MIN_LENGTH || !acknowledged) {
      return jsonError("INVALID_SUBMISSION", 400);
    }

    const response = await fetch(`${STRAPI_URL}/api/contribute-page/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        data: {
          lang,
          fullName,
          email,
          storyTitle,
          storySummary,
          location,
          collaborationType,
          links,
          acknowledged,
        },
      }),
      cache: "no-store",
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = typeof data?.error === "string" ? data.error : "SUBMISSION_FAILED";
      return jsonError(error, response.status);
    }

    return NextResponse.json({ data: { received: true } });
  } catch {
    return jsonError("SUBMISSION_FAILED", 500);
  }
}
