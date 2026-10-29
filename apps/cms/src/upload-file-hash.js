"use strict";

const crypto = require("node:crypto");

// Strapi prefixes this hash with optimized-, thumbnail_ and breakpoint names.
// Bound the storage key, retaining the editor's original Media Library name.
function boundedUploadHash(hash) {
  if (typeof hash !== "string" || Buffer.byteLength(hash, "utf8") <= 180) return hash;
  const suffix = crypto.createHash("sha256").update(hash).digest("hex").slice(0, 32);
  const prefix = hash.replace(/[^A-Za-z0-9_-]/g, "_").slice(0, 120);
  return `${prefix}_${suffix}`;
}

function extendUploadService(createService) {
  return (context) => {
    const service = createService(context);
    const formatFileInfo = service.formatFileInfo;
    return {
      ...service,
      async formatFileInfo(...args) {
        const file = await formatFileInfo.apply(this, args);
        return { ...file, hash: boundedUploadHash(file.hash) };
      },
    };
  };
}

module.exports = { boundedUploadHash, extendUploadService };
