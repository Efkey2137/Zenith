'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { createCharacterAction } from '@/lib/actions/characters';

type FormState = { success: boolean; error: string | null; slug?: string };
const initialState: FormState = { success: false, error: null };

async function handleCreate(_prev: FormState, formData: FormData): Promise<FormState> {
  const result = await createCharacterAction(formData);
  return result.success
    ? { success: true, error: null, slug: result.slug }
    : { success: false, error: result.error };
}

export default function AdminCharactersPage() {
  const [state, formAction, isPending] = useActionState(handleCreate, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      setPreviewUrl(null);
    }
  }, [state]);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  }

  return (
    <div className="max-w-lg mx-auto py-16 px-4">
      <h1 className="text-2xl font-semibold mb-6 text-foreground">Dodaj Postać</h1>
      <form ref={formRef} action={formAction} className="space-y-4">
        <div>
          <label className="block text-sm text-muted-foreground mb-1">Imię</label>
          <input name="name" required className="w-full bg-transparent border border-border rounded-md px-3 py-2 text-foreground" />
        </div>
        <div>
          <label className="block text-sm text-muted-foreground mb-1">Slug (opcjonalnie)</label>
          <input name="slug" autoComplete="off" placeholder="np. johan-klucznik" className="w-full bg-transparent border border-border rounded-md px-3 py-2 text-foreground" />
        </div>
        <div>
          <label className="block text-sm text-muted-foreground mb-1">Frakcja (opcjonalnie)</label>
          <input name="faction" className="w-full bg-transparent border border-border rounded-md px-3 py-2 text-foreground" />
        </div>
        <div>
          <label className="block text-sm text-muted-foreground mb-1">Biografia</label>
          <textarea name="bio" rows={6} required className="w-full bg-transparent border border-border rounded-md px-3 py-2 text-foreground" />
        </div>
        <div>
          <label className="block text-sm text-muted-foreground mb-1">Portret</label>
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleImageChange}
            className="block w-full text-sm text-muted-foreground"
          />
          {previewUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt="Podgląd"
              className="mt-3 w-32 aspect-3/4 object-cover rounded-md border border-border"
            />
          )}
        </div>
        <button type="submit" disabled={isPending} className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md disabled:opacity-50">
          {isPending ? 'Zapisywanie...' : 'Zapisz Postać'}
        </button>
      </form>
      {state.error && <p className="mt-4 text-red-500 text-sm">{state.error}</p>}
      {state.success && <p className="mt-4 text-green-500 text-sm">Zapisano: {state.slug}</p>}
    </div>
  );
}