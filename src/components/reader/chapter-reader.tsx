"use client";
import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Check,
  List,
  Minus,
  Plus,
  Settings2,
  X,
} from "lucide-react";
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
const ChapterText = memo(function ChapterText({
  content,
}: {
  content: string;
}) {
  return <ReactMarkdown>{content}</ReactMarkdown>;
});

export function ChapterReader({
  chapter,
  prevChapter,
  nextChapter,
  preview = false,
}: {
  chapter: Chapter;
  prevChapter: AdjacentChapter | null;
  nextChapter: AdjacentChapter | null;
  preview?: boolean;
}) {
  const [progress, setProgress] = useState(0);
  const [notice, setNotice] = useState("");
  const [panel, setPanel] = useState<"settings" | "bookmark" | null>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const toolsRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const progressRef = useRef(0);
  const restoreTypography = useRef(false);
  const settingsRaw = useSyncExternalStore(
    subscribeReading,
    () => readStored("zenith:reader-settings"),
    () => null,
  );
  const storagePrefix = preview ? "zenith:author-preview" : "zenith";
  const bookmarkKey = `${storagePrefix}:bookmark:${chapter.slug}`;
  const bookmarkRaw = useSyncExternalStore(
    subscribeReading,
    () => readStored(bookmarkKey),
    () => null,
  );
  const settings = parseSettings(settingsRaw);
  const bookmark = parseProgress(bookmarkRaw);
  const storageKey = `${storagePrefix}:progress:${chapter.slug}`;
  const minutes = Math.max(
    1,
    Math.ceil(chapter.content.trim().split(/\s+/).length / 220),
  );

  const readingRange = useCallback((element: HTMLElement) => {
    return Math.max(
      0,
      element.offsetHeight -
        window.innerHeight +
        (toolsRef.current?.offsetHeight ?? 90) +
        20,
    );
  }, []);
  const scrollToRatio = useCallback(
    (ratio: number) => {
      const element = textRef.current;
      if (!element) return;
      const top = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: ratio <= 0 ? 0 : top + ratio * readingRange(element),
        behavior: "instant",
      });
    },
    [readingRange],
  );
  function updateSettings(update: Partial<ReaderSettings>) {
    restoreTypography.current =
      update.size !== undefined ||
      update.leading !== undefined ||
      update.wide !== undefined;
    writeStored(
      "zenith:reader-settings",
      JSON.stringify({ ...settings, ...update }),
    );
  }
  useLayoutEffect(() => {
    if (restoreTypography.current) {
      scrollToRatio(progressRef.current);
      restoreTypography.current = false;
    }
  }, [settings.size, settings.leading, settings.wide, scrollToRatio]);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!panel || !dialog) return;
    dialog.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      if (dialog.open) dialog.close();
    };
  }, [panel]);
  useEffect(() => {
    let frame = 0;
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
        const range = readingRange(element);
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
    const restoreFrame = requestAnimationFrame(() => {
      const saved = parseProgress(readStored(storageKey)) ?? 0;
      progressRef.current = saved;
      setProgress(saved);
      scrollToRatio(saved);
      ready = true;
      if (!preview) writeStored("zenith:last-chapter", chapter.slug);
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
  }, [chapter.slug, storageKey, preview, readingRange, scrollToRatio]);
  function saveBookmark() {
    writeStored(bookmarkKey, String(progressRef.current));
    setNotice("Zapisano zakładkę.");
    dialogRef.current?.close();
  }
  return (
    <div className="reader-surface" data-theme={settings.theme}>
      <div
        role="progressbar"
        aria-label="Postęp czytania"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
        className="fixed inset-x-0 top-0 z-50 h-0.5 bg-border"
      >
        <div
          className="h-full bg-primary"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      <article
        className={`${settings.wide ? "max-w-4xl" : "max-w-2xl"} mx-auto px-5 py-8 sm:px-8 sm:py-12`}
      >
        <Link
          href={preview ? "/admin/chapters" : "/chapters"}
          className="back-link"
        >
          <ArrowLeft size={17} aria-hidden="true" />
          {preview ? "Rozdziały w panelu autora" : "Spis rozdziałów"}
        </Link>
        <header className="mb-10 mt-7 sm:mb-12">
          <p className="eyebrow">
            {chapter.sagaTitle} · Rozdział {chapter.chapterNumber}
          </p>
          <h1 className="mt-3 font-serif text-4xl leading-tight tracking-tight sm:text-5xl">
            {chapter.title}
          </h1>
          <p className="mt-4 text-sm text-muted-foreground">
            Około {minutes} min czytania
          </p>
        </header>
        <div
          ref={textRef}
          className="reader-prose prose zenith-prose max-w-none prose-headings:font-serif"
          style={
            {
              "--reader-size": `${settings.size}px`,
              "--reader-leading": settings.leading,
            } as CSSProperties
          }
        >
          <ChapterText content={chapter.content} />
        </div>
        <div className="mt-12">
          <button
            className="secondary-button"
            onClick={() => {
              progressRef.current = 1;
              setProgress(1);
              scrollToRatio(1);
              writeStored(storageKey, "1");
              setNotice("Rozdział oznaczony jako przeczytany.");
            }}
          >
            <Check size={17} aria-hidden="true" />
            Oznacz jako przeczytany
          </button>
        </div>
        {!preview && (
          <nav
            aria-label="Sąsiednie rozdziały"
            className="mt-10 grid gap-4 border-t border-border pt-6 sm:grid-cols-2"
          >
            {prevChapter ? (
              <Link
                href={`/chapters/${prevChapter.slug}`}
                className="rounded-xl py-4"
              >
                <span className="eyebrow mb-2 block">Poprzedni rozdział</span>
                <span className="flex items-center gap-2 font-serif text-lg">
                  <ArrowLeft
                    size={17}
                    className="shrink-0"
                    aria-hidden="true"
                  />
                  {prevChapter.title}
                </span>
              </Link>
            ) : (
              <span />
            )}
            {nextChapter ? (
              <Link
                href={`/chapters/${nextChapter.slug}`}
                className="rounded-xl py-4 sm:text-right"
              >
                <span className="eyebrow mb-2 block">Następny rozdział</span>
                <span className="flex items-center gap-2 font-serif text-lg sm:justify-end">
                  {nextChapter.title}
                  <ArrowRight
                    size={17}
                    className="shrink-0"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            ) : (
              <div className="py-4 sm:text-right">
                <p className="mb-2 text-sm text-muted-foreground">
                  Jesteś na końcu opublikowanej historii.
                </p>
                <Link href="/chapters" className="back-link">
                  Wróć do spisu <ArrowRight size={17} aria-hidden="true" />
                </Link>
              </div>
            )}
          </nav>
        )}
      </article>
      <div ref={toolsRef} className="reader-tools">
        <div className="mb-1 flex min-h-5 items-center justify-between gap-3 px-2 text-xs text-muted-foreground">
          <p role="status" className="min-w-0">
            {notice || "Miejsce w lekturze zapisuje się automatycznie"}
          </p>
          <span className="shrink-0 tabular-nums">
            {Math.round(progress * 100)}%
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1">
          <button
            className="reader-tool"
            onClick={() => setPanel("settings")}
            aria-haspopup="dialog"
          >
            <Settings2 size={19} aria-hidden="true" />
            Wygląd
          </button>
          <button
            className="reader-tool"
            onClick={() =>
              bookmark === null ? saveBookmark() : setPanel("bookmark")
            }
            aria-haspopup={bookmark === null ? undefined : "dialog"}
          >
            <Bookmark
              size={19}
              fill={bookmark !== null ? "currentColor" : "none"}
              aria-hidden="true"
            />
            Zakładka
          </button>
          <Link
            href={preview ? "/admin/chapters" : "/chapters"}
            className="reader-tool"
          >
            <List size={19} aria-hidden="true" />
            {preview ? "Panel autora" : "Spis"}
          </Link>
        </div>
      </div>
      <dialog
        ref={dialogRef}
        className="reader-dialog"
        aria-labelledby="reader-panel-title"
        onClose={() => setPanel(null)}
        onClick={(e) => {
          if (e.target !== e.currentTarget) return;
          const rect = e.currentTarget.getBoundingClientRect();
          if (
            e.clientX < rect.left ||
            e.clientX > rect.right ||
            e.clientY < rect.top ||
            e.clientY > rect.bottom
          )
            e.currentTarget.close();
        }}
      >
        <div className="flex items-center justify-between gap-4">
          <h2 id="reader-panel-title" className="font-serif text-2xl">
            {panel === "bookmark" ? "Twoja zakładka" : "Wygląd czytnika"}
          </h2>
          <button
            className="icon-button border-0"
            aria-label="Zamknij panel"
            onClick={() => dialogRef.current?.close()}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        {panel === "bookmark" ? (
          <div className="mt-5 space-y-3">
            <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
              {chapter.title} · Zapisane miejsce:{" "}
              {Math.round((bookmark ?? 0) * 100)}%
            </p>
            <button
              className="primary-button w-full"
              onClick={() => {
                dialogRef.current?.close();
                scrollToRatio(bookmark ?? 0);
                setNotice("Powrót do zakładki.");
              }}
            >
              Wróć do zakładki
            </button>
            <button className="secondary-button w-full" onClick={saveBookmark}>
              Zapisz w tym miejscu
            </button>
          </div>
        ) : (
          <>
            <div
              className="mt-5 rounded-2xl border border-border bg-background p-5 font-serif"
              style={{ fontSize: settings.size, lineHeight: settings.leading }}
              aria-label="Podgląd tekstu"
            >
              Kroniki mrocznego słowiańskiego świata.
            </div>
            <fieldset className="reader-setting">
              <legend>Wielkość tekstu</legend>
              <div className="flex items-center justify-between gap-4">
                <button
                  className="icon-button"
                  aria-label="Zmniejsz tekst"
                  disabled={settings.size <= 17}
                  onClick={() => updateSettings({ size: settings.size - 2 })}
                >
                  <Minus size={18} />
                </button>
                <span className="tabular-nums" aria-live="polite">
                  {settings.size} px
                </span>
                <button
                  className="icon-button"
                  aria-label="Powiększ tekst"
                  disabled={settings.size >= 25}
                  onClick={() => updateSettings({ size: settings.size + 2 })}
                >
                  <Plus size={18} />
                </button>
              </div>
            </fieldset>
            <fieldset className="reader-setting">
              <legend>Odstępy między wierszami</legend>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 1.6, label: "Zwarte" },
                  { value: 1.9, label: "Zwykłe" },
                  { value: 2.2, label: "Szerokie" },
                ].map((o) => (
                  <button
                    key={o.value}
                    className="reader-choice"
                    aria-pressed={settings.leading === o.value}
                    onClick={() => updateSettings({ leading: o.value })}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset className="reader-setting">
              <legend>Tło czytnika</legend>
              <div className="grid grid-cols-2 gap-2">
                <button
                  className="reader-choice"
                  aria-pressed={settings.theme === "dark"}
                  onClick={() => updateSettings({ theme: "dark" })}
                >
                  Nocny las
                </button>
                <button
                  className="reader-choice"
                  aria-pressed={settings.theme === "paper"}
                  onClick={() => updateSettings({ theme: "paper" })}
                >
                  Jasny papier
                </button>
              </div>
            </fieldset>
            <button
              className="secondary-button mt-6 w-full"
              aria-pressed={settings.wide}
              onClick={() => updateSettings({ wide: !settings.wide })}
            >
              {settings.wide ? "Węższa kolumna" : "Szersza kolumna"}
            </button>
            <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
              Ustawienia i miejsce w lekturze są zapisywane w tej przeglądarce.
            </p>
            <button
              className="primary-button mt-5 w-full"
              onClick={() => dialogRef.current?.close()}
            >
              Gotowe
            </button>
          </>
        )}
      </dialog>
    </div>
  );
}
