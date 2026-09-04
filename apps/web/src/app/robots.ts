import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const isVercelPreview = Boolean(process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production");

  return {
    rules: [
      {
        userAgent: "*",
        ...(isVercelPreview ? { disallow: "/" } : { allow: "/" }),
      },
    ],
    ...(isVercelPreview ? {} : { sitemap: `${SITE_URL}/sitemap.xml`, host: SITE_URL }),
  };
}
