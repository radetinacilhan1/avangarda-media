"use strict";
const workflow = require("./fact-check-workflow");
const { screenshot } = require("./editorial-intake");
const SUBMISSION_UID = "api::fact-check-submission.fact-check-submission";

function installEditorialAdminRoutes(plugin) {
  const checker = (ctx, model) => strapi.plugin("content-manager").service("permission-checker").create({ userAbility: ctx.state.userAbility, model });
  const idFrom = (ctx) => { const id = Number(ctx.params.id); return Number.isSafeInteger(id) && id > 0 ? id : null; };
  plugin.controllers["fact-check-review"] = {
    async state(ctx) {
      if (!ctx.state.user?.id || !idFrom(ctx)) return ctx.forbidden();
      const permission = checker(ctx, workflow.UID);
      if (permission.cannot.read()) return ctx.forbidden();
      const record = await workflow.read(strapi, idFrom(ctx));
      if (!record) return ctx.notFound();
      if (permission.cannot.read(record)) return ctx.forbidden();
      ctx.body = { data: { fingerprint: workflow.fingerprint(record), approved: workflow.isApproved(record), approvedBy: record.approvedBy || null, approvedAt: record.approvedAt || null } };
    },
    async approve(ctx) {
      if (!ctx.state.user?.id || !idFrom(ctx)) return ctx.forbidden();
      const permission = checker(ctx, workflow.UID);
      if (permission.cannot.read() || permission.cannot.publish()) return ctx.forbidden();
      const record = await workflow.read(strapi, idFrom(ctx));
      if (!record) return ctx.notFound();
      if (permission.cannot.read(record) || permission.cannot.publish(record)) return ctx.forbidden();
      if (ctx.request.body?.confirmed !== true) return ctx.badRequest("Potvrdi da si pročitao/la tvrdnju, dokaze i ocenu sačuvane verzije.");
      try { ctx.body = { data: await workflow.approve(strapi, record.id, ctx.state.user, ctx.request.body?.fingerprint) }; }
      catch (error) { if (error.status !== 409) throw error; ctx.status = 409; ctx.body = { error: { status: 409, name: "ConflictError", message: error.message } }; }
    },
    async attachment(ctx) {
      if (!ctx.state.user?.id || !idFrom(ctx)) return ctx.forbidden();
      const permission = checker(ctx, SUBMISSION_UID);
      if (permission.cannot.read()) return ctx.forbidden();
      const record = await strapi.entityService.findOne(SUBMISSION_UID, idFrom(ctx));
      if (!record) return ctx.notFound();
      if (permission.cannot.read(record) || permission.cannot.read(record, "screenshot")) return ctx.forbidden();
      if (!record.screenshot) return ctx.notFound();
      const file = screenshot(record.screenshot);
      ctx.set("Cache-Control", "private, no-store");
      ctx.set("X-Content-Type-Options", "nosniff");
      if (ctx.query.download !== "1") { ctx.body = { data: { name: file.name, mimeType: file.mimeType, bytes: file.bytes } }; return; }
      ctx.set("Content-Type", file.mimeType);
      ctx.set("Content-Disposition", `attachment; filename="${file.name}"`);
      ctx.set("Content-Security-Policy", "default-src 'none'; sandbox");
      ctx.body = Buffer.from(file.base64, "base64");
    },
  };
  const config = { policies: ["admin::isAuthenticatedAdmin"] };
  plugin.routes.admin.routes.push(
    { method: "GET", path: "/fact-check-review/:id", handler: "fact-check-review.state", config },
    { method: "POST", path: "/fact-check-review/:id/approve", handler: "fact-check-review.approve", config },
    { method: "GET", path: "/fact-check-submissions/:id/attachment", handler: "fact-check-review.attachment", config },
  );
}
module.exports = { installEditorialAdminRoutes };
