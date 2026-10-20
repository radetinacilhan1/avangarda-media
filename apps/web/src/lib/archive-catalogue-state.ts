import type { Lang } from "@/lib/i18n";
import { normalizeSectionSlug } from "@/lib/sections";

export const ARCHIVE_FACETS = ["section", "topic", "author", "year", "style", "location"] as const;
export const ARCHIVE_PAGE_SIZE = 12;
export type ArchiveFacet = (typeof ARCHIVE_FACETS)[number];
export type ArchiveFilters = Record<ArchiveFacet | "q", string> & { sort: "newest" | "oldest" };
export type ArchiveState = ArchiveFilters & { page: number };
export type ArchiveOption = { value: string; label: string; count: number };
export type ArchiveCard = { id: string; href: string; title: string; excerpt: string; imageUrl: string; section: string; date: string; author: string; chips: string[] };
export type ArchiveResult = {
  filters: ArchiveFilters; facets: Record<ArchiveFacet, ArchiveOption[]>;
  items: ArchiveCard[]; featured: ArchiveCard[];
  active: Array<{ key: ArchiveFacet | "q"; value: string; label: string }>;
  total: number; page: number; pageCount: number; from: number; to: number; cleared: ArchiveFacet[];
};
export function readArchiveState(params: Pick<URLSearchParams, "get">): ArchiveState {
  const page = Number(params.get("page"));
  const facets = Object.fromEntries(ARCHIVE_FACETS.map((key) => [key, (params.get(key) || "").trim().slice(0, 200)])) as Record<ArchiveFacet, string>;
  facets.section = normalizeSectionSlug(facets.section);
  return { ...facets, q: (params.get("q") || "").trim().slice(0, 200), sort: params.get("sort") === "oldest" ? "oldest" : "newest", page: Number.isSafeInteger(page) && page > 0 ? Math.min(page, 1000000) : 1 };
}
export function archiveQuery(state: ArchiveState) {
  const params = new URLSearchParams();
  for (const key of ["q", ...ARCHIVE_FACETS] as const) if (state[key]) params.set(key, state[key]);
  if (state.sort === "oldest") params.set("sort", "oldest");
  if (state.page > 1) params.set("page", String(state.page));
  return params.toString();
}
export function archiveHref(lang: Lang, state: ArchiveState) {
  const query = archiveQuery(state);
  return `/${lang}/archive${query ? `?${query}` : ""}`;
}
