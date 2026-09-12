"use client";
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { Bookmark, Check, Minus, Plus, Settings2 } from "lucide-react";
import {
  parseProgress,
  parseSettings,
  readStored,
  writeStored,
  subscribeReading,
  type ReaderSettings,
} from "@/lib/reading";
interface AdjacentChapter {
  slug: string;
  title: string;
}
interface Chapter {
  slug: string;
  title: string;
  chapterNumber: number;
  content: string;
  sagaTitle: string;
}
export function ChapterReader({
  chapter,
  prevChapter,
  nextChapter,
}: {
  chapter: Chapter;
  prevChapter: AdjacentChapter | null;
  nextChapter: AdjacentChapter | null;
}) {
  const [progress, setProgress] = useState(0);
  const [notice, setNotice] = useState("");
  const textRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const settingsRaw = useSyncExternalStore(
    subscribeReading,
    () => readStored("zenith:reader-settings"),
    () => null,
  );
  const bookmarkRaw = useSyncExternalStore(
    subscribeReading,
    () => readStored(`zenith:bookmark:${chapter.slug}`),
    () => null,
  );
  const settings = parseSettings(settingsRaw);
  const bookmark = parseProgress(bookmarkRaw);
  const storageKey = `zenith:progress:${chapter.slug}`;
  const minutes = Math.max(
    1,
    Math.ceil(chapter.content.trim().split(/\s+/).length / 220),
  );
  function updateSettings(update: Partial<ReaderSettings>) {
    writeStored(
      "zenith:reader-settings",
      JSON.stringify({ ...settings, ...update }),
    );
  }
  function scrollToRatio(ratio: number) {
    const element = textRef.current;
    if (!element) return;
    const top = element.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({
      top:
        ratio <= 0
          ? 0
          : top +
            ratio * Math.max(0, element.offsetHeight - window.innerHeight),
      behavior: "instant",
    });
  }
  useEffect(() => {
    let frame = 0;
    let restoreFrame = 0;
    let saveTimer: ReturnType<typeof setTimeout> | undefined;
    let ready = false;
    function save() {
      if (ready) writeStored(storageKey, String(progressRef.current));
    }
    function handleScroll() {
      if (!ready || frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const element = textRef.current;
        if (!element) return;
        const top = element.getBoundingClientRect().top + window.scrollY;
        const range = element.offsetHeight - window.innerHeight;
        const ratio =
          range > 0
            ? Math.min(1, Math.max(0, (window.scrollY - top) / range))
            : progressRef.current;
        progressRef.current = ratio;
        setProgress(ratio);
        clearTimeout(saveTimer);
        saveTimer = setTimeout(save, 200);
      });
    }
    // Restore only after the text and saved typography have been laid out.
    restoreFrame = requestAnimationFrame(() => {
      const saved = parseProgress(readStored(storageKey)) ?? 0;
      progressRef.current = saved;
      setProgress(saved);
      scrollToRatio(saved);
      ready = true;
      writeStored("zenith:last-chapter", chapter.slug);
      window.addEventListener("scroll", handleScroll, { passive: true });
    });
    window.addEventListener("pagehide", save);
    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(restoreFrame);
      clearTimeout(saveTimer);
      save();
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("pagehide", save);
    };
  }, [chapter.slug, storageKey]);
  return (
    <div className="reader-surface" data-theme={settings.theme}>
      <div
        role="progressbar"
        aria-label="Postęp czytania"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
        className="fixed top-0 left-0 right-0 h-0.5 bg-border z-50"
      >
        <div
          className="h-full bg-foreground"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      <article
        className={`${settings.wide ? "max-w-4xl" : "max-w-2xl"} mx-auto px-6 py-12 sm:py-16`}
      >
        <Link
          href="/chapters"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Spis rozdziałów
        </Link>
        <p className="mt-10 eyebrow">
          {chapter.sagaTitle} · Rozdział {chapter.chapterNumber}
        </p>
        <h1 className="mt-4 text-3xl sm:text-4xl font-serif leading-tight">
          {chapter.title}
        </h1>
        <p className="text-xs text-muted-foreground mt-4">
          Około {minutes} min czytania · {Math.round(progress * 100)}%
        </p>
        <details className="my-8 border-y border-border py-4">
          <summary className="text-sm list-none flex items-center gap-2">
            <Settings2 size={16} />
            Ustawienia czytania
          </summary>
          <div className="pt-5 flex flex-wrap items-end gap-6">
            <div>
              <p className="field-label">Wielkość tekstu</p>
              <div className="flex items-center gap-3">
                <button
                  className="icon-button"
                  aria-label="Zmniejsz tekst"
                  disabled={settings.size <= 17}
                  onClick={() => updateSettings({ size: settings.size - 2 })}
                >
                  <Minus size={16} />
                </button>
                <span aria-live="polite">{settings.size}</span>
                <button
                  className="icon-button"
                  aria-label="Powiększ tekst"
                  disabled={settings.size >= 25}
                  onClick={() => updateSettings({ size: settings.size + 2 })}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
            <label className="text-sm">
              Odstępy między wierszami
              <select
                value={settings.leading}
                onChange={(e) =>
                  updateSettings({ leading: Number(e.target.value) })
                }
                className="field mt-2"
              >
                <option value={1.6}>Zwarte</option>
                <option value={1.9}>Zwykłe</option>
                <option value={2.2}>Szerokie</option>
              </select>
            </label>
            <button
              className="secondary-button"
              aria-pressed={settings.theme === "paper"}
              onClick={() =>
                updateSettings({
                  theme: settings.theme === "dark" ? "paper" : "dark",
                })
              }
            >
              {settings.theme === "dark" ? "Jasny papier" : "Ciemne tło"}
            </button>
            <button
              className="secondary-button"
              aria-pressed={settings.wide}
              onClick={() => updateSettings({ wide: !settings.wide })}
            >
              {settings.wide ? "Węższa kolumna" : "Szersza kolumna"}
            </button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Ustawienia i miejsce w lekturze są zapisywane w tej przeglądarce.
          </p>
        </details>
        <div className="flex flex-wrap gap-3 mb-8">
          <button
            className="secondary-button fixed bottom-5 right-5 z-40 bg-background shadow-lg"
            onClick={() => {
              writeStored(`zenith:bookmark:${chapter.slug}`, String(progress));
              setNotice("Zapisano zakładkę.");
            }}
          >
            <Bookmark size={15} />
            Zapisz zakładkę
          </button>
          {bookmark !== null && (
            <button
              className="secondary-button"
              onClick={() => {
                scrollToRatio(bookmark);
                setNotice("Powrót do zakładki.");
              }}
            >
              Wróć do zakładki ({Math.round(bookmark * 100)}%)
            </button>
          )}
        </div>
        <p role="status" className="text-xs text-muted-foreground mb-4 min-h-4">
          {notice}
        </p>
        <div
          ref={textRef}
          className="reader-prose prose prose-invert prose-zinc max-w-none prose-headings:font-serif"
          style={
            {
              "--reader-size": `${settings.size}px`,
              "--reader-leading": settings.leading,
            } as CSSProperties
          }
        >
          <ReactMarkdown>{chapter.content}</ReactMarkdown>
        </div>
        <div className="mt-12">
          <button
            className="secondary-button"
            onClick={() => {
              progressRef.current = 1;
              setProgress(1);
              writeStored(storageKey, "1");
              setNotice("Rozdział oznaczony jako przeczytany.");
            }}
          >
            <Check size={16} />
            Oznacz jako przeczytany
          </button>
        </div>
        <nav
          aria-label="Sąsiednie rozdziały"
          className="mt-12 pt-8 border-t border-border grid sm:grid-cols-2 gap-6 text-sm"
        >
          {prevChapter ? (
            <Link href={`/chapters/${prevChapter.slug}`}>
              <span className="eyebrow block mb-2">Poprzedni rozdział</span>←{" "}
              {prevChapter.title}
            </Link>
          ) : (
            <span />
          )}
          {nextChapter ? (
            <Link
              href={`/chapters/${nextChapter.slug}`}
              className="sm:text-right"
            >
              <span className="eyebrow block mb-2">Następny rozdział</span>
              {nextChapter.title} →
            </Link>
          ) : (
            <div className="sm:text-right">
              <p className="text-muted-foreground mb-3">
                Jesteś na końcu opublikowanej historii.
              </p>
              <Link href="/chapters">Wróć do spisu →</Link>
            </div>
          )}
        </nav>
      </article>
    </div>
  );
}
