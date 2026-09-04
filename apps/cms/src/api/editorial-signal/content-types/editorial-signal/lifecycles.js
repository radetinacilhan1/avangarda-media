"use strict";

const { revalidateFrontend } = require("../../../../revalidate-frontend");
const UID = "api::editorial-signal.editorial-signal";

module.exports = {
  afterCreate(event) { return revalidateFrontend(UID, "afterCreate", event); },
  afterUpdate(event) { return revalidateFrontend(UID, "afterUpdate", event); },
  afterDelete(event) { return revalidateFrontend(UID, "afterDelete", event); },
};
