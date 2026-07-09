"use strict";

module.exports = {
  routes: [
    {
      method: "GET",
      path: "/contribute-page",
      handler: "contribute-page.publicFind",
      config: {
        auth: false,
      },
    },
    {
      method: "POST",
      path: "/contribute-page/submit",
      handler: "contribute-page.publicSubmit",
      config: {
        auth: false,
      },
    },
  ],
};
