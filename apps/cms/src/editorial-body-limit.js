"use strict";
const { MAX_INTAKE_JSON_BYTES } = require("./editorial-intake");
const isIntake = (ctx) => ctx.method === "POST" && ["/api/fact-check-submissions/submit", "/api/contribute-page/submit"].includes(String(ctx.path).toLowerCase().replace(/\/+$/, ""));

function extendBodyFactory(original) {
  return (config, context) => {
    const ordinary = original(config, context);
    // The actual streaming parser enforces this bound, including chunked requests
    // with no Content-Length. Existing editor/article/media limits stay unchanged.
    const intake = original({ ...config, jsonLimit: MAX_INTAKE_JSON_BYTES, multipart: false }, context);
    return (ctx, next) => (isIntake(ctx) ? intake(ctx, next) : ordinary(ctx, next));
  };
}
function installEditorialBodyLimit(app) { app.container.get("middlewares").extend("strapi::body", extendBodyFactory); }
module.exports = { isIntake, extendBodyFactory, installEditorialBodyLimit };
