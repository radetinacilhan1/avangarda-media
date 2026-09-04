import { timingSafeEqual } from "node:crypto";

import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

import { languages, withLangPrefix } from "@/lib/i18n";
import { isStrapiAvailable } from "@/lib/strapi";

type RevalidationPayload = {
  uid?: string;
  event?: string;
  slug?: string;
  authorSlugs?: unknown;
  profileSlugs?: unknown;
  changedFields?: unknown;
};

const RESOURCE_TAGS: Record<string, string[]> = {
  "api::about-page.about-page": ["about-page"],
  "api::contribute-page.contribute-page": ["contribute-page"],
  "api::daily-question.daily-question": ["daily-question"],
  "api::editorial-direction.editorial-direction": ["editorial-directions", "articles"],
  "api::editorial-signal.editorial-signal": ["editorial-signal"],
  "api::human-right.human-right": ["human-rights"],
  "api::human-rights-page.human-rights-page": ["human-rights-page"],
  "api::impressum.impressum": ["impressum"],
  "api::legal-resource.legal-resource": ["legal-resources"],
  "api::signal.signal": ["signals"],
  "api::comment.comment": ["comments"],
  "api::article.article": ["articles"],
  "api::author.author": ["authors", "articles"],
  "api::team-member.team-member": ["team-members", "articles"],
  "api::homepage-config.homepage-config": ["homepage-config"],
  "api::gallery.gallery": ["galleries", "articles"],
  "api::documentary.documentary": ["documentaries", "team-members"],
  "api::tag.tag": ["tags", "articles"],
  "api::topic.topic": ["topics", "articles"],
  "api::location.location": ["locations", "articles"],
};

function secretsMatch(received: string, expected: string) {
  const receivedBuffer = Buffer.from(received);
  const expectedBuffer = Buffer.from(expected);
  return receivedBuffer.length === expectedBuffer.length && timingSafeEqual(receivedBuffer, expectedBuffer);
}

function normalizeSlugList(value: unknown) {
  if (!Array.isArray(value)) return [];
  return Array.from(new Set(value.flatMap((entry) => {
    if (typeof entry !== "string") return [];
    const slug = entry.trim();
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(slug) ? [slug] : [];
  })));
}

function normalizeSlug(value: unknown) {
  if (typeof value !== "string") return "";
  const slug = value.trim();
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(slug) ? slug : "";
}

export async function POST(request: Request) {
  const expectedSecret = process.env.CMS_REVALIDATE_SECRET?.trim() || "";
  const receivedSecret = request.headers.get("x-cms-revalidate-secret") || "";

  if (!expectedSecret) {
    return NextResponse.json({ ok: false, error: "Revalidation is not configured" }, { status: 503 });
  }

  if (!receivedSecret || !secretsMatch(receivedSecret, expectedSecret)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json().catch(() => null) as RevalidationPayload | null;
  const uid = payload?.uid || "";
  const resources = RESOURCE_TAGS[uid];

  if (!resources) {
    return NextResponse.json({ ok: false, error: "Unsupported content type" }, { status: 400 });
  }

  const changedFields = Array.isArray(payload?.changedFields) ? payload.changedFields : [];
  if (uid === "api::article.article" && payload?.event === "afterUpdate"
    && changedFields.includes("viewCount")
    && changedFields.every((field) => ["viewCount", "updatedAt"].includes(field))) {
    return NextResponse.json({ ok: true, skipped: "view-count-only" });
  }

  // Next 14 on-demand invalidation is destructive, unlike timed SWR. Never
  // discard a known-good cache while the origin is already unavailable.
  if (!await isStrapiAvailable()) {
    return NextResponse.json({ ok: false, deferred: true, error: "CMS unavailable; existing cache retained" }, { status: 503 });
  }
  resources.forEach((resource) => revalidateTag(`avangarda-cms:${resource}`));

  const slug = normalizeSlug(payload?.slug);
  const authorSlugs = normalizeSlugList(payload?.authorSlugs);
  const profileSlugs = normalizeSlugList(payload?.profileSlugs);
  const paths = new Set<string>(["/", "/archive"]);

  if (uid === "api::article.article") {
    if (slug) paths.add(`/a/${slug}`);
    paths.add("/search");
    paths.add("/sitemap.xml");
  }

  if (uid === "api::homepage-config.homepage-config") paths.add("/");
  if (uid === "api::gallery.gallery") paths.add("/galerije");
  if (uid === "api::documentary.documentary") paths.add("/dokumentarci");
  if (["api::tag.tag", "api::topic.topic", "api::location.location"].includes(uid)) {
    paths.add("/search");
  }
  if (uid === "api::topic.topic" && slug) paths.add(`/topic/${slug}`);

  authorSlugs.forEach((authorSlug) => paths.add(`/author/${authorSlug}`));
  profileSlugs.forEach((profileSlug) => paths.add(`/people/${profileSlug}`));
  const localizedPaths = new Set(
    Array.from(paths).flatMap((path) => [
      path,
      ...(path.endsWith(".xml") ? [] : languages.map(({ code }) => withLangPrefix(path, code))),
    ])
  );
  localizedPaths.forEach((path) => revalidatePath(path));

  return NextResponse.json({
    ok: true,
    event: payload?.event || "unknown",
    tags: resources,
    paths: Array.from(localizedPaths),
  });
}
