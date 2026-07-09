import Link from 'next/link';
import { getAllChaptersGroupedBySaga } from '@/lib/db/queries/chapters';

export default async function ChaptersPage() {
  const sagasWithChapters = await getAllChaptersGroupedBySaga();

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-serif text-foreground mb-10">Rozdziały</h1>

      {sagasWithChapters.length === 0 ? (
        <p className="text-muted-foreground">Brak wgranych rozdziałów.</p>
      ) : (
        sagasWithChapters.map((saga) => (
          <section key={saga.sagaSlug} className="mb-12">
            <h2 className="text-sm uppercase tracking-widest text-muted-foreground mb-4">
              {saga.title}
            </h2>
            <ol className="space-y-1">
              {saga.chapters.map((chapter) => (
                <li key={chapter.chapterSlug}>
                  <Link
                    href={`/chapters/${chapter.chapterSlug}`}
                    className="flex items-baseline gap-4 py-3 border-b border-border/50 group"
                  >
                    <span className="text-sm text-muted-foreground tabular-nums">
                      {String(chapter.chapterNumber).padStart(2, '0')}
                    </span>
                    <span className="text-foreground group-hover:text-primary transition-colors">
                      {chapter.chapterTitle}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        ))
      )}
    </div>
  );
}