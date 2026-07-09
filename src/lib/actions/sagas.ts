'use server';

import { db } from '@/lib/db';
import { sagas } from '@/lib/db/schema';
import { revalidatePath } from 'next/cache';
import slugify from 'slugify';

type SagaResult = { success: true; slug: string } | { success: false; error: string };

export async function createSagaAction(formData: FormData): Promise<SagaResult> {
  const title = formData.get('title') as string;
  const orderRaw = formData.get('order') as string;
  const description = (formData.get('description') as string) || null;
  const slugRaw = ((formData.get('slug') as string) || '').trim();

  if (!title || !orderRaw) {
    return { success: false, error: 'Tytuł i kolejność są wymagane.' };
  }

  const order = Number(orderRaw);
  if (Number.isNaN(order)) {
    return { success: false, error: 'Kolejność musi być liczbą.' };
  }

  const slug = slugRaw || slugify(title, { lower: true, strict: true });

  try {
    await db.insert(sagas).values({ slug, title, order, description });
  } catch {
    return { success: false, error: `Nie udało się zapisać — slug "${slug}" może już istnieć.` };
  }

  revalidatePath('/chapters');
  return { success: true, slug };
}