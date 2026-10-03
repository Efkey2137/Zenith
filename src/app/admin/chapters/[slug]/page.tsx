import { notFound } from "next/navigation";
import { getChapterForAdmin } from "@/lib/db/queries/chapters";
import { ChapterReader } from "@/components/reader/chapter-reader";
import { ChapterPublication } from "@/components/admin/chapter-publication";

export default async function AuthorChapterPreview({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const chapter = await getChapterForAdmin(slug);
  if (!chapter) notFound();
  return (
    <>
      <div className="max-w-2xl mx-auto border border-border p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Podgląd autora</p>
          <p className="text-sm text-muted-foreground mt-2">
            {chapter.published
              ? "Ten rozdział jest dostępny dla czytelników."
              : "Ten rozdział widzisz tylko Ty po zalogowaniu."}
          </p>
        </div>
        <ChapterPublication
          slug={chapter.slug}
          title={chapter.title}
          published={chapter.published}
        />
      </div>
      <ChapterReader
        key={chapter.slug}
        chapter={chapter}
        prevChapter={null}
        nextChapter={null}
        preview
      />
    </>
  );
}
