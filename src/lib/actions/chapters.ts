"use server";
import { getDb } from "@/lib/db";
import { chapters, sagas } from "@/lib/db/schema";
import { parseChapterFile } from "@/lib/parsers/chapter-parser";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { and, eq, ne } from "drizzle-orm";
type ChapterUploadResult =
  | { fileName: string; success: true; slug: string }
  | { fileName: string; success: false; error: string };
export async function uploadChaptersAction(
  formData: FormData,
): Promise<ChapterUploadResult[]> {
  await requireAdmin();
  const files = formData
    .getAll("files")
    .filter((f): f is File => f instanceof File && f.size > 0);
  if (!files.length)
    return [
      {
        fileName: "Pliki",
        success: false,
        error: "Nie wybrano żadnych plików.",
      },
    ];
  if (
    files.length > 30 ||
    files.reduce((sum, f) => sum + f.size, 0) > 3 * 1024 * 1024
  )
    return [
      {
        fileName: "Pliki",
        success: false,
        error: "Wybierz do 30 plików o łącznej wielkości do 3 MB.",
      },
    ];
  const results: ChapterUploadResult[] = [];
  for (const file of files) {
    if (!/\.(md|txt)$/i.test(file.name)) {
      results.push({
        fileName: file.name,
        success: false,
        error: "Obsługiwane formaty: .md, .txt",
      });
      continue;
    }
    if (file.size > 512 * 1024) {
      results.push({
        fileName: file.name,
        success: false,
        error: "Pojedynczy rozdział może mieć maksymalnie 512 KB.",
      });
      continue;
    }
    let parsed;
    try {
      parsed = parseChapterFile(
        await file.text(),
        file.name.replace(/\.(md|txt)$/i, ""),
      );
    } catch (error) {
      results.push({
        fileName: file.name,
        success: false,
        error: error instanceof Error ? error.message : "Nieprawidłowy plik.",
      });
      continue;
    }
    try {
      const [saga] = await getDb()
        .select()
        .from(sagas)
        .where(eq(sagas.slug, parsed.sagaSlug))
        .limit(1);
      if (!saga) {
        results.push({
          fileName: file.name,
          success: false,
          error: `Saga „${parsed.sagaSlug}” nie istnieje. Najpierw dodaj ją w panelu Sag.`,
        });
        continue;
      }
      const [duplicate] = await getDb()
        .select({ id: chapters.id })
        .from(chapters)
        .where(
          and(
            eq(chapters.sagaId, saga.id),
            eq(chapters.chapterNumber, parsed.chapterNumber),
            ne(chapters.slug, parsed.slug),
          ),
        )
        .limit(1);
      if (duplicate) {
        results.push({
          fileName: file.name,
          success: false,
          error:
            "Ten numer rozdziału jest już zajęty w tej sadze. Użyj adresu istniejącego rozdziału, aby go zaktualizować.",
        });
        continue;
      }
      const values = {
        title: parsed.title,
        chapterNumber: parsed.chapterNumber,
        sagaId: saga.id,
        content: parsed.content,
      };
      await getDb()
        .insert(chapters)
        .values({ ...values, slug: parsed.slug })
        .onConflictDoUpdate({
          target: chapters.slug,
          set: { ...values, updatedAt: new Date().toISOString() },
        });
      results.push({ fileName: file.name, success: true, slug: parsed.slug });
      revalidatePath(`/chapters/${parsed.slug}`);
    } catch {
      results.push({
        fileName: file.name,
        success: false,
        error: "Nie udało się zapisać rozdziału. Spróbuj ponownie.",
      });
    }
  }
  revalidatePath("/");
  revalidatePath("/chapters");
  revalidatePath("/admin/chapters");
  return results;
}
