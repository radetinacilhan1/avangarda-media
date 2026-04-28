"use strict";

module.exports = {
  async publicCreate(ctx) {
    const payload = ctx.request.body?.data || {};
    const data = await strapi.entityService.create("api::comment.comment", {
      data: {
        ...payload,
        status: "approved"
      }
    });

    ctx.body = { data, meta: {} };
  },

  async publicFind(ctx) {
    const query = ctx.query || {};
    const data = await strapi.entityService.findMany("api::comment.comment", {
      ...query,
      filters: {
        ...(query.filters || {}),
        status: "approved"
      },
      sort: query.sort || ["createdAt:desc"]
    });

    ctx.body = { data, meta: {} };
  }
};
