"use strict";

const { revalidateFrontend } = require("../../../../revalidate-frontend");
const UID = "api::human-rights-page.human-rights-page";

module.exports = {
  afterCreate(event) { return revalidateFrontend(UID, "afterCreate", event); },
  afterUpdate(event) { return revalidateFrontend(UID, "afterUpdate", event); },
  afterDelete(event) { return revalidateFrontend(UID, "afterDelete", event); },
};
