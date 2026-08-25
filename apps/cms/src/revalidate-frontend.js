"use strict";

const REVALIDATION_TIMEOUT_MS = 5000;

function uniqueSlugs(values) {
  return Array.from(new Set(values.filter((value) => typeof value === "string" && value.trim()).map((value) => value.trim())));
}

async function getRevalidationContext(uid, id) {
  if (!id) return {};

  if (uid === "api::article.article") {
    const article = await strapi.entityService.findOne(uid, id, {
      fields: ["slug", "publishedAt"],
      populate: {
        authors: {
          fields: ["slug"],
          populate: { publicProfile: { fields: ["slug"] } },
        },
      },
    });
    const authors = Array.isArray(article?.authors) ? article.authors : [];

    return {
      slug: article?.slug,
      authorSlugs: uniqueSlugs(authors.map((author) => author?.slug)),
      profileSlugs: uniqueSlugs(authors.map((author) => author?.publicProfile?.slug)),
      published: Boolean(article?.publishedAt),
    };
  }

  if (uid === "api::author.author") {
    const author = await strapi.entityService.findOne(uid, id, {
      fields: ["slug"],
      populate: { publicProfile: { fields: ["slug"] } },
    });
    return {
      authorSlugs: uniqueSlugs([author?.slug]),
      profileSlugs: uniqueSlugs([author?.publicProfile?.slug]),
    };
  }

  if (uid === "api::team-member.team-member") {
    const member = await strapi.entityService.findOne(uid, id, { fields: ["slug"] });
    return { profileSlugs: uniqueSlugs([member?.slug]) };
  }

  if ([
    "api::gallery.gallery",
    "api::tag.tag",
    "api::topic.topic",
    "api::location.location",
  ].includes(uid)) {
    const entry = await strapi.entityService.findOne(uid, id, { fields: ["slug"] });
    return { slug: entry?.slug };
  }

  return {};
}

function mergeContexts(...contexts) {
  const values = contexts.filter(Boolean);
  return {
    slug: values.map((context) => context.slug).find(Boolean),
    authorSlugs: uniqueSlugs(values.flatMap((context) => context.authorSlugs || [])),
    profileSlugs: uniqueSlugs(values.flatMap((context) => context.profileSlugs || [])),
    published: values.some((context) => context.published === true),
  };
}

async function captureRevalidationContext(uid, event) {
  try {
    event.state = event.state || {};
    event.state.avangardaRevalidationContext = await getRevalidationContext(uid, event?.params?.where?.id);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown context error";
    strapi.log.warn(`[revalidate] Could not capture previous ${uid} context: ${message}`);
  }
}

async function revalidateFrontend(uid, action, event) {
  const endpoint = (process.env.FRONTEND_REVALIDATE_URL || process.env.CMS_REVALIDATE_URL || "").trim();
  const secret = (process.env.CMS_REVALIDATE_SECRET || "").trim();
  if (!endpoint || !secret) return;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REVALIDATION_TIMEOUT_MS);

  try {
    const previousContext = event?.state?.avangardaRevalidationContext;
    const currentContext = await getRevalidationContext(uid, event?.result?.id || event?.params?.where?.id);
    const resultFallback = {
      slug: event?.result?.slug,
      authorSlugs: uniqueSlugs([event?.result?.slug].filter(() => uid === "api::author.author")),
      profileSlugs: uniqueSlugs([event?.result?.slug].filter(() => uid === "api::team-member.team-member")),
      published: Boolean(event?.result?.publishedAt),
    };
    const context = mergeContexts(previousContext, currentContext, resultFallback);
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-cms-revalidate-secret": secret,
      },
      body: JSON.stringify({
        uid,
        event: action,
        changedFields: Object.keys(event?.params?.data || {}),
        ...context,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      strapi.log.warn(`[revalidate] Frontend returned HTTP ${response.status} for ${uid}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown revalidation error";
    strapi.log.warn(`[revalidate] Could not invalidate ${uid}: ${message}`);
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = { captureRevalidationContext, revalidateFrontend };
