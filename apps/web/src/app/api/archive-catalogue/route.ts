import { NextResponse } from "next/server";
import { buildArchiveCatalogue } from "@/lib/archive-catalogue";
import { ARCHIVE_FACETS, readArchiveState, type ArchiveFacet } from "@/lib/archive-catalogue-state";
import { fetchArchiveArticles } from "@/lib/archive-source";
import { resolveLang } from "@/lib/i18n";

export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const lang = resolveLang(params.get("lang") || undefined);
  const state = readArchiveState(params);
  const changed = params.get("changed") as ArchiveFacet;
  try {
    const articles = await fetchArchiveArticles(lang, Boolean(state.q));
    return NextResponse.json(buildArchiveCatalogue(articles, lang, state, ARCHIVE_FACETS.includes(changed) ? changed : undefined), { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "ARCHIVE_CATALOGUE_UNAVAILABLE" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
