"use client";
import { Check } from "lucide-react";
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
    <span className="reading-badge">
      {progress >= 0.95 ? (
        <>
          <Check size={12} aria-hidden="true" />
          <span>przeczytane</span>
        </>
      ) : (
        `${Math.round(progress * 100)}%`
      )}
    </span>
  );
}
