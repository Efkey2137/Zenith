import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getChaptersForAdmin } from "@/lib/db/queries/chapters";
import { ChapterUpload } from "@/components/admin/chapter-upload";
import { ChapterPublication } from "@/components/admin/chapter-publication";
export default async function AdminChapters() {
  await requireAdmin();
  const sagas = await getChaptersForAdmin();
  const all = sagas.flatMap((s) => s.chapters);
  const publicCount = all.filter((c) => c.published).length;
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
      <h2 className="font-serif text-2xl mb-3">Twoje rozdziały</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Publiczne: {publicCount} · Szkice: {all.length - publicCount}. Publikuj
        rozdziały, kiedy będą gotowe. Ukrycie zachowuje treść i pozwala
        opublikować ją ponownie.
      </p>
      {!all.length && (
        <p className="empty-state">
          Wgraj pierwsze rozdziały, aby przygotować je do publikacji.
        </p>
      )}
      {sagas.map((s) => (
        <section key={s.sagaSlug} className="mb-8">
          <h3 className="eyebrow mb-3">{s.title}</h3>
          <ul>
            {s.chapters.map((c) => (
              <li
                key={c.chapterSlug}
                className="border-b border-border py-5 text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                <div className="min-w-0">
                  <Link
                    href={`/admin/chapters/${c.chapterSlug}`}
                    className="font-serif text-lg"
                  >
                    {c.chapterNumber}. {c.chapterTitle}
                  </Link>
                  <span className="block mt-1 text-xs text-muted-foreground break-all">
                    Adres: {c.chapterSlug}
                  </span>
                  <Link
                    href={`/admin/chapters/${c.chapterSlug}`}
                    className="inline-block mt-2 text-xs underline underline-offset-4"
                  >
                    Podgląd autora →
                  </Link>
                  {c.published && (
                    <Link
                      href={`/chapters/${c.chapterSlug}`}
                      className="inline-block ml-4 mt-2 text-xs text-muted-foreground underline underline-offset-4"
                    >
                      Widok publiczny →
                    </Link>
                  )}
                </div>
                <ChapterPublication
                  slug={c.chapterSlug}
                  title={c.chapterTitle}
                  published={c.published}
                />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
