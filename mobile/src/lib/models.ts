export type ChapterSummary = { slug: string; title: string; number: number };
export type Saga = { slug: string; title: string; chapters: ChapterSummary[] };
export type CharacterSummary = {
  slug: string;
  name: string;
  fraction: string | null;
  imageUrl: string | null;
};
export type Character = CharacterSummary & { bio: string };
export type Section = {
  slug: string;
  title: string;
  eyebrow: string;
  description: string;
  empty: string;
  content: string;
};
export type Catalog = {
  version: 1;
  sagas: Saga[];
  characters: CharacterSummary[];
  sections: Section[];
};
export type Chapter = ChapterSummary & {
  content: string;
  sagaTitle: string;
  previous: Pick<ChapterSummary, "slug" | "title"> | null;
  next: Pick<ChapterSummary, "slug" | "title"> | null;
};
export type ReaderSettings = { size: number; leading: number; paper: boolean };
export type Reading = {
  lastSlug: string | null;
  progress: Record<string, number>;
  bookmarks: Record<string, number>;
  settings: ReaderSettings;
};
export const defaultReading: Reading = {
  lastSlug: null,
  progress: {},
  bookmarks: {},
  settings: { size: 19, leading: 1.9, paper: false },
};

export function normalize(value: string) {
  return value
    .toLocaleLowerCase("pl")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ł/g, "l")
    .trim();
}
export function ratio(value: unknown) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.min(1, Math.max(0, value))
    : 0;
}
export function parseReading(raw: string | null): Reading {
  try {
    const data = JSON.parse(raw ?? "{}");
    const progress = (values: unknown): Record<string, number> => {
      if (!values || typeof values !== "object" || Array.isArray(values))
        return {};
      return Object.fromEntries(
        Object.entries(values)
          .filter(([, v]) => typeof v === "number" && Number.isFinite(v))
          .map(([k, v]) => [k, ratio(v)]),
      );
    };
    return {
      lastSlug: typeof data.lastSlug === "string" ? data.lastSlug : null,
      progress: progress(data.progress),
      bookmarks: progress(data.bookmarks),
      settings: {
        size: [17, 19, 21, 23, 25].includes(data.settings?.size)
          ? data.settings.size
          : 19,
        leading: [1.6, 1.9, 2.2].includes(data.settings?.leading)
          ? data.settings.leading
          : 1.9,
        paper: data.settings?.paper === true,
      },
    };
  } catch {
    return defaultReading;
  }
}

export function isCatalog(value: unknown): value is Catalog {
  if (!value || typeof value !== "object") return false;
  const v = value as Catalog;
  return (
    v.version === 1 &&
    Array.isArray(v.sagas) &&
    v.sagas.every(
      (s) =>
        s &&
        typeof s.slug === "string" &&
        typeof s.title === "string" &&
        Array.isArray(s.chapters) &&
        s.chapters.every(
          (c) =>
            c &&
            typeof c.slug === "string" &&
            typeof c.title === "string" &&
            Number.isSafeInteger(c.number),
        ),
    ) &&
    Array.isArray(v.characters) &&
    v.characters.every(
      (c) =>
        c &&
        typeof c.slug === "string" &&
        typeof c.name === "string" &&
        (c.fraction === null || typeof c.fraction === "string") &&
        (c.imageUrl === null || typeof c.imageUrl === "string"),
    ) &&
    Array.isArray(v.sections) &&
    v.sections.every(
      (s) =>
        s &&
        ["slug", "title", "eyebrow", "description", "empty", "content"].every(
          (k) => typeof s[k as keyof Section] === "string",
        ),
    )
  );
}
