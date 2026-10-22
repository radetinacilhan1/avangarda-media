"use strict";
const { MAX_INTAKE_JSON_BYTES } = require("../editorial-intake");
const { isIntake } = require("../editorial-body-limit");
module.exports = () => async (ctx, next) => {
  if (isIntake(ctx)) {
    const declared = Number(ctx.get("content-length"));
    if (declared > MAX_INTAKE_JSON_BYTES) { ctx.status = 413; ctx.body = { error: "SUBMISSION_TOO_LARGE" }; return; }
    if (!ctx.is("application/json")) { ctx.status = 415; ctx.body = { error: "JSON_REQUIRED" }; return; }
  }
  await next();
};
