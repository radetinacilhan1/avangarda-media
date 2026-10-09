"use strict";

const { readHeadlineSelection } = require("../../../headline-selection");

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

    const { headlineState, ...configuration } = data || {};
    const selection = await readHeadlineSelection(strapi, data, true);
    ctx.body = {
      data: { ...(data ? configuration : {
        currentLabel: "Sada",
        currentItems: [],
        mostReadLabel: "Najčitanije",
        mostReadItems: [],
        editorialCards: []
      }), ...selection },
      meta: {}
    };
  }
};
