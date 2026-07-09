'use server';

import { db } from '@/lib/db';
import { chapters, sagas } from '@/lib/db/schema';
import { parseChapterFile } from '@/lib/parsers/chapter-parser';
import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';

type ChapterUploadResult =
  | { fileName: string; success: true; slug: string }
  | { fileName: string; success: false; error: string };

export async function uploadChaptersAction(formData: FormData): Promise<ChapterUploadResult[]> {
  const files = formData.getAll('files') as File[];
  const results: ChapterUploadResult[] = [];

  if (files.length === 0) {
    return [{ fileName: '-', success: false, error: 'Nie wybrano żadnych plików.' }];
  }

  // Świadomie sekwencyjnie (await w pętli), nie Promise.all —
  // lokalny sqld ma model jednego zapisu na raz, równoległe insercje
  // tylko kolejkowałyby się i tak, a przy błędzie trudniej dociec, który plik zawinił.
  for (const file of files) {
    if (!file || file.size === 0) continue;

    if (!file.name.endsWith('.md') && !file.name.endsWith('.txt')) {
      results.push({ fileName: file.name, success: false, error: 'Obsługiwane formaty: .md, .txt' });
      continue;
    }

    const rawText = await file.text();
    const fallbackTitle = file.name.replace(/\.(md|txt)$/, '');

    let parsed;
    try {
      parsed = parseChapterFile(rawText, fallbackTitle);
    } catch (err) {
      results.push({ fileName: file.name, success: false, error: (err as Error).message });
      continue;
    }

    const saga = await db.select().from(sagas).where(eq(sagas.slug, parsed.sagaSlug)).limit(1);
    if (saga.length === 0) {
      results.push({
        fileName: file.name,
        success: false,
        error: `Saga o slugu "${parsed.sagaSlug}" nie istnieje.`,
      });
      continue;
    }

    try {
      await db
        .insert(chapters)
        .values({
          slug: parsed.slug,
          title: parsed.title,
          chapterNumber: parsed.chapterNumber,
          sagaId: saga[0].id,
          content: parsed.content,
        })
        .onConflictDoUpdate({
          target: chapters.slug,
          set: {
            title: parsed.title,
            chapterNumber: parsed.chapterNumber,
            sagaId: saga[0].id,
            content: parsed.content,
            updatedAt: new Date().toISOString(),
          },
        });
      results.push({ fileName: file.name, success: true, slug: parsed.slug });
    } catch (err) {
      results.push({ fileName: file.name, success: false, error: (err as Error).message });
    }
  }

  revalidatePath('/chapters');
  return results;
}