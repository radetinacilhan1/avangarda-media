"use strict";

module.exports = {
  routes: [
    {
      method: "GET",
      path: "/impressum",
      handler: "impressum.publicFind",
      config: {
        auth: false
      }
    }
  ]
};
