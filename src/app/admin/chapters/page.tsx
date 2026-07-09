'use client';

import { useActionState } from 'react';
import { uploadChaptersAction } from '@/lib/actions/chapters';

type ChapterUploadResult =
  | { fileName: string; success: true; slug: string }
  | { fileName: string; success: false; error: string };

const initialState: ChapterUploadResult[] = [];

async function handleUpload(_prev: ChapterUploadResult[], formData: FormData) {
  return uploadChaptersAction(formData);
}

export default function AdminChaptersPage() {
  const [results, formAction, isPending] = useActionState(handleUpload, initialState);

  return (
    <div className="max-w-lg mx-auto py-16 px-4">
      <h1 className="text-2xl font-semibold mb-6 text-foreground">Dodaj / zaktualizuj rozdziały</h1>
      <form action={formAction} className="space-y-4">
        <input
          type="file"
          name="files"
          accept=".md,.txt"
          multiple
          required
          className="block w-full text-sm text-muted-foreground"
        />
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md disabled:opacity-50"
        >
          {isPending ? 'Wgrywanie...' : 'Wgraj rozdziały'}
        </button>
      </form>

      {results.length > 0 && (
        <ul className="mt-6 space-y-1 text-sm">
          {results.map((result, i) => (
            <li key={i} className={result.success ? 'text-green-500' : 'text-red-500'}>
              <span className="font-mono">{result.fileName}</span>:{' '}
              {result.success ? `zapisano jako "${result.slug}"` : result.error}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}