"use strict";

module.exports = {
  async publicFind(ctx) {
    const data = await strapi.entityService.findMany("api::about-page.about-page", {
      ...ctx.query,
    });

    ctx.body = {
      data: data || null,
      meta: {},
    };
  },
};
