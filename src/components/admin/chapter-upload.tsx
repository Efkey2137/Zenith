"use client";
import { useActionState, useState } from "react";
import Link from "next/link";
import { uploadChaptersAction } from "@/lib/actions/chapters";
export function ChapterUpload() {
  const [validation, setValidation] = useState("");
  const [results, action, pending] = useActionState(
    async (
      _prev: Awaited<ReturnType<typeof uploadChaptersAction>>,
      data: FormData,
    ) => uploadChaptersAction(data),
    [],
  );
  return (
    <form action={action} className="space-y-5">
      <label className="block">
        <span className="field-label">Pliki rozdziałów (.md, .txt)</span>
        <input
          type="file"
          name="files"
          accept=".md,.txt"
          multiple
          required
          className="block text-sm max-w-full"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            setValidation(
              files.length > 30 ||
                files.reduce((sum, f) => sum + f.size, 0) > 3 * 1024 * 1024 ||
                files.some((f) => f.size > 512 * 1024)
                ? "Wybierz do 30 plików, łącznie do 3 MB i do 512 KB na rozdział."
                : "",
            );
          }}
        />
      </label>
      <p className="text-xs text-muted-foreground">
        Do 30 plików, łącznie do 3 MB. Ten sam adres rozdziału aktualizuje
        istniejącą treść.
      </p>
      <p role="status" className="text-sm text-red-300">
        {validation}
      </p>
      <button className="primary-button" disabled={pending || !!validation}>
        {pending ? "Wgrywanie…" : "Wgraj rozdziały"}
      </button>
      {results.length > 0 && (
        <ul aria-live="polite" className="space-y-3 text-sm">
          {results.map((r, i) => (
            <li
              key={`${r.fileName}-${i}`}
              className={r.success ? "text-emerald-300" : "text-red-300"}
            >
              {r.fileName}:{" "}
              {r.success ? (
                <Link href={`/chapters/${r.slug}`}>
                  Zapisano. Otwórz rozdział →
                </Link>
              ) : (
                r.error
              )}
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
