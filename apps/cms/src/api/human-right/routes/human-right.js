"use strict";

module.exports = {
  routes: [
    {
      method: "GET",
      path: "/human-rights",
      handler: "human-right.publicFind",
      config: {
        auth: false,
      },
    },
    {
      method: "GET",
      path: "/human-rights/:id",
      handler: "human-right.publicFindOne",
      config: {
        auth: false,
      },
    },
  ],
};
