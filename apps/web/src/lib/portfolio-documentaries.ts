import type { TeamRelatedDocumentary } from "@/lib/about";
import type { DocumentaryItem } from "@/lib/documentaries";

export function getCanonicalPortfolioDocumentaries(relations: TeamRelatedDocumentary[], archive: DocumentaryItem[]) {
  const byId = new Map(archive.map((item) => [String(item.id), item]));
  const bySlug = new Map(archive.map((item) => [item.slug, item]));
  const unique = new Map<string, TeamRelatedDocumentary & { embedUrl?: string | null }>();
  for (const relation of relations) {
    const source = byId.get(String(relation.id)) || bySlug.get(relation.slug);
    if (source?.isActive === false) continue;
    const key = source ? String(source.id) : String(relation.id || relation.slug);
    if (unique.has(key)) continue;
    unique.set(key, {
      ...relation,
      externalUrl: relation.externalUrl || source?.externalUrl || undefined,
      youtubeUrl: relation.youtubeUrl || source?.youtubeUrl,
      thumbnailUrl: relation.thumbnailUrl || source?.thumbnailUrl || undefined,
      date: relation.date || source?.date,
      location: relation.location || source?.location,
      director: relation.director || source?.director,
      duration: relation.duration || source?.duration,
      embedUrl: source?.embedUrl,
    });
  }
  // Free-text directors and titles never establish authorship. A confirmed CMS
  // relation remains available even when the public archive has no matching row.
  return Array.from(unique.values());
}
