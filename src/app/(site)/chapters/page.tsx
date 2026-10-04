import type { Metadata } from "next";
import { getAllChaptersGroupedBySaga } from "@/lib/db/queries/chapters";
import { ChapterCatalog } from "@/components/reader/chapter-catalog";
export const metadata: Metadata = { title: "Rozdziały" };
export default async function ChaptersPage({
  searchParams,
}: {
  searchParams: Promise<{ saga?: string | string[] }>;
}) {
  const [sagas, params] = await Promise.all([
    getAllChaptersGroupedBySaga(),
    searchParams,
  ]);
  const initialSaga = typeof params.saga === "string" ? params.saga : "";
  return (
    <div className="page-shell max-w-3xl">
      <p className="eyebrow mb-3">Biblioteka</p>
      <h1 className="page-heading">Rozdziały</h1>
      <p className="mb-9 mt-4 leading-relaxed text-muted-foreground">
        Wybierz sagę, znajdź rozdział i wejdź w opowieść.
      </p>
      <ChapterCatalog
        key={initialSaga}
        sagas={sagas}
        initialSaga={initialSaga}
      />
    </div>
  );
}
