import { NextResponse } from "next/server";
import { sanitizeLangInput, sanitizeSectionInput, sanitizeTextInput, sanitizeYearInput, SEARCH_QUERY_MAX_LENGTH, checkRateLimit } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const rateLimit = checkRateLimit(req, {
    bucket: "api-search",
    max: 90,
    windowMs: 60_000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { hits: [], total: 0, error: "rate_limited" },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfterSeconds),
        },
      }
    );
  }

  const { searchParams } = new URL(req.url);

  const q = sanitizeTextInput(searchParams.get("q"), SEARCH_QUERY_MAX_LENGTH);
  const section = sanitizeSectionInput(searchParams.get("section"));
  const year = sanitizeYearInput(searchParams.get("year"));
  const lang = sanitizeLangInput(searchParams.get("lang"));

  try {
    const { searchContent } = await import("@/lib/search");
    const result = await searchContent({ q, section, year, lang });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { hits: [], total: 0, error: "search_unavailable" },
      { status: 500 }
    );
  }
}
