"use strict";

module.exports = {
  async publicFind(ctx) {
    const data = await strapi.entityService.findMany("api::signal.signal", {
      ...ctx.query
    });

    ctx.body = { data, meta: {} };
  },

  async publicFindOne(ctx) {
    const { id } = ctx.params;
    const data = await strapi.entityService.findOne("api::signal.signal", id, {
      ...ctx.query
    });

    ctx.body = { data, meta: {} };
  }
};

