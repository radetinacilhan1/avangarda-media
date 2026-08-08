"use strict";

module.exports = {
  routes: [
    {
      method: "GET",
      path: "/locations",
      handler: "location.publicFind",
      config: { auth: false }
    },
    {
      method: "GET",
      path: "/locations/:id",
      handler: "location.publicFindOne",
      config: { auth: false }
    }
  ]
};
