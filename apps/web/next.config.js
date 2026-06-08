const path = require("path");

function normalizeOrigin(value) {
  if (!value || typeof value !== "string") return "";

  try {
    return new URL(value).origin;
  } catch {
    return "";
  }
}

function collectOrigins(...values) {
  return Array.from(
    new Set(
      values
        .flatMap((value) => (typeof value === "string" ? value.split(",") : []))
        .map((value) => normalizeOrigin(value.trim()))
        .filter(Boolean)
    )
  );
}

function buildContentSecurityPolicy() {
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
    "img-src": ["'self'", "data:", "blob:", "https:"],
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

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: buildContentSecurityPolicy(),
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=(), browsing-topics=()",
  },
];

if (process.env.NODE_ENV === "production") {
  securityHeaders.push({
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  });
}

const nextConfig = {
  output: "standalone",
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@": path.join(__dirname, "src"),
    };

    return config;
  },
};

module.exports = nextConfig;
