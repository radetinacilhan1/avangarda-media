"use strict";

module.exports = {
  async publicFind(ctx) {
    const data = await strapi.entityService.findMany("api::tag.tag", {
      ...ctx.query
    });

    ctx.body = { data, meta: {} };
  },

  async publicFindOne(ctx) {
    const data = await strapi.entityService.findOne("api::tag.tag", ctx.params.id, {
      ...ctx.query
    });

    ctx.body = { data, meta: {} };
  }
};
