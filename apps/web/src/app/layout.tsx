import type { Metadata } from "next";

import { buildSeoMetadata, SITE_NAME, siteStructuredData } from "@/lib/seo";

import "./globals.css";

export const metadata: Metadata = {
  ...buildSeoMetadata({ lang: "sr" }),
  applicationName: SITE_NAME,
  manifest: "/site.webmanifest",
  themeColor: "#050505",
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
  return (
    <html lang="sr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteStructuredData) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
