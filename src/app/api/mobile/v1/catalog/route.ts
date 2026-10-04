import { getAllChaptersGroupedBySaga } from "@/lib/db/queries/chapters";
import { getAllCharacters } from "@/lib/db/queries/characters";
import { getPage } from "@/lib/db/queries/pages";
import { pageDefinitions, type PageSlug } from "@/lib/pages";
import { mobileResponse, mobileError } from "@/lib/mobile-response";

export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const [sagas, characters, sections] = await Promise.all([
      getAllChaptersGroupedBySaga(),
      getAllCharacters(),
      Promise.all(
        (Object.keys(pageDefinitions) as PageSlug[]).map(async (slug) => ({
          slug,
          ...pageDefinitions[slug],
          content: (await getPage(slug))?.content ?? "",
        })),
      ),
    ]);
    return mobileResponse({
      version: 1,
      sagas: sagas.map((s) => ({
        slug: s.sagaSlug,
        title: s.title,
        chapters: s.chapters.map((c) => ({
          slug: c.chapterSlug,
          title: c.chapterTitle,
          number: c.chapterNumber,
        })),
      })),
      characters,
      sections,
    });
  } catch {
    return mobileError();
  }
}
