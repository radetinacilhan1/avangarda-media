export const PRIMARY_SECTION_SLUGS = ["front", "analysis", "interview", "column"] as const;

export type PrimarySectionSlug = (typeof PRIMARY_SECTION_SLUGS)[number];
export type HeaderSectionNavKey = "news" | "analysis" | "interview" | "column";

const sectionAliases: Record<string, PrimarySectionSlug> = {
  front: "front",
  news: "front",
  vesti: "front",
  analysis: "analysis",
  interview: "interview",
  column: "column"
};

export function normalizeSectionSlug(section?: string | null) {
  const normalized = (section || "").trim().toLowerCase();
  if (!normalized) return "";
  return sectionAliases[normalized] ?? normalized;
}

export function isPrimarySectionSlug(section?: string | null): section is PrimarySectionSlug {
  const normalized = normalizeSectionSlug(section);
  return PRIMARY_SECTION_SLUGS.includes(normalized as PrimarySectionSlug);
}

export function getSectionAliases(section?: string | null) {
  const normalized = normalizeSectionSlug(section);
  if (!normalized) return [];

  if (normalized === "front") {
    return ["front", "news", "vesti"];
  }

  return [normalized];
}

export function getSectionHref(section?: string | null) {
  const normalized = normalizeSectionSlug(section) || "front";
  return `/section/${normalized}`;
}

export function getHeaderSectionNavKey(section?: string | null): HeaderSectionNavKey | null {
  const normalized = normalizeSectionSlug(section);

  if (normalized === "front") return "news";
  if (normalized === "analysis" || normalized === "interview" || normalized === "column") {
    return normalized;
  }

  return null;
}

export function normalizeSectionRecord<T extends { section?: string | null }>(record: T): T {
  if (!record.section) return record;

  return {
    ...record,
    section: normalizeSectionSlug(record.section) as T["section"]
  };
}
