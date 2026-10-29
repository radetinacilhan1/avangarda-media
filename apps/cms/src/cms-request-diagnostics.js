"use strict";

const { randomUUID } = require("node:crypto");
const v8 = require("node:v8");
const { errors } = require("@strapi/utils");

const galleryPath = /^\/content-manager\/collection-types\/api::gallery\.gallery(?:\/\d+(?:\/actions\/[a-z-]+)?)?\/?$/;
const writeMethods = new Set(["POST", "PUT", "PATCH"]);
function responseHeader(ctx, name) {
  return ctx.response?.get?.(name) || ctx.response?.headers?.[name.toLowerCase()] || "";
}
function safeHeader(value) {
  return String(value || "").replace(/[\r\n]/g, "").slice(0, 200);
}
function errorStatus(error) {
  for (const [type, status] of [[errors.RateLimitError, 429], [errors.UnauthorizedError, 401], [errors.ForbiddenError, 403], [errors.NotFoundError, 404], [errors.PayloadTooLargeError, 413], [errors.NotImplementedError, 501]]) {
    if (type && error instanceof type) return status;
  }
  if (error instanceof errors.HttpError) return error.status;
  if (error instanceof errors.ApplicationError) return 400;
  return Number.isInteger(error?.status) && error.status >= 400 && error.status <= 599 ? error.status : 500;
}
function ensureRetryAfter(ctx, status, now = Date.now()) {
  if (status !== 429 || responseHeader(ctx, "Retry-After")) return;
  const reset = Number(responseHeader(ctx, "X-RateLimit-Reset") || ctx.state?.rateLimit?.reset);
  // koa2-ratelimit sets its reset before Strapi's custom handler throws. Its
  // default Retry-After branch is skipped by that handler; retain the same limit.
  if (Number.isFinite(reset) && reset > 0) ctx.set("Retry-After", String(Math.max(1, Math.ceil(reset - now / 1000))));
}
function resourceSnapshot(app) {
  const memory = process.memoryUsage();
  const result = {
    rss: memory.rss, heapUsed: memory.heapUsed, heapTotal: memory.heapTotal,
    external: memory.external, heapLimit: v8.getHeapStatistics().heap_size_limit,
  };
  const pool = app.db?.connection?.client?.pool;
  if (pool) {
    result.pool = {};
    for (const [key, method] of [["used", "numUsed"], ["free", "numFree"], ["pendingAcquires", "numPendingAcquires"], ["pendingCreates", "numPendingCreates"]]) {
      if (typeof pool[method] === "function") result.pool[key] = pool[method]();
    }
  }
  return result;
}
function createCmsRequestDiagnostics(app) {
  return async (ctx, next) => {
    const path = ctx.path;
    const admin = /^\/(?:admin|content-manager|upload)(?:\/|$)/.test(path);
    const publicRead = ctx.method === "GET" && /^\/api\/(?:articles|team-members)(?:\/\d+)?\/?$/.test(path);
    if (!admin && !publicRead) return next();
    ctx.state ||= {};
    const requestId = ctx.state.cmsRequestId ||= randomUUID();
    ctx.set("X-CMS-Request-ID", requestId);
    const startedAt = Date.now();
    const galleryWrite = writeMethods.has(ctx.method) && galleryPath.test(path);
    // A start record survives a process crash; never retain or log the payload.
    if (galleryWrite) app.log.info(`[cms-request] ${JSON.stringify({ phase: "start", requestId, time: new Date(startedAt).toISOString(), method: ctx.method, endpoint: path, requestBytes: Number(ctx.request?.header?.["content-length"]) || undefined, resources: resourceSnapshot(app) })}`);
    let thrown;
    try { await next(); }
    catch (error) { thrown = error; throw error; }
    finally {
      const status = thrown ? errorStatus(thrown) : ctx.status;
      ensureRetryAfter(ctx, status);
      const durationMs = Date.now() - startedAt;
      const uploadWrite = ctx.method === "POST" && /^\/upload(?:\/\d+)?\/?$/.test(path);
      if (galleryWrite || uploadWrite || admin && (status >= 400 || durationMs >= 5000) || publicRead && (durationMs >= 5000 || status >= 500)) {
        const headers = {};
        for (const name of ["Retry-After", "X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset"]) {
          const value = responseHeader(ctx, name);
          if (value) headers[name] = safeHeader(value);
        }
        const record = { phase: "complete", requestId, time: new Date().toISOString(), method: ctx.method, endpoint: path, status, durationMs, headers, resources: resourceSnapshot(app) };
        // Reading Koa's response.length for a JSON object serializes the whole
        // body. Only record an already supplied length, avoiding a second copy.
        const length = responseHeader(ctx, "Content-Length");
        if (length) record.responseBytes = Number(length) || undefined;
        app.log[status >= 500 ? "error" : status >= 400 ? "warn" : "info"](`[cms-request] ${JSON.stringify(record)}`);
      }
    }
  };
}

module.exports = { createCmsRequestDiagnostics, ensureRetryAfter, errorStatus, resourceSnapshot, galleryPath };
