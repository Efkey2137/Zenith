import {
  getChapterBySlug,
  getAdjacentChapters,
} from "@/lib/db/queries/chapters";
import { mobileResponse, mobileError } from "@/lib/mobile-response";
export const dynamic = "force-dynamic";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const chapter = await getChapterBySlug(slug);
    if (!chapter)
      return mobileResponse({ error: "Ten rozdział nie jest dostępny." }, 404);
    const adjacent = await getAdjacentChapters(
      chapter.sagaId,
      chapter.chapterNumber,
    );
    const summary = (c: typeof adjacent.prev) =>
      c ? { slug: c.slug, title: c.title } : null;
    return mobileResponse({
      slug: chapter.slug,
      title: chapter.title,
      number: chapter.chapterNumber,
      sagaTitle: chapter.sagaTitle,
      content: chapter.content,
      previous: summary(adjacent.prev),
      next: summary(adjacent.next),
    });
  } catch {
    return mobileError();
  }
}
