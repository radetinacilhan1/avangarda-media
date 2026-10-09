"use strict";

// Avangarda's custom public controllers intentionally return EntityService
// records directly. Remove the two server/editor-only attributes everywhere,
// including nested related-article populations, without changing admin output.
function removePrivateEditorialFields(value) {
  if (Array.isArray(value)) return value.map(removePrivateEditorialFields);
  if (!value || typeof value !== "object" || value instanceof Date || Buffer.isBuffer(value)) return value;
  return Object.fromEntries(Object.entries(value)
    .filter(([key]) => key !== "homepagePlacement" && key !== "headlineState")
    .map(([key, item]) => [key, removePrivateEditorialFields(item)]));
}

module.exports = () => async (ctx, next) => {
  await next();
  if (ctx.path === "/api" || ctx.path.startsWith("/api/")) ctx.body = removePrivateEditorialFields(ctx.body);
};
module.exports.removePrivateEditorialFields = removePrivateEditorialFields;
