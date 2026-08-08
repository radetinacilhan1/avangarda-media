import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  LANGUAGE_COOKIE_NAME,
  LANGUAGE_COOKIE_MAX_AGE,
  defaultLang,
  isLang,
  resolvePreferredLanguageFromBrowser,
} from "@/lib/i18n";
import { applySecurityHeaders } from "@/lib/security";

function getRequestedBrowserLanguages(request: NextRequest) {
  const header = request.headers.get("accept-language");
  if (!header) return [];

  return header
    .split(",")
    .map((value, index) => {
      const [language, ...parameters] = value.split(";");
      const qualityParameter = parameters.find((parameter) => parameter.trim().startsWith("q="));
      const quality = qualityParameter ? Number.parseFloat(qualityParameter.split("=")[1] || "0") : 1;

      return {
        language: language?.trim() || "",
        quality: Number.isFinite(quality) ? quality : 0,
        index,
      };
    })
    .filter((entry) => entry.language && entry.quality > 0)
    .sort((left, right) => right.quality - left.quality || left.index - right.index)
    .map((entry) => entry.language);
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

  return defaultLang;
}

function resolvePrefixedPath(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const candidate = segments[0];

  if (!isLang(candidate)) {
    return null;
  }

  const internalPathname = segments.length > 1 ? `/${segments.slice(1).join("/")}` : "/";
  return { lang: candidate, internalPathname };
}

function persistResolvedLanguage(response: NextResponse, lang: ReturnType<typeof resolveRequestLanguage>) {
  response.cookies.set(LANGUAGE_COOKIE_NAME, lang, {
    maxAge: LANGUAGE_COOKIE_MAX_AGE,
    sameSite: "lax",
    path: "/",
  });
  response.headers.set("x-avangarda-lang", lang);
  response.headers.append("Vary", "Accept-Language, Cookie");
  return response;
}

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === "/api" || request.nextUrl.pathname.startsWith("/api/")) {
    return applySecurityHeaders(NextResponse.next());
  }

  const prefixedPath = resolvePrefixedPath(request.nextUrl.pathname);
  const resolvedLang = prefixedPath?.lang ?? resolveRequestLanguage(request);
  const url = request.nextUrl.clone();
  const requestHeaders = new Headers(request.headers);

  if (request.nextUrl.pathname === "/") {
    url.pathname = `/${resolvedLang}`;
    url.searchParams.delete("lang");

    const response = persistResolvedLanguage(NextResponse.redirect(url), resolvedLang);
    response.headers.set("x-avangarda-pathname", "/");
    return applySecurityHeaders(response);
  }

  if (prefixedPath) {
    url.pathname = prefixedPath.internalPathname;
    url.searchParams.set("lang", prefixedPath.lang);
    requestHeaders.set("x-avangarda-lang", prefixedPath.lang);
    requestHeaders.set("x-avangarda-pathname", prefixedPath.internalPathname);

    const response = persistResolvedLanguage(
      NextResponse.rewrite(url, { request: { headers: requestHeaders } }),
      prefixedPath.lang
    );
    response.headers.set("x-avangarda-pathname", prefixedPath.internalPathname);
    return applySecurityHeaders(response);
  }

  const queryLang = request.nextUrl.searchParams.get("lang");
  const needsRewrite = !isLang(queryLang);

  requestHeaders.set("x-avangarda-lang", resolvedLang);
  requestHeaders.set("x-avangarda-pathname", request.nextUrl.pathname);

  if (needsRewrite) {
    url.searchParams.set("lang", resolvedLang);
  }

  const response = needsRewrite
    ? NextResponse.rewrite(url, { request: { headers: requestHeaders } })
    : NextResponse.next({ request: { headers: requestHeaders } });
  persistResolvedLanguage(response, resolvedLang);
  response.headers.set("x-avangarda-pathname", request.nextUrl.pathname);
  return applySecurityHeaders(response);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|site.webmanifest|robots.txt|sitemap.xml).*)",
  ],
};
