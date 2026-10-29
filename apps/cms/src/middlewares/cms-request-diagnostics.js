"use strict";
const { createCmsRequestDiagnostics } = require("../cms-request-diagnostics");
module.exports = (_config, { strapi }) => createCmsRequestDiagnostics(strapi);
