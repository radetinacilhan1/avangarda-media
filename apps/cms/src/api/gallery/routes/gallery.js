"use strict";

module.exports = {
  routes: [
    {
      method: "GET",
      path: "/galleries",
      handler: "gallery.publicFind",
      config: {
        auth: false,
      },
    },
    {
      method: "GET",
      path: "/galleries/:id",
      handler: "gallery.publicFindOne",
      config: {
        auth: false,
      },
    },
  ],
};
