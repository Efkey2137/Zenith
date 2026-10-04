"use client";
import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Search } from "lucide-react";
import { normalizeSearch } from "@/lib/validation";
import { FilterPills } from "@/components/site/filter-pills";
import { ReadingProgressBadge } from "./reading-progress-badge";
import { ContinueReading } from "./continue-reading";
interface Saga {
  sagaSlug: string;
  title: string;
  chapters: {
    chapterSlug: string;
    chapterTitle: string;
    chapterNumber: number;
  }[];
}
export function ChapterCatalog({
  sagas,
  initialSaga = "",
}: {
  sagas: Saga[];
  initialSaga?: string;
}) {
  const [query, setQuery] = useState("");
  const [sagaSlug, setSagaSlug] = useState(
    sagas.some((s) => s.sagaSlug === initialSaga) ? initialSaga : "",
  );
  const all = sagas.flatMap((s) => s.chapters);
  const filtered = sagas
    .filter((s) => !sagaSlug || s.sagaSlug === sagaSlug)
    .map((s) => ({
      ...s,
      chapters: s.chapters.filter((c) =>
        normalizeSearch(
          `${c.chapterTitle} ${c.chapterNumber} ${s.title}`,
        ).includes(normalizeSearch(query)),
      ),
    }))
    .filter((s) => s.chapters.length);
  return (
    <>
      <ContinueReading
        chapters={all.map((c) => ({
          slug: c.chapterSlug,
          title: c.chapterTitle,
        }))}
      />
      {all.length > 0 && (
        <div className="mb-6 space-y-4">
          <label className="block">
            <span className="sr-only">Szukaj rozdziału</span>
            <span className="search-field">
              <Search size={19} aria-hidden="true" />
              <input
                type="search"
                className="field"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Szukaj tytułu lub numeru rozdziału…"
              />
            </span>
          </label>
          <FilterPills
            label="Saga"
            value={sagaSlug}
            onChange={setSagaSlug}
            options={[
              { value: "", label: "Wszystkie sagi" },
              ...sagas.map((s) => ({ value: s.sagaSlug, label: s.title })),
            ]}
          />
        </div>
      )}
      <p role="status" className="mb-8 text-sm text-muted-foreground">
        {filtered.reduce((n, s) => n + s.chapters.length, 0)} z {all.length}{" "}
        rozdziałów
      </p>
      {filtered.length ? (
        filtered.map((s) => (
          <section key={s.sagaSlug} className="mb-10">
            <h2 className="mb-4 font-serif text-2xl">{s.title}</h2>
            <ol className="divide-y divide-border border-y border-border">
              {s.chapters.map((c) => (
                <li key={c.chapterSlug}>
                  <Link
                    href={`/chapters/${c.chapterSlug}`}
                    className="catalog-row my-1"
                  >
                    <span className="chapter-number">{c.chapterNumber}</span>
                    <span className="min-w-0 flex-1 font-serif text-lg leading-snug">
                      {c.chapterTitle}
                    </span>
                    <ReadingProgressBadge slug={c.chapterSlug} />
                    <ChevronRight
                      size={17}
                      className="shrink-0 text-muted-foreground"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        ))
      ) : (
        <div className="empty-state">
          <p>
            {all.length
              ? "Nie znaleziono rozdziałów pasujących do wyszukiwania."
              : "Rozdziały pojawią się tutaj po publikacji przez autora."}
          </p>
          {all.length > 0 && (
            <button
              className="secondary-button mt-5"
              onClick={() => {
                setQuery("");
                setSagaSlug("");
              }}
            >
              Wyczyść filtry
            </button>
          )}
        </div>
      )}
    </>
  );
}
