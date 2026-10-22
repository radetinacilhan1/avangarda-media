import { NextResponse } from "next/server";

import { FACT_SUBMISSION_MAX_BYTES, validateFactSubmission } from "@/lib/fact-check-submission";
import { checkRateLimit } from "@/lib/security";

export const runtime = "nodejs";

function failure(error: string, status: number, headers?: HeadersInit) {
  return NextResponse.json({ error }, { status, headers });
}

async function readBoundedJson(request: Request) {
  if (request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase() !== "application/json") throw new Error("INVALID_SUBMISSION");
  const declaredSize = Number(request.headers.get("content-length") || 0);
  if (declaredSize > FACT_SUBMISSION_MAX_BYTES) throw new Error("INVALID_ATTACHMENT");
  const reader = request.body?.getReader();
  if (!reader) throw new Error("INVALID_SUBMISSION");
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > FACT_SUBMISSION_MAX_BYTES) { await reader.cancel(); throw new Error("INVALID_ATTACHMENT"); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return failure("INVALID_SUBMISSION", 403);
  const rate = checkRateLimit(request, { bucket: "fact-check-submissions", max: 5, windowMs: 10 * 60_000 });
  if (!rate.allowed) return failure("RATE_LIMITED", 429, { "Retry-After": String(rate.retryAfterSeconds) });
  const cms = (process.env.STRAPI_URL || process.env.NEXT_PUBLIC_STRAPI_URL || (process.env.NODE_ENV === "development" ? "http://localhost:1337" : "")).replace(/\/$/, "");
  if (!cms || (process.env.VERCEL_ENV === "production" && cms !== "https://cms.avangarda.media")) return failure("CMS_UNAVAILABLE", 503);
  try {
    const data = validateFactSubmission(await readBoundedJson(request));
    if (!data) return failure("INVALID_SUBMISSION", 400);
    const response = await fetch(`${cms}/api/fact-check-submissions/submit`, {
      method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ data }), cache: "no-store", signal: AbortSignal.timeout(55_000),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      if (response.status === 429) return failure("RATE_LIMITED", 429, { "Retry-After": response.headers.get("retry-after") || "600" });
      if (response.status === 400 || response.status === 413) return failure("INVALID_SUBMISSION", 400);
      return failure("SUBMISSION_FAILED", 503);
    }
    if (payload?.data?.received !== true) return failure("SUBMISSION_FAILED", 502);
    return NextResponse.json({ data: { received: true } }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    return ["INVALID_SUBMISSION", "INVALID_ATTACHMENT"].includes(code) || error instanceof SyntaxError
      ? failure(code === "INVALID_ATTACHMENT" ? code : "INVALID_SUBMISSION", 400)
      : failure("SUBMISSION_FAILED", 503);
  }
}
