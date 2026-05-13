"use strict";

module.exports = {
  routes: [
    {
      method: "GET",
      path: "/documentaries",
      handler: "documentary.publicFind",
      config: {
        auth: false,
      },
    },
    {
      method: "GET",
      path: "/documentaries/:id",
      handler: "documentary.publicFindOne",
      config: {
        auth: false,
      },
    },
  ],
};
