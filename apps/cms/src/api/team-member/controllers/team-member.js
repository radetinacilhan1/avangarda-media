"use strict";

module.exports = {
  async publicFind(ctx) {
    const data = await strapi.entityService.findMany("api::team-member.team-member", {
      ...ctx.query,
    });

    ctx.body = {
      data,
      meta: {},
    };
  },

  async publicFindOne(ctx) {
    const { id } = ctx.params;
    const data = await strapi.entityService.findOne("api::team-member.team-member", id, {
      ...ctx.query,
    });

    ctx.body = {
      data,
      meta: {},
    };
  },
};
