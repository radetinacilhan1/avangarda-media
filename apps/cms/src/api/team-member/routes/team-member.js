"use strict";

module.exports = {
  routes: [
    {
      method: "GET",
      path: "/team-members",
      handler: "team-member.publicFind",
      config: {
        auth: false,
      },
    },
    {
      method: "GET",
      path: "/team-members/:id",
      handler: "team-member.publicFindOne",
      config: {
        auth: false,
      },
    },
  ],
};
