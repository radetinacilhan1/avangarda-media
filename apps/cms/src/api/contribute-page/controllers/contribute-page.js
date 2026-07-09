"use strict";

function sanitizeText(value, maxLength, allowNewlines = false) {
  if (typeof value !== "string") return "";

  const stripped = value.replace(
    allowNewlines ? /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g : /[\u0000-\u001F\u007F]/g,
    ""
  );
  const normalized = allowNewlines
    ? stripped.replace(/\r\n?/g, "\n").replace(/[^\S\n]+/g, " ").replace(/\n{3,}/g, "\n\n")
    : stripped.replace(/\s+/g, " ");

  return normalized.trim().slice(0, maxLength);
}

function sanitizeEmail(value) {
  const email = sanitizeText(value, 160, false);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "";
}

function getConfiguredRecipientEmail(config) {
  return (
    sanitizeEmail(process.env.CONTRIBUTE_RECIPIENT_EMAIL) ||
    sanitizeEmail(config?.submissionRecipientEmail)
  );
}

function getEmailService(strapi) {
  try {
    return strapi.plugin("email").service("email");
  } catch {
    return null;
  }
}

function isSubmissionTransportReady() {
  const flag = String(process.env.CONTRIBUTE_SUBMISSION_READY || "")
    .trim()
    .toLowerCase();

  return flag === "true" || flag === "1" || flag === "yes";
}

module.exports = {
  async publicFind(ctx) {
    const data = await strapi.entityService.findMany("api::contribute-page.contribute-page", {
      ...ctx.query,
    });

    const { submissionRecipientEmail: _privateEmail, ...safeData } = data || {};
    const recipientConfigured = Boolean(getConfiguredRecipientEmail(data));
    const emailService = getEmailService(strapi);
    const transportReady = isSubmissionTransportReady();

    ctx.body = {
      data: data
        ? {
            ...safeData,
            submissionFormReady: Boolean(
              data.submissionEnabled &&
                recipientConfigured &&
                emailService &&
                typeof emailService.send === "function" &&
                transportReady
            ),
          }
        : null,
      meta: {},
    };
  },

  async publicSubmit(ctx) {
    const config = await strapi.entityService.findMany("api::contribute-page.contribute-page");

    if (!config?.submissionEnabled) {
      ctx.status = 403;
      ctx.body = { error: "SUBMISSIONS_CLOSED" };
      return;
    }

    const recipient = getConfiguredRecipientEmail(config);
    const emailService = getEmailService(strapi);
    const transportReady = isSubmissionTransportReady();

    if (!recipient || !emailService || typeof emailService.send !== "function" || !transportReady) {
      ctx.status = 503;
      ctx.body = { error: "SUBMISSION_UNAVAILABLE" };
      return;
    }

    const payload = ctx.request.body?.data || {};
    const fullName = sanitizeText(payload.fullName, 120);
    const email = sanitizeEmail(payload.email);
    const storyTitle = sanitizeText(payload.storyTitle, 180);
    const storySummary = sanitizeText(payload.storySummary, 4000, true);
    const location = sanitizeText(payload.location, 160);
    const collaborationType = sanitizeText(payload.collaborationType, 80);
    const links = sanitizeText(payload.links, 1200, true);
    const honeypot = sanitizeText(payload.website, 120);
    const acknowledged = payload.acknowledged === true;

    if (honeypot) {
      ctx.body = { data: { received: true }, meta: {} };
      return;
    }

    if (!fullName || !email || !storyTitle || storySummary.length < 24 || !acknowledged) {
      ctx.status = 400;
      ctx.body = { error: "INVALID_SUBMISSION" };
      return;
    }

    const subject = `[Avangarda] Saradnja: ${storyTitle}`;
    const lines = [
      "Nova prijava sa stranice Saradnja.",
      "",
      `Ime i prezime: ${fullName}`,
      `Email: ${email}`,
      `Naslov price: ${storyTitle}`,
      location ? `Lokacija: ${location}` : null,
      collaborationType ? `Tip saradnje: ${collaborationType}` : null,
      links ? `Linkovi:\n${links}` : null,
      "",
      "Kratak opis:",
      storySummary,
      "",
      "Potvrda:",
      "Posiljalac je oznacio da slanje price ne znaci automatsku objavu.",
    ]
      .filter(Boolean)
      .join("\n");

    try {
      await emailService.send({
        to: recipient,
        replyTo: email,
        subject,
        text: lines,
      });
    } catch (error) {
      strapi.log.error("[contribute-page] submit failed", error);
      ctx.status = 503;
      ctx.body = { error: "SUBMISSION_UNAVAILABLE" };
      return;
    }

    ctx.body = { data: { received: true }, meta: {} };
  },
};
