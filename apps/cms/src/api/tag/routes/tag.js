"use strict";

module.exports = {
  routes: [
    {
      method: "GET",
      path: "/tags",
      handler: "tag.publicFind",
      config: { auth: false }
    },
    {
      method: "GET",
      path: "/tags/:id",
      handler: "tag.publicFindOne",
      config: { auth: false }
    }
  ]
};
