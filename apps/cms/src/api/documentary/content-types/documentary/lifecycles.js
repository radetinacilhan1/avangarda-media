"use strict";

const { revalidateFrontend } = require("../../../../revalidate-frontend");

module.exports = {
  afterCreate(event) {
    return revalidateFrontend("api::documentary.documentary", "afterCreate", event);
  },
  afterUpdate(event) {
    return revalidateFrontend("api::documentary.documentary", "afterUpdate", event);
  },
  afterDelete(event) {
    return revalidateFrontend("api::documentary.documentary", "afterDelete", event);
  },
};
