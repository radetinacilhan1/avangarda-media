"use strict";

module.exports = {
  async publicFind(ctx) {
    const data = await strapi.entityService.findMany("api::topic.topic", {
      ...ctx.query
    });

    ctx.body = { data, meta: {} };
  },

  async publicFindOne(ctx) {
    const { id } = ctx.params;
    const data = await strapi.entityService.findOne("api::topic.topic", id, {
      ...ctx.query
    });

    ctx.body = { data, meta: {} };
  }
};
