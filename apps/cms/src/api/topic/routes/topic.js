"use strict";

module.exports = {
  routes: [
    {
      method: "GET",
      path: "/topics",
      handler: "topic.publicFind",
      config: {
        auth: false
      }
    },
    {
      method: "GET",
      path: "/topics/:id",
      handler: "topic.publicFindOne",
      config: {
        auth: false
      }
    }
  ]
};
