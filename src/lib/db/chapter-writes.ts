import { eq } from "drizzle-orm";
import { getDb } from ".";
import { ensureChapterPublication } from "./chapter-publication";
import { chapters } from "./schema";

type ChapterContent = Pick<
  typeof chapters.$inferInsert,
  "slug" | "title" | "sagaId" | "chapterNumber" | "content"
>;

export async function saveChapterContent(values: ChapterContent) {
  await ensureChapterPublication();
  const { slug, ...content } = values;
  await getDb()
    .insert(chapters)
    .values({ ...values, published: false })
    .onConflictDoUpdate({
      target: chapters.slug,
      // Re-uploading changes the text, never the author's publication decision.
      set: { ...content, updatedAt: new Date().toISOString() },
    });
  return slug;
}

export async function setChapterPublication(slug: string, published: boolean) {
  await ensureChapterPublication();
  const updated = await getDb()
    .update(chapters)
    .set({ published, updatedAt: new Date().toISOString() })
    .where(eq(chapters.slug, slug))
    .returning({ id: chapters.id });
  return updated.length > 0;
}
