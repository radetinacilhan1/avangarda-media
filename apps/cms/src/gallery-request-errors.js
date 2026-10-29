"use strict";

const { randomUUID } = require("node:crypto");
const { errors } = require("@strapi/utils");

function requestKind(ctx) {
  if (ctx.method === "POST" && /^\/upload\/?$/.test(ctx.path)) return "upload";
  if (["POST", "PUT", "PATCH"].includes(ctx.method) && /^\/content-manager\/collection-types\/api::gallery\.gallery(?:\/\d+(?:\/actions\/[a-z-]+)?)?\/?$/.test(ctx.path)) return "gallery";
  return null;
}

function safeDiagnostic(error, environment = process.env) {
  let value = `${error?.name || "Error"}: ${error?.message || "Unknown server error"}\n${error?.stack || ""}`;
  for (const [key, secret] of Object.entries(environment)) {
    if (/(?:SECRET|TOKEN|PASSWORD|API_KEY|APP_KEYS|CLOUDINARY_KEY|DATABASE_URL|SMTP_URL|CLOUDINARY_URL)/i.test(key) && typeof secret === "string") {
      for (const part of key === "APP_KEYS" ? [secret, ...secret.split(",")] : [secret]) {
        if (part.length >= 6) value = value.split(part).join("[redacted]");
      }
    }
  }
  return value
    .replace(/\\"/g, '"')
    .replace(/([a-z][a-z0-9+.-]*:\/\/)[^\s/@]+:[^\s/@]+@/gi, "$1[redacted]@")
    .replace(/(["']?[A-Za-z0-9_.-]*(?:authorization|password|secret|token|api[_-]?key|signature)[A-Za-z0-9_.-]*["']?\s*[=:]\s*)(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|(?:Bearer\s+)?[^\s&,;}]+)/gi, "$1[redacted]")
    .replace(/\bBearer\s+[A-Za-z0-9._~+\/-]+/gi, "Bearer [redacted]")
    .slice(0, 12000);
}

function createGalleryRequestErrors(app) {
  return async (ctx, next) => {
    const kind = requestKind(ctx);
    if (!kind) return next();
    try { await next(); }
    catch (error) {
      // Native field validation retains its exact paths and normal status 400.
      if (error instanceof errors.ApplicationError || error instanceof errors.HttpError) throw error;
      const requestId = ctx.state?.cmsRequestId || randomUUID();
      ctx.state ||= {};
      ctx.state.cmsRequestId = requestId;
      ctx.set?.("X-CMS-Request-ID", requestId);
      app.log.error(`[avangarda-${kind}] requestId=${requestId} method=${ctx.method} code=${String(error?.code || "unknown").replace(/[^A-Za-z0-9_-]/g, "")} ${safeDiagnostic(error)}`);
      ctx.status = 500;
      ctx.body = {
        data: null,
        error: {
          status: 500,
          name: "InternalServerError",
          message: kind === "upload"
            ? `Upload nije završen zbog greške servera ili servisa za fotografije. Proverite biblioteku pre ponovnog pokušaja; unosi u galeriji su ostali u formi. Oznaka greške: ${requestId}.`
            : `Server je prijavio grešku i ishod čuvanja još nije potvrđen. Unosi su ostali u otvorenoj formi. Proverite sačuvanu verziju pre ponovnog pokušaja. Oznaka zahteva: ${requestId}.`,
          details: { requestId },
        },
      };
    }
  };
}

module.exports = { requestKind, safeDiagnostic, createGalleryRequestErrors };
