'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

interface Chapter {
  slug: string;
  sagaTitle: string;
  title: string;
  chapterNumber: number;
  content: string;
}

export function ChapterReader({ chapter }: { chapter: Chapter }) {
  const [progress, setProgress] = useState(0);
  const storageKey = `zenith:progress:${chapter.slug}`;

  // Przywróć zapisaną pozycję czytania po wejściu na stronę
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const ratio = Number(saved);
      const target = ratio * (document.documentElement.scrollHeight - window.innerHeight);
      window.scrollTo({ top: target });
    }
  }, [storageKey]);

  // Śledź scroll i zapisuj postęp na bieżąco
  useEffect(() => {
    function handleScroll() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = docHeight > 0 ? scrollTop / docHeight : 0;

      setProgress(Math.min(1, Math.max(0, ratio)));
      localStorage.setItem(storageKey, ratio.toString());
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [storageKey]);

  return (
    <>
      <div className="fixed top-0 left-0 right-0 h-0.5 bg-border z-50">
        <div
          className="h-full bg-primary transition-[width] duration-150"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <article className="max-w-2xl mx-auto px-6 py-20">
        <Link
          href="/chapters"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Spis rozdziałów
        </Link>

        <p className="mt-8 text-sm text-muted-foreground tabular-nums">
          {chapter.sagaTitle} · Rozdział {chapter.chapterNumber}
        </p>
        <h1 className="mt-2 mb-12 text-4xl font-serif text-foreground">{chapter.title}</h1>

        <div className="prose prose-invert prose-zinc max-w-none prose-p:leading-relaxed prose-p:font-light">
          <ReactMarkdown>{chapter.content}</ReactMarkdown>
        </div>
      </article>
    </>
  );
}