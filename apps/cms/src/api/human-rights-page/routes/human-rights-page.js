"use strict";

module.exports = {
  routes: [
    {
      method: "GET",
      path: "/human-rights-page",
      handler: "human-rights-page.publicGet",
      config: {
        auth: false,
      },
    },
  ],
};
