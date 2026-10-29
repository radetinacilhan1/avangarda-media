"use strict";

const { coalescePublicRead } = require("../../../public-read-coalescing");

module.exports = {
  async publicFind(ctx) {
    const query = { ...ctx.query };
    const data = await coalescePublicRead("api::team-member.team-member", query, () => strapi.entityService.findMany("api::team-member.team-member", query));

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
