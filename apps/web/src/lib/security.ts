import type { Lang } from "@/lib/i18n";
import { resolveLang } from "@/lib/i18n";

type SanitizeTextOptions = {
  allowNewlines?: boolean;
  collapseWhitespace?: boolean;
};

type RateLimitOptions = {
  bucket: string;
  max: number;
  windowMs: number;
};

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const rateLimitStore = new Map<string, RateLimitBucket>();

function normalizeOrigin(value: string) {
  try {
    return new URL(value).origin;
  } catch {
    return "";
  }
}

function collectOrigins(...values: Array<string | undefined>) {
  return Array.from(
    new Set(
      values
        .flatMap((value) => (typeof value === "string" ? value.split(",") : []))
        .map((value) => normalizeOrigin(value.trim()))
        .filter(Boolean)
    )
  );
}

export const SEARCH_QUERY_MAX_LENGTH = 160;
export const SEARCH_SECTION_MAX_LENGTH = 48;
export const COMMENT_NAME_MAX_LENGTH = 80;
export const COMMENT_EMAIL_MAX_LENGTH = 160;
export const COMMENT_CONTENT_MAX_LENGTH = 2000;
export const COMMENT_CONTENT_MIN_LENGTH = 2;
export const PATH_MAX_LENGTH = 240;
export const SLUG_MAX_LENGTH = 180;

export function buildContentSecurityPolicy() {
  const strapiOrigins = collectOrigins(
    process.env.STRAPI_URL,
    process.env.NEXT_PUBLIC_STRAPI_URL,
    process.env.NEXT_PUBLIC_STRAPI_PUBLIC_URL
  );

  const directives = {
    "default-src": ["'self'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
    "object-src": ["'none'"],
    "script-src": ["'self'", "'unsafe-inline'"],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "data:", "blob:", "https:", ...strapiOrigins],
    "font-src": ["'self'", "data:", "https:"],
    "connect-src": ["'self'", "https://air-quality-api.open-meteo.com", ...strapiOrigins],
    "media-src": ["'self'", "data:", "blob:", "https:", ...strapiOrigins],
    "frame-src": ["'self'", "https://www.youtube.com", "https://www.youtube-nocookie.com"],
    "manifest-src": ["'self'"],
    "worker-src": ["'self'", "blob:"],
  };

  if (process.env.NODE_ENV === "production") {
    directives["upgrade-insecure-requests"] = [];
  }

  return Object.entries(directives)
    .map(([key, values]) => (values.length ? `${key} ${values.join(" ")}` : key))
    .join("; ");
}

export function getSecurityHeaders() {
  const headers: Record<string, string> = {
    "Content-Security-Policy": buildContentSecurityPolicy(),
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy":
      "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=(), browsing-topics=()",
  };

  if (process.env.NODE_ENV === "production") {
    headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains";
  }

  return headers;
}

export function applySecurityHeaders(response: Response) {
  const headers = getSecurityHeaders();
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

function stripControlCharacters(value: string, allowNewlines: boolean) {
  return value.replace(allowNewlines ? /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g : /[\u0000-\u001F\u007F]/g, "");
}

export function sanitizeTextInput(
  value: unknown,
  maxLength: number,
  options: SanitizeTextOptions = {}
) {
  if (typeof value !== "string") return "";

  const allowNewlines = options.allowNewlines === true;
  const collapseWhitespace = options.collapseWhitespace !== false;
  const stripped = stripControlCharacters(value, allowNewlines);

  const normalized = allowNewlines
    ? stripped.replace(/\r\n?/g, "\n").replace(/[^\S\n]+/g, " ").replace(/\n{3,}/g, "\n\n")
    : stripped.replace(/\s+/g, " ");

  const trimmed = normalized.trim();
  if (!trimmed) return "";

  const safeValue = collapseWhitespace ? trimmed : stripped.trim();
  return safeValue.slice(0, maxLength);
}

export function sanitizeLangInput(value: unknown): Lang {
  return resolveLang(typeof value === "string" ? value : undefined);
}

export function sanitizePathInput(value: unknown, fallback = "/", maxLength = PATH_MAX_LENGTH) {
  const path = sanitizeTextInput(value, maxLength, { collapseWhitespace: false });
  if (!path) return fallback;
  if (!path.startsWith("/") || path.startsWith("//")) return fallback;
  if (/[\\\r\n]/.test(path)) return fallback;
  if (/^[a-z][a-z0-9+.-]*:/i.test(path)) return fallback;
  return path;
}

export function sanitizeSlugInput(value: unknown, maxLength = SLUG_MAX_LENGTH) {
  const slug = sanitizeTextInput(value, maxLength);
  if (!slug) return "";
  return /^[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?$/.test(slug) ? slug : "";
}

export function sanitizeSectionInput(value: unknown, maxLength = SEARCH_SECTION_MAX_LENGTH) {
  const section = sanitizeTextInput(value, maxLength);
  if (!section) return "";
  return /^[A-Za-z0-9-]+$/.test(section) ? section : "";
}

export function sanitizeYearInput(value: unknown) {
  const year = sanitizeTextInput(value, 4);
  if (!/^\d{4}$/.test(year)) return "";
  const numericYear = Number(year);
  if (numericYear < 1900 || numericYear > 2100) return "";
  return year;
}

export function sanitizeEmailInput(value: unknown, maxLength = COMMENT_EMAIL_MAX_LENGTH) {
  const email = sanitizeTextInput(value, maxLength);
  if (!email) return "";
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "";
}

export function sanitizeVoteAnswer(value: unknown) {
  const answer = sanitizeTextInput(value, 1).toUpperCase();
  return answer === "A" || answer === "B" ? answer : "";
}

export function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim().slice(0, 80) || "unknown";
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim().slice(0, 80);
  }

  return "unknown";
}

function cleanupRateLimitStore(now: number) {
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }
}

export function checkRateLimit(request: Request, options: RateLimitOptions) {
  const now = Date.now();
  if (rateLimitStore.size > 500) {
    cleanupRateLimitStore(now);
  }

  const key = `${options.bucket}:${getClientIp(request)}`;
  const current = rateLimitStore.get(key);

  if (!current || current.resetAt <= now) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + options.windowMs,
    });

    return {
      allowed: true,
      remaining: Math.max(options.max - 1, 0),
      retryAfterSeconds: Math.ceil(options.windowMs / 1000),
    };
  }

  if (current.count >= options.max) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(Math.ceil((current.resetAt - now) / 1000), 1),
    };
  }

  current.count += 1;
  rateLimitStore.set(key, current);

  return {
    allowed: true,
    remaining: Math.max(options.max - current.count, 0),
    retryAfterSeconds: Math.max(Math.ceil((current.resetAt - now) / 1000), 1),
  };
}
