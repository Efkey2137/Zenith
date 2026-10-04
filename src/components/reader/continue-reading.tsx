"use client";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { useSyncExternalStore } from "react";
import { readStored, subscribeReading } from "@/lib/reading";
import { BookCover } from "@/components/site/book-mark";
import { ReadingProgressBadge } from "./reading-progress-badge";
interface ReadingChapter {
  slug: string;
  title: string;
  sagaTitle?: string;
  number?: number;
}
export function ContinueReading({
  chapters,
  featured = false,
}: {
  chapters: ReadingChapter[];
  featured?: boolean;
}) {
  const slug = useSyncExternalStore(
    subscribeReading,
    () => readStored("zenith:last-chapter"),
    () => null,
  );
  const saved = chapters.find((c) => c.slug === slug);
  const chapter = saved ?? (featured ? chapters[0] : undefined);
  if (!chapter)
    return featured ? (
      <div className="empty-state">
        Twoja biblioteka czeka na pierwsze opublikowane rozdziały.
        <Link href="/chapters" className="secondary-button mt-5">
          Przejdź do biblioteki
        </Link>
      </div>
    ) : null;
  return (
    <aside
      className={
        featured
          ? "rounded-3xl border border-border bg-card p-6 sm:p-8"
          : "mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5"
      }
      aria-label={saved ? "Twoja ostatnia lektura" : "Początek opowieści"}
    >
      <div className={featured ? "flex items-center gap-5 sm:gap-6" : ""}>
        {featured && <BookCover />}
        <div className="min-w-0">
          <p className="eyebrow mb-2">
            {saved ? "Twoja ostatnia lektura" : "Początek opowieści"}
          </p>
          <h2 className="font-serif text-2xl leading-snug">{chapter.title}</h2>
          {chapter.sagaTitle && (
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {chapter.sagaTitle} · Rozdział {chapter.number}
            </p>
          )}
          {saved && (
            <div className="mt-3">
              <ReadingProgressBadge slug={chapter.slug} />
            </div>
          )}
        </div>
      </div>
      <Link
        href={`/chapters/${chapter.slug}`}
        className={featured ? "primary-button mt-7 w-full" : "secondary-button"}
      >
        <BookOpen size={18} aria-hidden="true" />
        {saved ? "Czytaj dalej" : "Zacznij czytać"}
        <ArrowRight size={17} aria-hidden="true" />
      </Link>
      {featured && (
        <p className="mt-4 text-center text-xs leading-relaxed text-muted-foreground">
          Twoje miejsce w lekturze zapisuje się w tej przeglądarce.
        </p>
      )}
    </aside>
  );
}
