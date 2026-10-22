"use strict";
// Deliberately no generic public list/find/create/update/delete routes.
module.exports = { routes: [
  { method: "POST", path: "/fact-check-submissions/submit", handler: "fact-check-submission.submit", config: { auth: false } },
] };
