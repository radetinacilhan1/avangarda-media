"use strict";

const sanitizeQuery = (ctx) => {
  const query = { ...ctx.query };
  delete query.publicationState;

  if (typeof query.populate === "string") {
    query.populate = query.populate
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  return query;
};

module.exports = {
  async publicFind(ctx) {
    const query = sanitizeQuery(ctx);
    const data = await strapi.entityService.findMany("api::legal-resource.legal-resource", {
      ...query,
      publicationState: "live",
    });

    ctx.body = { data, meta: {} };
  },

  async publicFindOne(ctx) {
    const { id } = ctx.params;
    const query = sanitizeQuery(ctx);
    const data = await strapi.entityService.findOne("api::legal-resource.legal-resource", id, {
      ...query,
      publicationState: "live",
    });

    ctx.body = { data, meta: {} };
  },
};
