"use strict";

module.exports = {
  routes: [
    {
      method: "GET",
      path: "/authors",
      handler: "author.publicFind",
      config: {
        auth: false
      }
    },
    {
      method: "GET",
      path: "/authors/:id",
      handler: "author.publicFindOne",
      config: {
        auth: false
      }
    }
  ]
};
