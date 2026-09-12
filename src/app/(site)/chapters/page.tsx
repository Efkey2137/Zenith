import type { Metadata } from "next";
import { getAllChaptersGroupedBySaga } from "@/lib/db/queries/chapters";
import { ChapterCatalog } from "@/components/reader/chapter-catalog";
export const metadata: Metadata = { title: "Rozdziały" };
export default async function ChaptersPage() {
  const sagas = await getAllChaptersGroupedBySaga();
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <p className="eyebrow">Biblioteka</p>
      <h1 className="font-serif text-4xl mt-4">Rozdziały</h1>
      <p className="mt-4 mb-10 text-muted-foreground">
        Wybierz sagę, znajdź rozdział i wejdź w opowieść.
      </p>
      <ChapterCatalog sagas={sagas} />
    </div>
  );
}
