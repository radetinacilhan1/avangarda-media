"use strict";

const { errors } = require("@strapi/utils");

const present = (value) => value !== undefined && value !== null;
function integer(value, name, minimum) {
  const parsed = typeof value === "number" || typeof value === "string" && value.trim() !== "" ? Number(value) : NaN;
  if (!Number.isSafeInteger(parsed) || parsed < minimum) throw new errors.ValidationError(`Invalid pagination ${name}.`);
  return parsed;
}

// REST requests use pagination[pageSize], whereas Entity Service expects flat
// page/pageSize (findPage) or start/limit (findMany). Passing the REST object to
// findMany silently ignored the requested window and loaded the whole corpus.
function normalizeArticlePagination(input) {
  const query = { ...input };
  const nested = query.pagination;
  delete query.pagination;
  if (present(nested) && (typeof nested !== "object" || Array.isArray(nested))) throw new errors.ValidationError("Invalid pagination.");
  const paging = { ...(nested || {}) };
  for (const key of ["page", "pageSize", "start", "limit", "withCount"]) {
    if (present(query[key])) paging[key] = query[key];
    delete query[key];
  }
  if (present(paging.withCount) && ![true, false, "true", "false", "t", "f", "1", "0", 1, 0].includes(paging.withCount)) throw new errors.ValidationError("Invalid pagination withCount.");
  const withCount = ![false, "false", "f", "0", 0].includes(paging.withCount);
  const hasPage = present(paging.page) || present(paging.pageSize);
  const hasOffset = present(paging.start) || present(paging.limit);
  if (hasPage && hasOffset) {
    // The existing most-read client sends limit=5&pagination[pageSize]=5.
    // Retain that equivalent alias without accepting conflicting windows.
    if (Number(paging.page || 1) !== 1 || Number(paging.start || 0) !== 0 || !present(paging.pageSize) || Number(paging.pageSize) !== Number(paging.limit)) {
      throw new errors.ValidationError("Cannot combine page and offset pagination.");
    }
    delete paging.page;
    delete paging.pageSize;
  }
  if (present(paging.page) || present(paging.pageSize)) {
    const page = integer(paging.page ?? 1, "page", 1);
    // This is the installed Entity Service findPage default, not a new cap.
    const pageSize = integer(paging.pageSize ?? 10, "pageSize", 1);
    if (!Number.isSafeInteger((page - 1) * pageSize)) throw new errors.ValidationError("Invalid pagination offset.");
    return { query: { ...query, page, pageSize }, pagination: { mode: "page", page, pageSize, withCount } };
  }
  if (hasOffset || present(paging.withCount)) {
    const start = integer(paging.start ?? 0, "start", 0);
    const limit = present(paging.limit) ? integer(paging.limit, "limit", -1) : undefined;
    if (limit === 0) throw new errors.ValidationError("Invalid pagination limit.");
    return { query: { ...query, start, ...(present(limit) ? { limit } : {}) }, pagination: { mode: "offset", start, limit, withCount } };
  }
  // Preserve the existing API behavior for callers that request no window.
  return { query, pagination: null };
}

async function findPublicArticles(service, input) {
  const uid = "api::article.article";
  const { query, pagination } = normalizeArticlePagination({ ...input, publicationState: "live" });
  if (!pagination) return { data: await service.findMany(uid, query), meta: {} };
  if (pagination.mode === "page" && pagination.withCount) {
    const { results, pagination: metadata } = await service.findPage(uid, query);
    return { data: results, meta: { pagination: metadata } };
  }
  const window = pagination.mode === "page" ? { start: (pagination.page - 1) * pagination.pageSize, limit: pagination.pageSize } : { start: pagination.start, ...(present(pagination.limit) ? { limit: pagination.limit } : {}) };
  const { page, pageSize, ...selection } = query;
  const data = await service.findMany(uid, { ...selection, ...window });
  const metadata = pagination.mode === "page" ? { page: pagination.page, pageSize: pagination.pageSize } : { start: pagination.start, limit: pagination.limit ?? data.length };
  if (pagination.withCount) {
    const countQuery = {};
    for (const key of ["filters", "publicationState", "locale", "_q"]) if (present(query[key])) countQuery[key] = query[key];
    metadata.total = await service.count(uid, countQuery);
  }
  return { data, meta: { pagination: metadata } };
}

module.exports = { normalizeArticlePagination, findPublicArticles };
