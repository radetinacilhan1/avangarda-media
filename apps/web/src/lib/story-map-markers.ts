/** Shared map summaries: decoration never changes the number of distinct stories. */
export type StoryMapAuthor = {
  id: string;
  name: string;
  color: string;
  effect: "none" | "pulse" | "ring";
};

export type MapStory = {
  id: string;
  type: "article" | "documentary" | "gallery";
  authors: StoryMapAuthor[];
};

export const STORY_MAP_AUTHOR_PALETTE = [
  "#2563EB", "#B45309", "#047857", "#BE123C", "#0E7490",
  "#C2410C", "#4F46E5", "#A21CAF", "#3F6212", "#334155",
] as const;

export function getStoryMapAuthorColor(identity: string, color?: unknown) {
  if (typeof color === "string" && /^#[0-9a-f]{6}$/i.test(color.trim())) {
    return color.trim().toUpperCase();
  }
  if (identity === "ilhan-radetinac") return "#111111";
  if (identity === "berina-skrijelj") return "#7C3AED";
  let hash = 2166136261;
  for (let index = 0; index < identity.length; index += 1) {
    hash = Math.imul(hash ^ identity.charCodeAt(index), 16777619);
  }
  return STORY_MAP_AUTHOR_PALETTE[(hash >>> 0) % STORY_MAP_AUTHOR_PALETTE.length];
}

export function uniqueMapStories<T extends MapStory>(entries: readonly T[]): T[] {
  const unique = new Map<string, T>();
  for (const entry of entries) {
    const current = unique.get(entry.id);
    if (!current) {
      unique.set(entry.id, entry);
    } else {
      const authors = new Map([...current.authors, ...entry.authors].map((author) => [author.id, author]));
      unique.set(entry.id, { ...current, authors: [...authors.values()] });
    }
  }
  return [...unique.values()];
}

export function summarizeMapStories(entries: readonly MapStory[]) {
  const stories = uniqueMapStories(entries);
  const authors = new Map<string, StoryMapAuthor>();
  for (const story of stories) {
    for (const author of story.authors) authors.set(author.id, author);
  }
  return {
    totalCount: stories.length,
    articleCount: stories.filter((story) => story.type === "article").length,
    documentaryCount: stories.filter((story) => story.type === "documentary").length,
    galleryCount: stories.filter((story) => story.type === "gallery").length,
    authors: [...authors.values()].sort((left, right) => left.id.localeCompare(right.id)),
  };
}

export function getStoryMapAuthorBackground(authors: readonly StoryMapAuthor[]) {
  if (!authors.length) return "#334155";
  if (authors.length === 1) return authors[0].color;
  // Equal segments represent people, not additional stories or averaged colors.
  return `conic-gradient(${authors.map((author, index) =>
    `${author.color} ${index * 100 / authors.length}% ${(index + 1) * 100 / authors.length}%`
  ).join(", ")})`;
}

export function getStoryMapEffect(authors: readonly StoryMapAuthor[]) {
  // One coordinated effect for shared markers, regardless of the number of authors.
  if (authors.some((author) => author.effect === "ring")) return "ring";
  if (authors.some((author) => author.effect === "pulse")) return "pulse";
  return "none";
}

export function getStoryMapMarkerKind(summary: ReturnType<typeof summarizeMapStories>) {
  const count = [summary.articleCount, summary.documentaryCount, summary.galleryCount].filter(Boolean).length;
  if (count > 1) return "mixed";
  if (summary.galleryCount) return "gallery";
  if (summary.documentaryCount) return "documentary";
  return "article";
}
