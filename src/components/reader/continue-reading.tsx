"use client";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import { readStored, subscribeReading } from "@/lib/reading";
import { ReadingProgressBadge } from "./reading-progress-badge";
export function ContinueReading({
  chapters,
}: {
  chapters: { slug: string; title: string }[];
}) {
  const slug = useSyncExternalStore(
    subscribeReading,
    () => readStored("zenith:last-chapter"),
    () => null,
  );
  const chapter = chapters.find((c) => c.slug === slug);
  if (!chapter) return null;
  return (
    <aside className="mb-12 border-y border-border py-6 flex flex-wrap justify-between items-center gap-4">
      <div>
        <p className="eyebrow mb-2">Twoja ostatnia lektura</p>
        <p className="font-serif text-xl">{chapter.title}</p>
        <ReadingProgressBadge slug={chapter.slug} />
      </div>
      <Link href={`/chapters/${chapter.slug}`} className="secondary-button">
        Wróć do lektury →
      </Link>
    </aside>
  );
}
