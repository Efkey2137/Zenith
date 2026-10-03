"use client";
import { useActionState } from "react";
import { setChapterPublicationAction } from "@/lib/actions/chapters";

export function ChapterPublication({
  slug,
  title,
  published,
}: {
  slug: string;
  title: string;
  published: boolean;
}) {
  const [state, action, pending] = useActionState(
    async (_previous: { error: string }, data: FormData) =>
      setChapterPublicationAction(data),
    { error: "" },
  );
  return (
    <form action={action} className="sm:text-right">
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="published" value={String(!published)} />
      <p
        className={`text-xs mb-2 ${published ? "text-emerald-300" : "text-muted-foreground"}`}
      >
        {published ? "Publiczny" : "Szkic · tylko dla autora"}
      </p>
      <button
        className={published ? "secondary-button" : "primary-button"}
        disabled={pending}
        aria-label={`${published ? "Ukryj" : "Opublikuj"}: ${title}`}
      >
        {pending ? "Zapisywanie…" : published ? "Ukryj" : "Opublikuj"}
      </button>
      <p role="status" className="text-xs text-red-300 mt-2">
        {state.error}
      </p>
    </form>
  );
}
