"use strict";

const { captureRevalidationContext, revalidateFrontend } = require("../../../../revalidate-frontend");
const UID = "api::article.article";
const { validateArticleDocuments } = require("../../../../article-documents");

module.exports = {
  beforeCreate: validateArticleDocuments,
  async beforeUpdate(event) {
    await validateArticleDocuments(event);
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
