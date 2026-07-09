import { notFound } from 'next/navigation';
import { getChapterBySlug, getAllChapterSlugs } from '@/lib/db/queries/chapters';
import { ChapterReader } from '@/components/reader/chapter-reader';

export async function generateStaticParams() {
  const allChapters = await getAllChapterSlugs();
  return allChapters.map((chapter) => ({ slug: chapter.slug }));
}

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const chapter = await getChapterBySlug(slug);

  if (!chapter) notFound();

  return <ChapterReader chapter={chapter} />;
  
}