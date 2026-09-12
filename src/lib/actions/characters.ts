"use server";
import { getDb } from "@/lib/db";
import { characters } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth";
import { textField, validSlug, ValidationError } from "@/lib/validation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { put, del } from "@vercel/blob";

type CharacterResult =
  { success: true; slug: string } | { success: false; error: string };
export async function createCharacterAction(
  formData: FormData,
): Promise<CharacterResult> {
  await requireAdmin();
  let uploadedUrl: string | undefined;
  let saved = false;
  try {
    const name = textField(formData, "name");
    const bio = textField(formData, "bio", 100000);
    const fraction = textField(formData, "faction") || null;
    if (!name || !bio)
      throw new ValidationError("Imię i biografia są wymagane.");
    const recordId = textField(formData, "id");
    const id = Number(recordId);
    if (recordId && (!Number.isSafeInteger(id) || id <= 0))
      throw new ValidationError("Nieprawidłowa postać.");
    const existing = recordId
      ? (
          await getDb()
            .select()
            .from(characters)
            .where(eq(characters.id, id))
            .limit(1)
        )[0]
      : null;
    if (recordId && !existing)
      throw new ValidationError("Ta postać już nie istnieje.");
    const slug = existing?.slug ?? validSlug(textField(formData, "slug"), name);
    let imageUrl =
      formData.get("removeImage") === "on"
        ? null
        : (existing?.imageUrl ?? null);
    const file = formData.get("image");
    if (file instanceof File && file.size > 0) {
      if (file.size > 2 * 1024 * 1024)
        throw new ValidationError("Portret może mieć maksymalnie 2 MB.");
      const bytes = Buffer.from(await file.arrayBuffer());
      const head = Buffer.from(bytes.subarray(0, 12));
      const ext = head
        .subarray(0, 8)
        .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
        ? "png"
        : head[0] === 255 && head[1] === 216 && head[2] === 255
          ? "jpg"
          : head.toString("ascii", 0, 4) === "RIFF" &&
              head.toString("ascii", 8, 12) === "WEBP"
            ? "webp"
            : null;
      if (!ext) throw new ValidationError("Wybierz obraz JPG, PNG lub WebP.");
      if (!process.env.BLOB_READ_WRITE_TOKEN && !process.env.BLOB_STORE_ID)
        throw new ValidationError(
          "Magazyn portretów nie jest jeszcze skonfigurowany. Możesz zapisać postać bez obrazu.",
        );
      const blob = await put(`characters/${slug}.${ext}`, bytes, {
        access: "public",
        addRandomSuffix: true,
        contentType: ext === "jpg" ? "image/jpeg" : `image/${ext}`,
      });
      uploadedUrl = blob.url;
      imageUrl = blob.url;
    }
    const values = { name, fraction, bio, imageUrl };
    if (existing)
      await getDb()
        .update(characters)
        .set({ ...values, updatedAt: new Date().toISOString() })
        .where(eq(characters.id, existing.id));
    else
      await getDb()
        .insert(characters)
        .values({ ...values, slug });
    saved = true;
    revalidatePath("/characters");
    revalidatePath(`/characters/${slug}`);
    revalidatePath("/admin/characters");
    return { success: true, slug };
  } catch (error) {
    if (uploadedUrl && !saved) await del(uploadedUrl).catch(() => undefined);
    const message =
      error instanceof ValidationError
        ? error.message
        : "Nie udało się zapisać postaci. Sprawdź, czy adres nie jest już zajęty, i spróbuj ponownie.";
    return { success: false, error: message };
  }
}
