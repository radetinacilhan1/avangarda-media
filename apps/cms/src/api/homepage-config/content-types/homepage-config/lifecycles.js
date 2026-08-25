"use strict";

const { revalidateFrontend } = require("../../../../revalidate-frontend");

module.exports = {
  afterCreate(event) {
    return revalidateFrontend("api::homepage-config.homepage-config", "afterCreate", event);
  },
  afterUpdate(event) {
    return revalidateFrontend("api::homepage-config.homepage-config", "afterUpdate", event);
  },
  afterDelete(event) {
    return revalidateFrontend("api::homepage-config.homepage-config", "afterDelete", event);
  },
};
