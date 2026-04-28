"use strict";

module.exports = {
  async publicFind(ctx) {
    const data = await strapi.entityService.findMany("api::editorial-signal.editorial-signal", {
      populate: {
        linkedArticle: {
          populate: ["authors", "cover"]
        }
      }
    });

    ctx.body = {
      data: data || {
        label: "UREDNIČKI SIGNAL",
        text: "Dobar magazinski sajt mora da ima stav čim se otvori.",
        author: "Avangarda",
        type: "statement",
        backgroundMode: "yellow",
        isActive: true
      },
      meta: {}
    };
  }
};
