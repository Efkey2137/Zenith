import { eq, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { pages } from "@/lib/db/schema";

export async function ensurePagesTable() {
  await getDb().run(
    sql`CREATE TABLE IF NOT EXISTS pages (slug TEXT PRIMARY KEY, content TEXT NOT NULL, updated_at TEXT NOT NULL DEFAULT (datetime('now')))`,
  );
}
export async function getPage(slug: string) {
  try {
    const [page] = await getDb()
      .select()
      .from(pages)
      .where(eq(pages.slug, slug))
      .limit(1);
    return page ?? null;
  } catch (error) {
    // Existing installations gain the optional table on their first authenticated save.
    // Do not disguise connectivity or other database errors as an empty section.
    let cause: unknown = error;
    for (let depth = 0; depth < 4 && cause instanceof Error; depth++) {
      if (/no such table: (?:main\.)?pages\b/i.test(cause.message)) return null;
      cause = cause.cause;
    }
    throw error;
  }
}
