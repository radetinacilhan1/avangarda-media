import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Avangarda",
  applicationName: "Avangarda",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
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
