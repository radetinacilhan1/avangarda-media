"use strict";

module.exports = {
  routes: [
    {
      method: "GET",
      path: "/signals",
      handler: "signal.publicFind",
      config: {
        auth: false
      }
    },
    {
      method: "GET",
      path: "/signals/:id",
      handler: "signal.publicFindOne",
      config: {
        auth: false
      }
    }
  ]
};

