"use strict";
const workflow = require("../../../../fact-check-workflow");
const { revalidateFrontend } = require("../../../../revalidate-frontend");
async function afterWrite(action, event) {
  // Content Manager saves and our approval action may share an outer DB transaction.
  // Invalidate only committed content, avoiding a refetch of the preceding version.
  await strapi.db.transaction(async ({ onCommit }) => {
    onCommit(() => { Promise.resolve().then(() => revalidateFrontend(workflow.UID, action, event)).catch(() => strapi.log.warn("[fact-check] Frontend invalidation will retry on the normal cache interval.")); });
  });
}
module.exports = {
  beforeCreate: workflow.beforeCreate,
  beforeUpdate: workflow.beforeUpdate,
  beforeUpdateMany: workflow.beforeUpdateMany,
  afterCreate(event) { return afterWrite("afterCreate", event); },
  afterUpdate(event) { return afterWrite("afterUpdate", event); },
  afterDelete(event) { return afterWrite("afterDelete", event); },
};
