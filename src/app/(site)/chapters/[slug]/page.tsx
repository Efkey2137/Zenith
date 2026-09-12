import { notFound } from "next/navigation";
import {
  getChapterBySlug,
  getAdjacentChapters,
} from "@/lib/db/queries/chapters";
import { ChapterReader } from "@/components/reader/chapter-reader";

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const chapter = await getChapterBySlug(slug);

  if (!chapter) notFound();

  const { prev, next } = await getAdjacentChapters(
    chapter.sagaId,
    chapter.chapterNumber,
  );

  return (
    <ChapterReader
      key={chapter.slug}
      chapter={chapter}
      prevChapter={prev}
      nextChapter={next}
    />
  );
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const chapter = await getChapterBySlug(slug);
  return { title: chapter?.title ?? "Rozdział nie istnieje" };
}
