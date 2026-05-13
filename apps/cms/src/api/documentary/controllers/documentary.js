"use strict";

module.exports = {
  async publicFind(ctx) {
    const data = await strapi.entityService.findMany("api::documentary.documentary", {
      ...ctx.query,
    });

    ctx.body = {
      data,
      meta: {},
    };
  },

  async publicFindOne(ctx) {
    const { id } = ctx.params;
    const data = await strapi.entityService.findOne("api::documentary.documentary", id, {
      ...ctx.query,
    });

    ctx.body = {
      data,
      meta: {},
    };
  },
};
