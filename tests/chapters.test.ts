import test, { after } from "node:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import assert from "node:assert/strict";
import { getDb } from "../src/lib/db";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrateChapterPublication } from "../src/lib/db/chapter-publication";
import {
  saveChapterContent,
  setChapterPublication,
} from "../src/lib/db/chapter-writes";
import {
  getAdjacentChapters,
  getAllChaptersGroupedBySaga,
  getAllChapterSlugs,
  getChapterBySlug,
} from "../src/lib/db/queries/chapters";
import { sql } from "drizzle-orm";
// Private databases only: no .env.local or production credentials are loaded.
// libSQL opens a new connection after an interactive transaction, so migration
// tests use a disposable file rather than a connection-local :memory: database.
const fixtureDirectory = mkdtempSync(join(tmpdir(), "zenith-publication-"));
process.env.TURSO_DATABASE_URL = `file:${join(fixtureDirectory, "chapters.db")}`;
after(() => rmSync(fixtureDirectory, { recursive: true, force: true }));

test("publication migration preserves the existing book and author decisions", async () => {
  const db = getDb();
  await db.run(
    sql`CREATE TABLE sagas (id INTEGER PRIMARY KEY, slug TEXT, title TEXT, "order" INTEGER)`,
  );
  await db.run(
    sql`CREATE TABLE chapters (id INTEGER PRIMARY KEY, saga_id INTEGER, slug TEXT UNIQUE, title TEXT, chapter_number INTEGER, content TEXT, created_at TEXT, updated_at TEXT)`,
  );
  await db.run(
    sql`INSERT INTO sagas VALUES (1,'later','Later',20),(2,'earlier','Earlier',10)`,
  );
  await db.run(
    sql`INSERT INTO chapters (id,saga_id,slug,title,chapter_number,content) VALUES (1,1,'c','C',1,'C text'),(2,2,'a','A',1,'A text'),(3,2,'b','B',4,'Secret B text')`,
  );
  await migrateChapterPublication(db);
  assert.deepEqual(
    (
      await db.all<{ published: number }>(sql`SELECT published FROM chapters`)
    ).map((c) => c.published),
    [1, 1, 1],
  );
  assert.equal((await getAdjacentChapters(2, 4)).next?.slug, "c");
  assert.equal((await getAdjacentChapters(1, 1)).prev?.slug, "b");
  await setChapterPublication("b", false);
  await migrateChapterPublication(db);
  assert.equal(await getChapterBySlug("b"), null);
});

test("hidden chapters never appear in public lookups, catalogs or adjacent navigation", async () => {
  assert.equal(await getChapterBySlug("b"), null);
  assert.deepEqual((await getAllChapterSlugs()).map((c) => c.slug).sort(), [
    "a",
    "c",
  ]);
  const grouped = await getAllChaptersGroupedBySaga();
  assert.deepEqual(
    grouped.map((s) => s.sagaSlug),
    ["earlier", "later"],
  );
  assert.deepEqual(
    grouped.flatMap((s) => s.chapters).map((c) => c.chapterSlug),
    ["a", "c"],
  );
  assert.equal((await getAdjacentChapters(2, 1)).next?.slug, "c");
  assert.equal((await getAdjacentChapters(1, 1)).prev?.slug, "a");
  assert.deepEqual(await getAdjacentChapters(2, 4), { prev: null, next: null });
  assert.deepEqual(await getAdjacentChapters(99, 1), {
    prev: null,
    next: null,
  });
  await setChapterPublication("c", false);
  assert.deepEqual(
    (await getAllChaptersGroupedBySaga()).map((s) => s.sagaSlug),
    ["earlier"],
  );
  await setChapterPublication("c", true);
});

test("uploads default to drafts, preserve publication on replacement, and can be republished", async () => {
  const values = {
    slug: "draft",
    title: "Draft",
    sagaId: 1,
    chapterNumber: 2,
    content: "Private text",
  };
  await saveChapterContent(values);
  assert.equal(await getChapterBySlug("draft"), null);
  await saveChapterContent({ ...values, content: "Updated private text" });
  assert.equal(await getChapterBySlug("draft"), null);
  assert.equal(await setChapterPublication("draft", true), true);
  assert.equal(
    (await getChapterBySlug("draft"))?.content,
    "Updated private text",
  );
  await saveChapterContent({ ...values, content: "Updated public text" });
  assert.equal(
    (await getChapterBySlug("draft"))?.content,
    "Updated public text",
  );
  await setChapterPublication("draft", false);
  assert.equal(await getChapterBySlug("draft"), null);
  await setChapterPublication("draft", true);
  assert.equal(
    (await getChapterBySlug("draft"))?.content,
    "Updated public text",
  );
  assert.equal(await setChapterPublication("missing", true), false);
});

test("fresh databases retain the default draft status after repeated migration", async () => {
  const client = createClient({ url: ":memory:" });
  const db = drizzle(client);
  try {
    await db.run(
      sql`CREATE TABLE chapters (id INTEGER PRIMARY KEY, published INTEGER NOT NULL DEFAULT 0)`,
    );
    await db.run(sql`INSERT INTO chapters (id) VALUES (1)`);
    await migrateChapterPublication(db);
    await migrateChapterPublication(db);
    assert.deepEqual(await db.all(sql`SELECT published FROM chapters`), [
      { published: 0 },
    ]);
  } finally {
    client.close();
  }
});

test("a failed migration rolls back both the column and publication changes", async () => {
  const client = createClient({
    url: `file:${join(fixtureDirectory, "rollback.db")}`,
  });
  const db = drizzle(client);
  try {
    await db.run(
      sql`CREATE TABLE chapters (id INTEGER PRIMARY KEY, content TEXT)`,
    );
    await db.run(sql`INSERT INTO chapters VALUES (1, 'Existing text')`);
    await db.run(
      sql`CREATE TRIGGER block_migration BEFORE UPDATE ON chapters BEGIN SELECT RAISE(ABORT, 'Test failure'); END`,
    );
    await assert.rejects(migrateChapterPublication(db));
    const columns = await db.all<{ name: string }>(
      sql`PRAGMA table_info(chapters)`,
    );
    assert.equal(
      columns.some((column) => column.name === "published"),
      false,
    );
    assert.deepEqual(await db.all(sql`SELECT content FROM chapters`), [
      { content: "Existing text" },
    ]);
  } finally {
    client.close();
  }
});
