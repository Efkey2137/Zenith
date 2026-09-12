"use server";
import { getDb } from "@/lib/db";
import { sagas } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth";
import { textField, validSlug, ValidationError } from "@/lib/validation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
type SagaResult =
  { success: true; slug: string } | { success: false; error: string };
export async function createSagaAction(
  formData: FormData,
): Promise<SagaResult> {
  await requireAdmin();
  try {
    const title = textField(formData, "title");
    const orderRaw = textField(formData, "order");
    const description = textField(formData, "description", 10000) || null;
    if (!title || !orderRaw)
      throw new ValidationError("Tytuł i kolejność są wymagane.");
    const order = Number(orderRaw);
    if (!Number.isSafeInteger(order) || order < 0)
      throw new ValidationError(
        "Kolejność musi być nieujemną liczbą całkowitą.",
      );
    const idRaw = textField(formData, "id");
    const id = Number(idRaw);
    if (idRaw && (!Number.isSafeInteger(id) || id <= 0))
      throw new ValidationError("Nieprawidłowa saga.");
    const existing = idRaw
      ? (await getDb().select().from(sagas).where(eq(sagas.id, id)).limit(1))[0]
      : null;
    if (idRaw && !existing) throw new ValidationError("Saga już nie istnieje.");
    const slug =
      existing?.slug ?? validSlug(textField(formData, "slug"), title);
    if (existing)
      await getDb()
        .update(sagas)
        .set({ title, order, description })
        .where(eq(sagas.id, existing.id));
    else
      await getDb().insert(sagas).values({ slug, title, order, description });
    revalidatePath("/", "layout");
    return { success: true, slug };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof ValidationError
          ? err.message
          : "Nie udało się zapisać sagi. Sprawdź, czy adres jest wolny, i spróbuj ponownie.",
    };
  }
}
