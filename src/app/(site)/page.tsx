import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  Users,
  Compass,
  Sparkles,
} from "lucide-react";
import { getAllChaptersGroupedBySaga } from "@/lib/db/queries/chapters";
import { ContinueReading } from "@/components/reader/continue-reading";
import { BranchMark } from "@/components/site/book-mark";
export default async function HomePage() {
  const sagas = await getAllChaptersGroupedBySaga();
  const chapters = sagas.flatMap((s) =>
    s.chapters.map((c) => ({
      slug: c.chapterSlug,
      title: c.chapterTitle,
      number: c.chapterNumber,
      sagaTitle: s.title,
    })),
  );
  return (
    <div className="site-shell">
      <section className="grid items-center gap-10 py-12 sm:py-18 lg:grid-cols-[1fr_440px] lg:gap-16 lg:py-22">
        <div>
          <div className="flex items-center gap-5 sm:gap-7">
            <h1 className="font-serif text-7xl leading-none tracking-[-0.05em] sm:text-8xl">
              Zenith
            </h1>
            <BranchMark className="shrink-0 text-brass" />
          </div>
          <p className="mt-6 max-w-md font-serif text-2xl leading-relaxed text-muted-foreground sm:text-[28px]">
            Kroniki mrocznego
            <br />
            słowiańskiego świata.
          </p>
          <p className="mt-5 text-sm text-muted-foreground">
            {chapters.length} rozdziałów · {sagas.length} sagi
            <br className="sm:hidden" />
            <span className="hidden sm:inline"> · </span>Czytaj we własnym
            tempie.
          </p>
        </div>
        <ContinueReading chapters={chapters} featured />
      </section>
      <section aria-labelledby="library" className="pb-10 sm:pb-14">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 id="library" className="font-serif text-2xl sm:text-3xl">
            Twoja biblioteka
          </h2>
          <Link href="/chapters" className="back-link">
            Cały spis <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
        <div className="divide-y divide-border border-y border-border">
          {sagas.map((s) => (
            <Link
              key={s.sagaSlug}
              href={`/chapters?saga=${encodeURIComponent(s.sagaSlug)}`}
              className="catalog-row my-1 gap-5 sm:px-4"
            >
              <span
                className="h-10 w-1 shrink-0 rounded-full bg-brass/70"
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1">
                <h3 className="font-serif text-xl sm:text-2xl">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Rozdziały: {s.chapters.length}
                </p>
              </div>
              <ChevronRight
                size={20}
                className="shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
            </Link>
          ))}
          {!sagas.length && (
            <p className="py-8 text-muted-foreground">
              Sagi pojawią się tutaj po publikacji przez autora.
            </p>
          )}
        </div>
      </section>
      <section aria-labelledby="explore" className="pb-12 sm:pb-16">
        <h2 id="explore" className="font-serif text-2xl sm:text-3xl">
          Poza rozdziałami
        </h2>
        <div className="mt-3 grid gap-x-8 sm:grid-cols-3">
          {[
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
            <Link key={href} href={href} className="explore-link">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-card text-primary">
                <Icon size={21} strokeWidth={1.5} aria-hidden="true" />
              </span>
              <div>
                <h3 className="font-serif text-xl">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {text}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
