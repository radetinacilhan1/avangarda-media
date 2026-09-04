"use strict";

const { revalidateFrontend } = require("../../../../revalidate-frontend");
const UID = "api::daily-question.daily-question";

module.exports = {
  afterCreate(event) { return revalidateFrontend(UID, "afterCreate", event); },
  afterUpdate(event) {
    const fields = Object.keys(event?.params?.data || {});
    if (fields.length && fields.every((field) => ["votesA", "votesB", "updatedAt"].includes(field))) return;
    return revalidateFrontend(UID, "afterUpdate", event);
  },
  afterDelete(event) { return revalidateFrontend(UID, "afterDelete", event); },
  beforeCreate(event) {
    if (!event.params?.data) return;

    if (typeof event.params.data.voteRound !== "number" || Number.isNaN(event.params.data.voteRound)) {
      event.params.data.voteRound = 1;
    }

    if (event.params?.data?.resetVotes) {
      event.params.data.votesA = 0;
      event.params.data.votesB = 0;
      event.params.data.voteRound = (Number(event.params.data.voteRound) || 1) + 1;
      event.params.data.resetVotes = false;
    }
  },

  async beforeUpdate(event) {
    if (!event.params?.data?.resetVotes) return;

    const id = event.params?.where?.id;
    const current =
      id != null
        ? await strapi.entityService.findOne("api::daily-question.daily-question", id, {
            fields: ["voteRound"]
          })
        : null;

    event.params.data.votesA = 0;
    event.params.data.votesB = 0;
    event.params.data.voteRound = (Number(current?.voteRound) || 1) + 1;
    event.params.data.resetVotes = false;
  }
};
