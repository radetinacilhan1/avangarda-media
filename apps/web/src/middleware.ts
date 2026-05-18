import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  LANGUAGE_COOKIE_NAME,
  defaultLang,
  isLang,
  mapCountryCodeToLang,
  resolvePreferredLanguageFromBrowser,
} from "@/lib/i18n";

function getRequestedBrowserLanguages(request: NextRequest) {
  const header = request.headers.get("accept-language");
  if (!header) return [];

  return header
    .split(",")
    .map((value) => value.split(";")[0]?.trim())
    .filter(Boolean);
}

function resolveRequestLanguage(request: NextRequest) {
  const queryLang = request.nextUrl.searchParams.get("lang");
  if (isLang(queryLang)) {
    return queryLang;
  }

  const storedLang = request.cookies.get(LANGUAGE_COOKIE_NAME)?.value;
  if (isLang(storedLang)) {
    return storedLang;
  }

  const browserLang = resolvePreferredLanguageFromBrowser(getRequestedBrowserLanguages(request));
  if (browserLang) {
    return browserLang;
  }

  const countryCode =
    request.headers.get("x-vercel-ip-country") ||
    request.headers.get("cf-ipcountry");
  const countryLang = mapCountryCodeToLang(countryCode);
  if (countryLang) {
    return countryLang;
  }

  return defaultLang;
}

export function middleware(request: NextRequest) {
  const resolvedLang = resolveRequestLanguage(request);
  const queryLang = request.nextUrl.searchParams.get("lang");
  const url = request.nextUrl.clone();
  const needsRewrite = !isLang(queryLang);
  const requestHeaders = new Headers(request.headers);

  requestHeaders.set("x-avangarda-lang", resolvedLang);
  requestHeaders.set("x-avangarda-pathname", request.nextUrl.pathname);

  if (needsRewrite) {
    url.searchParams.set("lang", resolvedLang);
  }

  const response = needsRewrite
    ? NextResponse.rewrite(url, { request: { headers: requestHeaders } })
    : NextResponse.next({ request: { headers: requestHeaders } });
  response.cookies.set(LANGUAGE_COOKIE_NAME, resolvedLang, {
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    path: "/",
  });
  response.headers.set("x-avangarda-lang", resolvedLang);
  response.headers.set("x-avangarda-pathname", request.nextUrl.pathname);
  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|site.webmanifest|robots.txt|sitemap.xml).*)",
  ],
};
