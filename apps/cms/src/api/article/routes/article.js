"use strict";

module.exports = {
  routes: [
    {
      method: "GET",
      path: "/articles",
      handler: "article.publicFind",
      config: {
        auth: false
      }
    },
    {
      method: "GET",
      path: "/articles/:id",
      handler: "article.publicFindOne",
      config: {
        auth: false
      }
    },
    {
      method: "POST",
      path: "/articles/:id/view",
      handler: "article.trackView",
      config: {
        auth: false
      }
    }
  ]
};
