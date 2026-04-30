import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Avangarda",
  applicationName: "Avangarda",
  manifest: "/site.webmanifest?v=2",
  icons: {
    icon: [
      { url: "/favicon-32x32.png?v=2", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16x16.png?v=2", type: "image/png", sizes: "16x16" },
      { url: "/favicon.ico?v=2", sizes: "any" },
    ],
    shortcut: "/favicon.ico?v=2",
    apple: [{ url: "/apple-touch-icon.png?v=2", type: "image/png", sizes: "180x180" }],
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
      </head>
      <body>{children}</body>
    </html>
  );
}
