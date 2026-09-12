import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getAllChaptersGroupedBySaga } from "@/lib/db/queries/chapters";
import { ChapterUpload } from "@/components/admin/chapter-upload";
export default async function AdminChapters() {
  await requireAdmin();
  const sagas = await getAllChaptersGroupedBySaga();
  return (
    <div className="max-w-3xl mx-auto">
      <p className="eyebrow">Biblioteka autora</p>
      <h1 className="font-serif text-3xl mt-4 mb-8">
        Dodaj lub zaktualizuj rozdziały
      </h1>
      <ChapterUpload />
      <details className="border border-border p-5 my-8">
        <summary className="text-sm">Jak przygotować plik rozdziału?</summary>
        <p className="text-sm text-muted-foreground mt-4">
          Najpierw dodaj sagę. Plik zaczyna się nagłówkiem YAML; po nim wpisz
          treść w Markdown. Adres sagi znajdziesz w zakładce Sagi.
        </p>
        <pre className="text-xs mt-4 overflow-x-auto">
          {
            "---\ntitle: Tytuł rozdziału\nchapterNumber: 1\nsaga: adres-sagi\nslug: adres-rozdzialu\n---\n\nTreść rozdziału…"
          }
        </pre>
        <p className="text-xs text-muted-foreground mt-4">
          Przy aktualizacji zachowaj dotychczasowy adres rozdziału, aby zachować
          linki i postęp czytelników.
        </p>
      </details>
      <h2 className="font-serif text-2xl mb-6">Opublikowane rozdziały</h2>
      {sagas.map((s) => (
        <section key={s.sagaSlug} className="mb-8">
          <h3 className="eyebrow mb-3">{s.title}</h3>
          <ul>
            {s.chapters.map((c) => (
              <li
                key={c.chapterSlug}
                className="border-b border-border py-3 text-sm"
              >
                <Link href={`/chapters/${c.chapterSlug}`}>
                  {c.chapterNumber}. {c.chapterTitle}
                </Link>
                <span className="block mt-1 text-xs text-muted-foreground break-all">
                  Adres: {c.chapterSlug}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
