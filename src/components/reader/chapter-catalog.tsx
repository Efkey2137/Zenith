"use client";
import { useState } from "react";
import Link from "next/link";
import { normalizeSearch } from "@/lib/validation";
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
export function ChapterCatalog({ sagas }: { sagas: Saga[] }) {
  const [query, setQuery] = useState("");
  const [sagaSlug, setSagaSlug] = useState("");
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
        <div className="grid sm:grid-cols-[1fr_200px] gap-3 mb-7">
          <label>
            <span className="field-label">Szukaj rozdziału</span>
            <input
              type="search"
              className="field"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tytuł lub numer…"
            />
          </label>
          <label>
            <span className="field-label">Saga</span>
            <select
              className="field"
              value={sagaSlug}
              onChange={(e) => setSagaSlug(e.target.value)}
            >
              <option value="">Wszystkie sagi</option>
              {sagas.map((s) => (
                <option key={s.sagaSlug} value={s.sagaSlug}>
                  {s.title}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}
      <p role="status" className="text-xs text-muted-foreground mb-8">
        {filtered.reduce((n, s) => n + s.chapters.length, 0)} z {all.length}{" "}
        rozdziałów
      </p>
      {filtered.length ? (
        filtered.map((s) => (
          <section key={s.sagaSlug} className="mb-12">
            <h2 className="eyebrow mb-4">{s.title}</h2>
            <ol>
              {s.chapters.map((c) => (
                <li key={c.chapterSlug}>
                  <Link
                    href={`/chapters/${c.chapterSlug}`}
                    className="flex items-baseline gap-4 py-4 border-b border-border/60 hover:bg-muted/20 transition-colors"
                  >
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {String(c.chapterNumber).padStart(2, "0")}
                    </span>
                    <span className="flex-1 min-w-0">{c.chapterTitle}</span>
                    <ReadingProgressBadge slug={c.chapterSlug} />
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
