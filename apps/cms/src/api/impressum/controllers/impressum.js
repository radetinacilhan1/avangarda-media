"use strict";

module.exports = {
  async publicFind(ctx) {
    const data = await strapi.entityService.findMany("api::impressum.impressum", {
      populate: {
        socialLinks: true
      }
    });

    ctx.body = {
      data: data || null,
      meta: {}
    };
  }
};
