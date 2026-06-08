function collectOrigins(values) {
  return values
    .flatMap((value) => (typeof value === "string" ? value.split(",") : []))
    .map((value) => value.trim())
    .filter(Boolean);
}

module.exports = ({ env }) => {
  const allowedOrigins = new Set([
    "https://avangarda.media",
    "https://www.avangarda.media",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    ...collectOrigins([
      env("PUBLIC_URL"),
      env("FRONTEND_URL"),
      env("NEXT_PUBLIC_SITE_URL"),
      env("CORS_ORIGINS"),
    ]),
  ]);

  const allowedOriginPatterns = [
    /^https:\/\/.*\.vercel\.app$/i,
    /^http:\/\/localhost:\d+$/i,
    /^http:\/\/127\.0\.0\.1:\d+$/i,
  ];

  return [
    "strapi::errors",
    "strapi::security",
    {
      name: "strapi::cors",
      config: {
        origin: (ctx) => {
          const requestOrigin = ctx.request.header.origin;
          if (!requestOrigin) return "";
          if (allowedOrigins.has(requestOrigin)) return requestOrigin;
          if (allowedOriginPatterns.some((pattern) => pattern.test(requestOrigin))) {
            return requestOrigin;
          }
          return "";
        },
        headers: ["Content-Type", "Authorization", "Origin", "Accept"],
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
        keepHeaderOnError: true,
      },
    },
    "strapi::poweredBy",
    "strapi::logger",
    "strapi::query",
    "strapi::body",
    "strapi::session",
    "strapi::favicon",
    "strapi::public",
  ];
};
