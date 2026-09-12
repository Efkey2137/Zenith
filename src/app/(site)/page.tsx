import Link from "next/link";
import { ArrowRight, BookOpen, Users, Compass, Sparkles } from "lucide-react";
import { getAllChaptersGroupedBySaga } from "@/lib/db/queries/chapters";
import { ContinueReading } from "@/components/reader/continue-reading";
export default async function HomePage() {
  const sagas = await getAllChaptersGroupedBySaga();
  const chapters = sagas.flatMap((s) => s.chapters);
  const first = chapters[0];
  return (
    <div className="max-w-5xl mx-auto px-6">
      <section className="py-20 sm:py-28 max-w-3xl">
        <p className="eyebrow mb-8">Powieść i jej świat</p>
        <h1 className="font-serif text-6xl sm:text-8xl tracking-[0.12em]">
          ZENITH
        </h1>
        <p className="mt-7 text-xl sm:text-2xl text-muted-foreground font-serif leading-relaxed max-w-xl">
          Kroniki mrocznego
          <br className="hidden sm:block" /> słowiańskiego świata.
        </p>
        <div className="flex flex-wrap gap-3 mt-10">
          <Link
            href={first ? `/chapters/${first.chapterSlug}` : "/chapters"}
            className="primary-button"
          >
            <BookOpen size={16} />
            {first ? "Zacznij czytać" : "Przejdź do rozdziałów"}
            <ArrowRight size={16} />
          </Link>
          <Link href="/world" className="secondary-button">
            Odkryj świat
          </Link>
        </div>
        <p className="text-xs text-muted-foreground mt-6">
          Rozdziały: {chapters.length} · Sagi: {sagas.length} · Czytaj we
          własnym tempie
        </p>
      </section>
      <ContinueReading
        chapters={chapters.map((c) => ({
          slug: c.chapterSlug,
          title: c.chapterTitle,
        }))}
      />
      <section aria-labelledby="explore" className="pb-12">
        <div className="flex items-center gap-5 mb-7">
          <h2 id="explore" className="eyebrow">
            Poznaj Zenith
          </h2>
          <span className="h-px bg-border flex-1" />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            {
              href: "/chapters",
              title: "Rozdziały",
              text: "Kolejne sagi, jeden spis. Wróć do swojej lektury.",
              icon: BookOpen,
            },
            {
              href: "/characters",
              title: "Postacie",
              text: "Bohaterowie, ich historie i przynależność.",
              icon: Users,
            },
            {
              href: "/world",
              title: "Świat",
              text: "Miejsca i krainy opisane przez autora.",
              icon: Compass,
            },
            {
              href: "/power-system",
              title: "System Mocy",
              text: "Zasady i granice sił obecnych w powieści.",
              icon: Sparkles,
            },
          ].map(({ href, title, text, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="group border border-border p-6 sm:p-8 hover:bg-muted/30 transition-colors"
            >
              <Icon
                size={20}
                strokeWidth={1.2}
                className="text-muted-foreground mb-6"
              />
              <h3 className="font-serif text-2xl flex items-center justify-between">
                {title}
                <ArrowRight
                  size={17}
                  className="text-muted-foreground group-hover:translate-x-1 transition-transform"
                />
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mt-3">
                {text}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
