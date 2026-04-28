"use strict";

function buildFallback() {
  return {
    label: "PITANJE DANA",
    question: "Da li misliš da je umor politički problem?",
    answerA: "DA",
    answerB: "NE",
    votesA: 0,
    votesB: 0,
    voteRound: 1,
    isActive: true,
    ctaLabel: "Pročitaj kontekst",
    linkedArticle: null
  };
}

function calculateResults(record) {
  const votesA = Number(record?.votesA) || 0;
  const votesB = Number(record?.votesB) || 0;
  const totalVotes = votesA + votesB;

  return {
    votesA,
    votesB,
    totalVotes,
    percentA: totalVotes ? Math.round((votesA / totalVotes) * 100) : 0,
    percentB: totalVotes ? Math.round((votesB / totalVotes) * 100) : 0
  };
}

module.exports = {
  async publicFind(ctx) {
    const data = await strapi.query("api::daily-question.daily-question").findOne({
      populate: {
        linkedArticle: {
          populate: ["authors", "cover"]
        }
      }
    });

    const fallback = buildFallback();
    const source = data || fallback;

    ctx.body = {
      data: {
        ...source,
        voteRound: Number(source?.voteRound) || 1,
        ...calculateResults(source)
      },
      meta: {}
    };
  },

  async vote(ctx) {
    const { answer } = ctx.request.body || {};
    const normalizedAnswer = typeof answer === "string" ? answer.toUpperCase() : "";

    if (normalizedAnswer !== "A" && normalizedAnswer !== "B") {
      return ctx.badRequest("Answer must be A or B");
    }

    const current = await strapi.query("api::daily-question.daily-question").findOne({
      populate: {
        linkedArticle: {
          populate: ["authors", "cover"]
        }
      }
    });

    if (!current || current.isActive === false) {
      return ctx.notFound("Daily question not found");
    }

    const nextVotesA = (Number(current.votesA) || 0) + (normalizedAnswer === "A" ? 1 : 0);
    const nextVotesB = (Number(current.votesB) || 0) + (normalizedAnswer === "B" ? 1 : 0);

    const updated = await strapi.entityService.update("api::daily-question.daily-question", current.id, {
      data: {
        votesA: nextVotesA,
        votesB: nextVotesB
      },
      populate: {
        linkedArticle: {
          populate: ["authors", "cover"]
        }
      }
    });

    ctx.body = {
      data: {
        ...updated,
        voteRound: Number(updated?.voteRound) || 1,
        ...calculateResults(updated)
      },
      meta: {}
    };
  }
};
