import type { Metadata } from "next";
import { Suspense } from "react";

import { ImageProtectionBoundary } from "@/components/image-protection-boundary";
import { AssistantWidget } from "@/components/assistant-widget";
import { LanguagePreferenceSync } from "@/components/language-preference-sync";
import { SiteIntro } from "@/components/site-intro";
import { buildSiteStructuredData, SITE_NAME } from "@/lib/seo";
import { THEME_STORAGE_KEY } from "@/lib/theme";
import { getLanguageDirection, type Lang } from "@/lib/i18n";

import "leaflet/dist/leaflet.css";
import "@/app/globals.css";

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
  const systemTheme = () => typeof window.matchMedia === "function" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  try {
    const savedTheme = window.localStorage.getItem("${THEME_STORAGE_KEY}");
    const preference = ["system", "dark", "light", "bordeaux"].includes(savedTheme) ? savedTheme : "system";
    const theme = preference === "system" ? systemTheme() : preference;
    root.dataset.theme = theme;
    root.dataset.themePreference = preference;
    root.style.colorScheme = theme === "light" ? "light" : "dark";
  } catch {
    const theme = systemTheme();
    root.dataset.theme = theme;
    root.dataset.themePreference = "system";
    root.style.colorScheme = theme;
  }
})();`;

export default function SiteDocument({ children, lang }: { children: React.ReactNode; lang: Lang }) {
  return (
    <html lang={lang} dir={getLanguageDirection(lang)} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildSiteStructuredData(lang)) }}
        />
      </head>
      <body>
        <SiteIntro />
        <LanguagePreferenceSync lang={lang} />
        <ImageProtectionBoundary />
        {children}
        <Suspense fallback={null}>
          <AssistantWidget lang={lang} direction={getLanguageDirection(lang)} />
        </Suspense>
      </body>
    </html>
  );
}
