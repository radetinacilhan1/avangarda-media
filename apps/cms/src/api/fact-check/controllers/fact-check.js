"use strict";
const { UID, POPULATE, publicRecord } = require("../../../fact-check-workflow");

module.exports = {
  async find(ctx) {
    const page = Math.max(1, Math.min(1000, Number.parseInt(ctx.query.pagination?.page || "1", 10) || 1));
    const pageSize = Math.max(1, Math.min(50, Number.parseInt(ctx.query.pagination?.pageSize || "20", 10) || 20));
    const slug = typeof ctx.query.filters?.slug?.$eq === "string" ? ctx.query.filters.slug.$eq : undefined;
    // Ignore caller fields/populate/publicationState: no public projection can expose drafts or the private review queue.
    const records = await strapi.entityService.findMany(UID, { filters: { publishedAt: { $notNull: true }, reviewStatus: "approved", ...(slug ? { slug } : {}) }, publicationState: "live", populate: POPULATE, sort: ["checkedAt:desc", "id:desc"], limit: 1000 });
    const safe = records.map(publicRecord).filter(Boolean);
    ctx.body = { data: safe.slice((page - 1) * pageSize, page * pageSize), meta: { pagination: { page, pageSize, pageCount: Math.ceil(safe.length / pageSize), total: safe.length } } };
  },
  async findOne(ctx) {
    const records = await strapi.entityService.findMany(UID, { filters: { slug: ctx.params.slug, publishedAt: { $notNull: true }, reviewStatus: "approved" }, publicationState: "live", populate: POPULATE, limit: 1 });
    const record = publicRecord(records[0]);
    if (!record) return ctx.notFound();
    ctx.body = { data: record, meta: {} };
  },
};
