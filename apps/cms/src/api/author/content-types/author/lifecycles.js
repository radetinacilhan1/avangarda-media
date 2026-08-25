"use strict";

const { captureRevalidationContext, revalidateFrontend } = require("../../../../revalidate-frontend");
const UID = "api::author.author";

module.exports = {
  beforeUpdate(event) {
    return captureRevalidationContext(UID, event);
  },
  beforeDelete(event) {
    return captureRevalidationContext(UID, event);
  },
  afterCreate(event) {
    return revalidateFrontend(UID, "afterCreate", event);
  },
  afterUpdate(event) {
    return revalidateFrontend(UID, "afterUpdate", event);
  },
  afterDelete(event) {
    return revalidateFrontend(UID, "afterDelete", event);
  },
};
