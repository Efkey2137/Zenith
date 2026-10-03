import { getDb } from "@/lib/db";
import { chapters, sagas } from "@/lib/db/schema";
import { and, asc, eq } from "drizzle-orm";
import { ensureChapterPublication } from "@/lib/db/chapter-publication";
import { requireAdmin } from "@/lib/auth";

export async function getAllChaptersGroupedBySaga() {
  return groupedChapters(true);
}

export async function getChaptersForAdmin() {
  await requireAdmin();
  return groupedChapters(false);
}

async function groupedChapters(publicOnly: boolean) {
  await ensureChapterPublication();
  const rows = await getDb()
    .select({
      sagaTitle: sagas.title,
      sagaSlug: sagas.slug,
      chapterSlug: chapters.slug,
      chapterTitle: chapters.title,
      chapterNumber: chapters.chapterNumber,
      published: chapters.published,
    })
    .from(chapters)
    .innerJoin(sagas, eq(chapters.sagaId, sagas.id))
    .where(publicOnly ? eq(chapters.published, true) : undefined)
    .orderBy(
      asc(sagas.order),
      asc(sagas.id),
      asc(chapters.chapterNumber),
      asc(chapters.id),
    );

  const grouped = new Map<string, { title: string; chapters: typeof rows }>();
  for (const row of rows) {
    if (!grouped.has(row.sagaSlug))
      grouped.set(row.sagaSlug, { title: row.sagaTitle, chapters: [] });
    grouped.get(row.sagaSlug)!.chapters.push(row);
  }
  return Array.from(grouped.entries()).map(([sagaSlug, data]) => ({
    sagaSlug,
    ...data,
  }));
}

export async function getChapterBySlug(slug: string) {
  return chapterBySlug(slug, true);
}

export async function getChapterForAdmin(slug: string) {
  await requireAdmin();
  return chapterBySlug(slug, false);
}

async function chapterBySlug(slug: string, publicOnly: boolean) {
  await ensureChapterPublication();
  const result = await getDb()
    .select({
      slug: chapters.slug,
      title: chapters.title,
      chapterNumber: chapters.chapterNumber,
      content: chapters.content,
      sagaId: chapters.sagaId,
      sagaTitle: sagas.title,
      published: chapters.published,
    })
    .from(chapters)
    .innerJoin(sagas, eq(chapters.sagaId, sagas.id))
    .where(
      and(
        eq(chapters.slug, slug),
        publicOnly ? eq(chapters.published, true) : undefined,
      ),
    )
    .limit(1);
  return result[0] ?? null;
}

export async function getAllChapterSlugs() {
  await ensureChapterPublication();
  return getDb()
    .select({ slug: chapters.slug })
    .from(chapters)
    .where(eq(chapters.published, true));
}

export async function getAdjacentChapters(
  sagaId: number,
  chapterNumber: number,
) {
  await ensureChapterPublication();
  const ordered = await getDb()
    .select({
      slug: chapters.slug,
      title: chapters.title,
      sagaId: chapters.sagaId,
      chapterNumber: chapters.chapterNumber,
    })
    .from(chapters)
    .innerJoin(sagas, eq(chapters.sagaId, sagas.id))
    .where(eq(chapters.published, true))
    .orderBy(
      asc(sagas.order),
      asc(sagas.id),
      asc(chapters.chapterNumber),
      asc(chapters.id),
    );
  const index = ordered.findIndex(
    (c) => c.sagaId === sagaId && c.chapterNumber === chapterNumber,
  );
  return {
    prev: index > 0 ? ordered[index - 1] : null,
    next: index >= 0 ? (ordered[index + 1] ?? null) : null,
  };
}
