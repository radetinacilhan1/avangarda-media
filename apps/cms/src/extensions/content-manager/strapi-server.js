"use strict";

const { ARTICLE_UID, CONFIG_UID, normalizeState, readHeadlineSelection, applySavedPlacement, withSelectionTransaction } = require("../../headline-selection");

// The installed v4 Content Manager bulk methods use updateMany directly.
// Extend the service through Strapi's supported server extension, retaining
// native controllers, their RBAC checks, validation and publish events.
module.exports = (plugin) => {
  // Preserve the native publication controller while returning an explicit
  // conflict response when a saved preview has an obsolete selection revision.
  for (const action of ["publish", "publishMany", "unpublish", "unpublishMany"]) {
    const original = plugin.controllers["collection-types"][action];
    plugin.controllers["collection-types"][action] = async function (ctx) {
      try { return await original.call(this, ctx); }
      catch (error) {
        if (error.status !== 409) throw error;
        ctx.status = 409;
        ctx.body = { error: { status: 409, name: "ConflictError", message: error.message } };
      }
    };
  }
  const createManager = plugin.services["entity-manager"];
  plugin.services["entity-manager"] = (context) => {
    const manager = createManager(context);
    return {
      ...manager,
      async publishMany(entities, uid) {
        if (uid !== ARTICLE_UID) return manager.publishMany.call(this, entities, uid);
        return withSelectionTransaction(context.strapi, async () => {
          let count = 0;
          for (const entity of entities) if (!entity.publishedAt) { await this.publish(entity, uid); count += 1; }
          return { count };
        });
      },
      async unpublishMany(entities, uid) {
        if (uid !== ARTICLE_UID) return manager.unpublishMany.call(this, entities, uid);
        return withSelectionTransaction(context.strapi, async () => {
          let count = 0;
          for (const entity of entities) if (entity.publishedAt) { await this.unpublish(entity, uid); count += 1; }
          return { count };
        });
      },
    };
  };

  const checker = (ctx) => strapi.plugin("content-manager").service("permission-checker").create({ userAbility: ctx.state.userAbility, model: ARTICLE_UID });
  plugin.controllers["headline-selection"] = {
    async state(ctx) {
      if (checker(ctx).cannot.read(null, "title")) return ctx.forbidden();
      const data = await readHeadlineSelection(strapi);
      const configuration = await strapi.db.query(CONFIG_UID).findOne();
      const appliedOperationIds = normalizeState(configuration?.headlineState).operations.map((operation) => operation.operationId);
      // These titles are already public; no draft or restricted field projection.
      ctx.body = { data: { ...data.headlineSelection, appliedOperationIds, articles: data.headlineArticles.map(({ id, title, slug }) => ({ id, title, slug })) } };
    },
    async apply(ctx) {
      const permission = checker(ctx);
      if (permission.cannot.publish() || permission.cannot.read()) return ctx.forbidden();
      const id = Number(ctx.params.id);
      if (!Number.isSafeInteger(id) || id <= 0) return ctx.badRequest("Neispravan članak.");
      const entity = await strapi.entityService.findOne(ARTICLE_UID, id);
      if (!entity) return ctx.notFound();
      if (permission.cannot.publish(entity) || permission.cannot.read(entity)) return ctx.forbidden();
      try {
        const data = await applySavedPlacement(strapi, id, ctx.request.body?.operationId);
        ctx.body = { data: { ...data.headlineSelection, articles: data.headlineArticles.map(({ id: articleId, title, slug }) => ({ id: articleId, title, slug })) } };
      } catch (error) {
        if (error.status === 409) { ctx.status = 409; ctx.body = { error: { status: 409, name: "ConflictError", message: error.message } }; return; }
        throw error;
      }
    },
  };
  plugin.routes.admin.routes.push(
    { method: "GET", path: "/headline-selection/state", handler: "headline-selection.state", config: { policies: ["admin::isAuthenticatedAdmin"] } },
    { method: "POST", path: "/headline-selection/apply/:id", handler: "headline-selection.apply", config: { policies: ["admin::isAuthenticatedAdmin"] } },
  );
  return plugin;
};
