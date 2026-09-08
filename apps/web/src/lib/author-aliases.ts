// Verified in commit 92bf71d and the public CMS Author.publicProfile relation.
// Numeric suffixes are NOT author IDs. Add aliases only with historical evidence.
export const AUTHOR_SLUG_ALIASES: Readonly<Record<string, string>> = {
  // Local CMS authors row: name=Berina Skrijelj, slug=author-1 (2026-09-08).
  "author-1": "berina-skrijelj",
  "author-5": "emir-bihorac",
};

export function canonicalAuthorSlug(slug: string) {
  return Object.hasOwn(AUTHOR_SLUG_ALIASES, slug) ? AUTHOR_SLUG_ALIASES[slug] : slug;
}
