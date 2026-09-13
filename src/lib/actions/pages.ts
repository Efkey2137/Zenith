"use server";
import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { ensurePagesTable } from "@/lib/db/queries/pages";
import { pages } from "@/lib/db/schema";
import { isPageSlug } from "@/lib/pages";
import { textField } from "@/lib/validation";
import { revalidatePath } from "next/cache";
export async function savePageAction(
  _state: { success: boolean; message: string },
  data: FormData,
) {
  await requireAdmin();
  try {
    const slug = textField(data, "slug");
    if (!isPageSlug(slug))
      return { success: false, message: "Nieznana sekcja." };
    const content = textField(data, "content", 100000);
    await ensurePagesTable();
    await getDb()
      .insert(pages)
      .values({ slug, content })
      .onConflictDoUpdate({
        target: pages.slug,
        set: { content, updatedAt: new Date().toISOString() },
      });
    revalidatePath(`/${slug}`);
    revalidatePath("/admin/pages");
    return { success: true, message: "Zmiany zostały zapisane." };
  } catch {
    return {
      success: false,
      message:
        "Nie udało się zapisać sekcji. Sprawdź długość tekstu i spróbuj ponownie.",
    };
  }
}
