"use strict";
const { email, contribution, limitIntake, sendError } = require("../../../editorial-intake");
const CONFIG_UID = "api::contribute-page.contribute-page";
const INTAKE_UID = "api::contribution-submission.contribution-submission";

function getConfiguredRecipientEmail(config) { return email(process.env.CONTRIBUTE_RECIPIENT_EMAIL) || email(config?.submissionRecipientEmail); }
function emailReady() { return ["true", "1", "yes"].includes(String(process.env.CONTRIBUTE_SUBMISSION_READY || "").trim().toLowerCase()); }
function getEmailService(app) { try { return app.plugin("email").service("email"); } catch { return null; } }
async function storageReady(app) {
  try {
    if (!app.contentTypes?.[INTAKE_UID]) return false;
    // A real DB read confirms that schema migration and storage are available.
    await app.db.query(INTAKE_UID).count();
    return true;
  } catch { return false; }
}
async function optionalNotification(app, config, data) {
  const recipient = getConfiguredRecipientEmail(config), service = getEmailService(app);
  if (!recipient || !emailReady() || typeof service?.send !== "function") return;
  try {
    await service.send({ to: recipient, replyTo: data.email, subject: `[Avangarda] Saradnja: ${data.storyTitle}`, text: ["Nova prijava je sačuvana u privatnoj CMS kolekciji Primljena saradnja.", `Ime: ${data.fullName}`, `Email: ${data.email}`, `Naslov: ${data.storyTitle}`, `Jezik: ${data.lang}`, data.location, data.collaborationType, data.links, "", data.storySummary].filter(Boolean).join("\n") });
  } catch {
    // Delivery failure does not discard an already persisted editorial record.
    app.log.warn("[contribute-page] Optional notification failed; submission remains saved in private CMS intake.");
  }
}

module.exports = {
  async publicFind(ctx) {
    const data = await strapi.entityService.findMany(CONFIG_UID);
    // Never spread user-supplied populate/fields or server recipient settings into public output.
    const attributes = strapi.contentTypes[CONFIG_UID]?.attributes || {};
    const safeData = Object.fromEntries(Object.entries(data || {}).filter(([key]) => attributes[key] && !attributes[key].private && key !== "submissionRecipientEmail"));
    const ready = Boolean(data?.submissionEnabled && await storageReady(strapi));
    ctx.body = { data: data ? { ...safeData, id: data.id, submissionFormReady: ready } : null, meta: {} };
  },
  async publicSubmit(ctx) {
    try {
      const payload = ctx.request.body?.data;
      limitIntake(ctx, "contribute", payload);
      const config = await strapi.entityService.findMany(CONFIG_UID);
      if (!config?.submissionEnabled) { ctx.status = 403; ctx.body = { error: "SUBMISSIONS_CLOSED" }; return; }
      const data = contribution(payload);
      // Database persistence is authoritative. No positive response precedes this await.
      const saved = await strapi.entityService.create(INTAKE_UID, { data: { ...data, collaborationType: data.collaborationType || null } });
      if (!saved?.id) throw new Error("No persisted contribution");
      await optionalNotification(strapi, config, data);
      ctx.status = 201; ctx.body = { data: { received: true }, meta: {} };
    } catch (error) { sendError(ctx, error); }
  },
};
module.exports._testing = { getConfiguredRecipientEmail, emailReady, storageReady, optionalNotification };
