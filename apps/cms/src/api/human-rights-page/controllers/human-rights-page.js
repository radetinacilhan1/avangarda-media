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
  async publicGet(ctx) {
    const query = sanitizeQuery(ctx);
    const data = await strapi.entityService.findMany("api::human-rights-page.human-rights-page", {
      ...query,
      publicationState: "live",
    });

    ctx.body = { data, meta: {} };
  },
};
