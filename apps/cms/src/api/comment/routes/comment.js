"use strict";

module.exports = {
  routes: [
    {
      method: "POST",
      path: "/comments",
      handler: "comment.publicCreate",
      config: {
        auth: false
      }
    },
    {
      method: "GET",
      path: "/comments",
      handler: "comment.publicFind",
      config: {
        auth: false
      }
    }
  ]
};
