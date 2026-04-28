"use strict";

module.exports = {
  async publicFind(ctx) {
    const data = await strapi.entityService.findMany("api::homepage-config.homepage-config", {
      populate: {
        currentItems: {
          populate: ["image"]
        },
        mostReadItems: {
          populate: ["image"]
        },
        editorialCards: true
      }
    });

    ctx.body = {
      data: data || {
        currentLabel: "Sada",
        currentItems: [],
        mostReadLabel: "Najčitanije",
        mostReadItems: [],
        editorialCards: []
      },
      meta: {}
    };
  }
};
