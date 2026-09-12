import matter from "gray-matter";
import { validSlug } from "../validation";
interface ParsedChapter {
  slug: string;
  title: string;
  chapterNumber: number;
  sagaSlug: string;
  content: string;
}
export function parseChapterFile(
  rawFile: string,
  fallbackTitle: string,
): ParsedChapter {
  const input = rawFile.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
  // gray-matter also supports executable JavaScript frontmatter. Only plain YAML is accepted.
  if (!/^---[ \t]*\n/.test(input))
    throw new Error(
      "Plik musi zaczynać się nagłówkiem YAML pomiędzy liniami --- .",
    );
  const { data, content } = matter(input);
  const title = data.title ?? fallbackTitle;
  if (typeof title !== "string" || !title.trim() || title.length > 200)
    throw new Error("Tytuł musi być tekstem (do 200 znaków).");
  if (
    (typeof data.chapterNumber !== "number" &&
      typeof data.chapterNumber !== "string") ||
    String(data.chapterNumber).trim() === ""
  )
    throw new Error("Podaj numer rozdziału w polu chapterNumber.");
  const chapterNumber = Number(data.chapterNumber);
  if (!Number.isSafeInteger(chapterNumber) || chapterNumber < 0)
    throw new Error("Numer rozdziału musi być nieujemną liczbą całkowitą.");
  if (typeof data.saga !== "string" || !data.saga.trim())
    throw new Error("Pole saga musi wskazywać adres istniejącej sagi.");
  if (data.slug !== undefined && typeof data.slug !== "string")
    throw new Error("Adres rozdziału musi być tekstem.");
  if (!content.trim()) throw new Error("Rozdział nie może być pusty.");
  return {
    slug: validSlug(data.slug, title),
    title: title.trim(),
    chapterNumber,
    sagaSlug: validSlug(data.saga),
    content: content.trim(),
  };
}
