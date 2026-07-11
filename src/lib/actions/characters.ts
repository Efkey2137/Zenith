'use server';

import { db } from '@/lib/db';
import { characters } from '@/lib/db/schema';
import { revalidatePath } from 'next/cache';
import slugify from 'slugify';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

type CharacterResult = { success: true; slug: string } | { success: false; error: string };

async function saveCharacterImage(file: File, slug: string): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const ext = path.extname(file.name) || '.jpg';
  const fileName = `${slug}${ext}`;
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'characters');

  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, fileName), buffer);

  return `/images/characters/${fileName}`;
}

export async function createCharacterAction(formData: FormData): Promise<CharacterResult> {
  const name = formData.get('name') as string;
  const fraction = (formData.get('faction') as string) || null;
  const bio = formData.get('bio') as string;
  const slugRaw = ((formData.get('slug') as string) || '').trim();
  const imageFile = formData.get('image') as File | null;

  if (!name || !bio) {
    return { success: false, error: 'Imię i biografia są wymagane.' };
  }

  const slug = slugRaw || slugify(name, { lower: true, strict: true });

  let imageUrl: string | null = null;
  if (imageFile && imageFile.size > 0) {
    imageUrl = await saveCharacterImage(imageFile, slug);
  }

  try {
    await db.insert(characters).values({ slug, name, fraction, bio, imageUrl });
  } catch {
    return { success: false, error: `Nie udało się zapisać — slug "${slug}" może już istnieć.` };
  }

  revalidatePath('/characters');
  return { success: true, slug };
}