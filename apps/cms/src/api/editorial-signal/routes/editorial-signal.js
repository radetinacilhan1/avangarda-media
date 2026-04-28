"use strict";

module.exports = {
  routes: [
    {
      method: "GET",
      path: "/editorial-signal",
      handler: "editorial-signal.publicFind",
      config: {
        auth: false
      }
    }
  ]
};
