"use strict";

module.exports = {
  routes: [
    {
      method: "GET",
      path: "/legal-resources",
      handler: "legal-resource.publicFind",
      config: {
        auth: false,
      },
    },
    {
      method: "GET",
      path: "/legal-resources/:id",
      handler: "legal-resource.publicFindOne",
      config: {
        auth: false,
      },
    },
  ],
};
