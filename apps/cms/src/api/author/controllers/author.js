"use strict";

module.exports = {
  async publicFind(ctx) {
    const data = await strapi.entityService.findMany("api::author.author", {
      ...ctx.query
    });

    ctx.body = { data, meta: {} };
  },

  async publicFindOne(ctx) {
    const { id } = ctx.params;
    const data = await strapi.entityService.findOne("api::author.author", id, {
      ...ctx.query
    });

    ctx.body = { data, meta: {} };
  }
};
