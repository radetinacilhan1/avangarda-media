"use strict";

module.exports = {
  routes: [
    {
      method: "GET",
      path: "/editorial-directions",
      handler: "editorial-direction.publicFind",
      config: {
        auth: false
      }
    },
    {
      method: "GET",
      path: "/editorial-directions/:id",
      handler: "editorial-direction.publicFindOne",
      config: {
        auth: false
      }
    }
  ]
};
