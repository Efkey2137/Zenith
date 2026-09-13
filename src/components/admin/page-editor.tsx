"use client";
import { useActionState, useState } from "react";
import ReactMarkdown from "react-markdown";
import { savePageAction } from "@/lib/actions/pages";
export function PageEditor({
  slug,
  title,
  content,
}: {
  slug: string;
  title: string;
  content: string;
}) {
  const [state, action, pending] = useActionState(savePageAction, {
    success: false,
    message: "",
  });
  const [value, setValue] = useState(content);
  const [preview, setPreview] = useState(false);
  return (
    <form action={action} className="border border-border p-5 sm:p-7 mb-6">
      <input type="hidden" name="slug" value={slug} />
      <h2 className="font-serif text-2xl mb-5">{title}</h2>
      <label>
        <span className="field-label">Treść (Markdown)</span>
        <textarea
          name="content"
          className="field"
          rows={12}
          maxLength={100000}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </label>
      <div className="flex flex-wrap gap-3 mt-4">
        <button className="primary-button" disabled={pending}>
          {pending ? "Zapisywanie…" : "Zapisz i opublikuj"}
        </button>
        <button
          type="button"
          className="secondary-button"
          aria-expanded={preview}
          onClick={() => setPreview(!preview)}
        >
          {preview ? "Ukryj podgląd" : "Podgląd tekstu"}
        </button>
      </div>
      <p
        role="status"
        className={`mt-4 text-sm ${state.success ? "text-emerald-300" : "text-red-300"}`}
      >
        {state.message}
      </p>
      {preview && (
        <div className="prose prose-invert prose-zinc max-w-none mt-8 border-t border-border pt-6">
          <ReactMarkdown>{value || "Brak treści do podglądu."}</ReactMarkdown>
        </div>
      )}
    </form>
  );
}
