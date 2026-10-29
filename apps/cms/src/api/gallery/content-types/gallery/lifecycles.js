"use strict";

const { captureRevalidationContext } = require("../../../../revalidate-frontend");
const { revalidateGallery } = require("../../../../gallery-validation");
const UID = "api::gallery.gallery";

module.exports = {
  beforeUpdate(event) {
    return captureRevalidationContext(UID, event);
  },
  beforeDelete(event) {
    return captureRevalidationContext(UID, event);
  },
  afterCreate(event) {
    return revalidateGallery("afterCreate", event);
  },
  afterUpdate(event) {
    return revalidateGallery("afterUpdate", event);
  },
  afterDelete(event) {
    return revalidateGallery("afterDelete", event);
  },
};
