"use strict";

const sanitizeQuery = (ctx) => {
  const query = { ...ctx.query };
  delete query.publicationState;

  if (typeof query.populate === "string") {
    query.populate = query.populate
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  if (!query.populate) {
    query.populate = ["authors", "cover"];
  }

  return query;
};

module.exports = {
  async publicFind(ctx) {
    const query = sanitizeQuery(ctx);
    const data = await strapi.entityService.findMany("api::article.article", {
      ...query,
      publicationState: "live"
    });

    ctx.body = { data, meta: {} };
  },

  async publicFindOne(ctx) {
    const { id } = ctx.params;
    const query = sanitizeQuery(ctx);
    const data = await strapi.entityService.findOne("api::article.article", id, {
      ...query,
      publicationState: "live"
    });

    ctx.body = { data, meta: {} };
  },

  async trackView(ctx) {
    const articleId = Number(ctx.params.id);

    if (!Number.isInteger(articleId) || articleId <= 0) {
      return ctx.badRequest("Invalid article id");
    }

    const article = await strapi.entityService.findOne("api::article.article", articleId, {
      fields: ["id", "publishedAt", "viewCount"],
      publicationState: "live"
    });

    if (!article || !article.publishedAt) {
      return ctx.notFound("Article not found");
    }

    const nextViewCount = (Number(article.viewCount) || 0) + 1;

    await strapi.entityService.update("api::article.article", articleId, {
      data: {
        viewCount: nextViewCount
      }
    });

    ctx.body = {
      data: {
        id: articleId,
        viewCount: nextViewCount
      },
      meta: {}
    };
  }
};
