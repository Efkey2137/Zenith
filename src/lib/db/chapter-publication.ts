import { sql } from "drizzle-orm";
import { getDb } from ".";

export async function migrateChapterPublication(db: ReturnType<typeof getDb>) {
  const columns = await db.all<{ name: string }>(
    sql`PRAGMA table_info(chapters)`,
  );
  if (columns.some((column) => column.name === "published")) return;

  // A write transaction serializes concurrent first requests. Existing public
  // chapters stay public; future inserts default to drafts. Both changes commit
  // together, so a failed migration cannot hide the existing book.
  await db.transaction(async (tx) => {
    const current = await tx.all<{ name: string }>(
      sql`PRAGMA table_info(chapters)`,
    );
    if (current.some((column) => column.name === "published")) return;
    await tx.run(
      sql`ALTER TABLE chapters ADD COLUMN published INTEGER NOT NULL DEFAULT 0`,
    );
    await tx.run(sql`UPDATE chapters SET published = 1`);
  });
}

let ready: Promise<void> | undefined;
export function ensureChapterPublication() {
  ready ??= migrateChapterPublication(getDb()).catch((error) => {
    ready = undefined;
    throw error;
  });
  return ready;
}
