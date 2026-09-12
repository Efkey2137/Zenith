import { getDb } from "@/lib/db";
import { characters } from "@/lib/db/schema";
import { asc, eq } from "drizzle-orm";

export async function getAllCharacters() {
  return getDb()
    .select({
      slug: characters.slug,
      name: characters.name,
      fraction: characters.fraction,
      imageUrl: characters.imageUrl,
    })
    .from(characters)
    .orderBy(asc(characters.name));
}

export async function getCharacterBySlug(slug: string) {
  const result = await getDb()
    .select()
    .from(characters)
    .where(eq(characters.slug, slug))
    .limit(1);
  return result[0] ?? null;
}
