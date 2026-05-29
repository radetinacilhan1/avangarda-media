const path = require("path");

const nextConfig = {
  output: "standalone",
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@": path.join(__dirname, "src"),
    };

    return config;
  },
};

module.exports = nextConfig;
