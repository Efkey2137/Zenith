'use client';

import { useEffect, useState } from 'react';

export function ReadingProgressBadge({ slug }: { slug: string }) {
  const [progress, setProgress] = useState<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(`zenith:progress:${slug}`);
    if (saved) setProgress(Number(saved));
  }, [slug]);

  if (progress === null) return null;

  if (progress >= 0.95) {
    return <span className="text-xs text-primary">przeczytane</span>;
  }

  return <span className="text-xs text-muted-foreground">{Math.round(progress * 100)}%</span>;
}