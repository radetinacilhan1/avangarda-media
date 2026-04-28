"use strict";

module.exports = {
  routes: [
    {
      method: "GET",
      path: "/homepage-config",
      handler: "homepage-config.publicFind",
      config: {
        auth: false
      }
    }
  ]
};
