"use strict";
module.exports = { routes: [
  { method: "GET", path: "/fact-checks", handler: "fact-check.find", config: { auth: false } },
  { method: "GET", path: "/fact-checks/:slug", handler: "fact-check.findOne", config: { auth: false } },
] };
