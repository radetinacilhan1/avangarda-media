"use strict";
const { factSubmission, limitIntake, sendError } = require("../../../editorial-intake");
module.exports = {
  async submit(ctx) {
    try {
      const payload = ctx.request.body?.data;
      limitIntake(ctx, "fact-check", payload);
      const data = factSubmission(payload);
      const saved = await strapi.entityService.create("api::fact-check-submission.fact-check-submission", { data });
      if (!saved?.id) throw new Error("No persisted submission");
      ctx.status = 201; ctx.body = { data: { received: true }, meta: {} };
    } catch (error) { sendError(ctx, error); }
  },
};
