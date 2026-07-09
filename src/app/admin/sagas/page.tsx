'use client';

import { useActionState } from 'react';
import { createSagaAction } from '@/lib/actions/sagas';

type FormState = { success: boolean; error: string | null; slug?: string };
const initialState: FormState = { success: false, error: null };

async function handleCreate(_prev: FormState, formData: FormData): Promise<FormState> {
  const result = await createSagaAction(formData);
  return result.success
    ? { success: true, error: null, slug: result.slug }
    : { success: false, error: result.error };
}

export default function AdminSagasPage() {
  const [state, formAction, isPending] = useActionState(handleCreate, initialState);

  return (
    <div className="max-w-lg mx-auto py-16 px-4">
      <h1 className="text-2xl font-semibold mb-6 text-foreground">Dodaj Sagę</h1>
      <form action={formAction} className="space-y-4">
        <div>
          <label className="block text-sm text-muted-foreground mb-1">Tytuł</label>
          <input name="title" required className="w-full bg-transparent border border-border rounded-md px-3 py-2 text-foreground" />
        </div>
        <div>
          <label className="block text-sm text-muted-foreground mb-1">Slug (opcjonalnie)</label>
          <input name="slug" placeholder="np. cykl-duszorzezcy" className="w-full bg-transparent border border-border rounded-md px-3 py-2 text-foreground" />
        </div>
        <div>
          <label className="block text-sm text-muted-foreground mb-1">Kolejność (10, 20, 30...)</label>
          <input name="order" type="number" required className="w-full bg-transparent border border-border rounded-md px-3 py-2 text-foreground" />
        </div>
        <div>
          <label className="block text-sm text-muted-foreground mb-1">Opis / zarys fabuły</label>
          <textarea name="description" rows={4} className="w-full bg-transparent border border-border rounded-md px-3 py-2 text-foreground" />
        </div>
        <button type="submit" disabled={isPending} className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md disabled:opacity-50">
          {isPending ? 'Zapisywanie...' : 'Zapisz Sagę'}
        </button>
      </form>
      {state.error && <p className="mt-4 text-red-500 text-sm">{state.error}</p>}
      {state.success && <p className="mt-4 text-green-500 text-sm">Zapisano Sagę: {state.slug}</p>}
    </div>
  );
}