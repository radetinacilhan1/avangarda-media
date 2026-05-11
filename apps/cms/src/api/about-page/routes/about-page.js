"use strict";

module.exports = {
  routes: [
    {
      method: "GET",
      path: "/about-page",
      handler: "about-page.publicFind",
      config: {
        auth: false,
      },
    },
  ],
};
