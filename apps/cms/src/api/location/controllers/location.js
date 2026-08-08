"use strict";

module.exports = {
  async publicFind(ctx) {
    const data = await strapi.entityService.findMany("api::location.location", {
      ...ctx.query
    });

    ctx.body = { data, meta: {} };
  },

  async publicFindOne(ctx) {
    const data = await strapi.entityService.findOne("api::location.location", ctx.params.id, {
      ...ctx.query
    });

    ctx.body = { data, meta: {} };
  }
};
