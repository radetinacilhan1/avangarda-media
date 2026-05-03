"use strict";

module.exports = {
  async publicFind(ctx) {
    const data = await strapi.entityService.findMany("api::editorial-direction.editorial-direction", {
      ...ctx.query,
      populate: {
        relatedArticles: {
          populate: ["authors", "cover"]
        }
      }
    });

    ctx.body = { data, meta: {} };
  },

  async publicFindOne(ctx) {
    const { id } = ctx.params;
    const data = await strapi.entityService.findOne("api::editorial-direction.editorial-direction", id, {
      ...ctx.query,
      populate: {
        relatedArticles: {
          populate: ["authors", "cover"]
        }
      }
    });

    ctx.body = { data, meta: {} };
  }
};
