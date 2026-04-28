"use strict";

module.exports = {
  routes: [
    {
      method: "GET",
      path: "/daily-question",
      handler: "daily-question.publicFind",
      config: {
        auth: false
      }
    },
    {
      method: "POST",
      path: "/daily-question/vote",
      handler: "daily-question.vote",
      config: {
        auth: false
      }
    }
  ]
};
