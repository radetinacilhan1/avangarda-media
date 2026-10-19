import { NextResponse } from "next/server";
import { fetchLegalResources } from "@/lib/human-rights";
import { resolveLang } from "@/lib/i18n";
import { buildLegalCatalogue, LEGAL_FACETS, readLegalCatalogueState, type LegalFacet } from "@/lib/legal-catalogue";
import { getLegalCatalogueLabels } from "@/lib/legal-catalogue-copy";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const lang = resolveLang(params.get("lang") || undefined);
  const changed = params.get("changed") as LegalFacet;
  try {
    const resources = await fetchLegalResources(lang);
    return NextResponse.json(buildLegalCatalogue(resources, lang, readLegalCatalogueState(params), getLegalCatalogueLabels(lang),
      LEGAL_FACETS.includes(changed) ? changed : undefined), {
      // The server-side source retains its tagged cache and CMS invalidation.
      // Do not persist a stale client/API response over a newly published set.
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json({ error: "LEGAL_CATALOGUE_UNAVAILABLE" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
