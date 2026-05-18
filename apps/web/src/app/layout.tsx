import type { Metadata } from "next";
import { headers } from "next/headers";

import { LanguagePreferenceSync } from "@/components/language-preference-sync";
import { getLanguageDirection, languages, resolveLang } from "@/lib/i18n";
import { buildLocalizedUrl, buildSiteStructuredData, buildXDefaultUrl, SITE_NAME } from "@/lib/seo";

import "./globals.css";

export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  return {
    applicationName: SITE_NAME,
    manifest: "/site.webmanifest",
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
        { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
        { url: "/android-chrome-192x192.png", type: "image/png", sizes: "192x192" },
        { url: "/android-chrome-512x512.png", type: "image/png", sizes: "512x512" },
      ],
      shortcut: "/favicon.ico",
      apple: [{ url: "/apple-touch-icon.png", type: "image/png", sizes: "180x180" }],
    },
  };
}

const themeInitScript = `(() => {
  const root = document.documentElement;
  const fallbackTheme = "dark";
  try {
    const savedTheme = window.localStorage.getItem("avangarda-theme");
    const theme = savedTheme === "light" ? "light" : fallbackTheme;
    root.dataset.theme = theme;
    root.style.colorScheme = theme === "light" ? "light" : "dark";
  } catch {
    root.dataset.theme = fallbackTheme;
    root.style.colorScheme = "dark";
  }
})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const requestHeaders = headers();
  const lang = resolveLang(requestHeaders.get("x-avangarda-lang") ?? undefined);
  const pathname = requestHeaders.get("x-avangarda-pathname") || "/";
  const direction = getLanguageDirection(lang);
  const canonical = buildLocalizedUrl(pathname, lang);
  const xDefault = buildXDefaultUrl(pathname);

  return (
    <html lang={lang} dir={direction} suppressHydrationWarning>
      <head>
        <link rel="canonical" href={canonical} />
        {languages.map((language) => (
          <link
            key={language.code}
            rel="alternate"
            hrefLang={language.code}
            href={buildLocalizedUrl(pathname, language.code)}
          />
        ))}
        <link rel="alternate" hrefLang="x-default" href={xDefault} />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildSiteStructuredData(lang)) }}
        />
      </head>
      <body>
        <LanguagePreferenceSync lang={lang} />
        {children}
      </body>
    </html>
  );
}
