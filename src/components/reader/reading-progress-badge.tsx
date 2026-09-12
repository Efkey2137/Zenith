"use client";
import { useSyncExternalStore } from "react";
import { readStored, parseProgress, subscribeReading } from "@/lib/reading";
export function ReadingProgressBadge({ slug }: { slug: string }) {
  const raw = useSyncExternalStore(
    subscribeReading,
    () => readStored(`zenith:progress:${slug}`),
    () => null,
  );
  const progress = parseProgress(raw);
  if (progress === null) return null;
  return (
    <span className="text-xs text-muted-foreground shrink-0">
      {progress >= 0.95 ? "przeczytane" : `${Math.round(progress * 100)}%`}
    </span>
  );
}
