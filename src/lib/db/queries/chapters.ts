import { db } from '@/lib/db';
import { chapters, sagas } from '@/lib/db/schema';
import { asc, eq } from 'drizzle-orm';

export async function getAllChaptersGroupedBySaga() {
  const rows = await db
    .select({
      sagaTitle: sagas.title,
      sagaSlug: sagas.slug,
      chapterSlug: chapters.slug,
      chapterTitle: chapters.title,
      chapterNumber: chapters.chapterNumber,
    })
    .from(chapters)
    .innerJoin(sagas, eq(chapters.sagaId, sagas.id))
    .orderBy(asc(sagas.order), asc(chapters.chapterNumber));

  const grouped = new Map<string, { title: string; chapters: typeof rows }>();
  for (const row of rows) {
    if (!grouped.has(row.sagaSlug)) grouped.set(row.sagaSlug, { title: row.sagaTitle, chapters: [] });
    grouped.get(row.sagaSlug)!.chapters.push(row);
  }
  return Array.from(grouped.entries()).map(([sagaSlug, data]) => ({ sagaSlug, ...data }));
}

export async function getChapterBySlug(slug: string) {
  const result = await db
    .select({
      slug: chapters.slug,
      title: chapters.title,
      chapterNumber: chapters.chapterNumber,
      content: chapters.content,
      sagaTitle: sagas.title,
    })
    .from(chapters)
    .innerJoin(sagas, eq(chapters.sagaId, sagas.id))
    .where(eq(chapters.slug, slug))
    .limit(1);
  return result[0] ?? null;
}

export async function getAllChapterSlugs() {
  return db.select({ slug: chapters.slug }).from(chapters);
}