import test from "node:test";
import assert from "node:assert/strict";
import { getDb } from "../src/lib/db";
import {
  getAdjacentChapters,
  getAllChaptersGroupedBySaga,
} from "../src/lib/db/queries/chapters";
import { sql } from "drizzle-orm";
// The test process uses a private in-memory database, never .env.local or production.
process.env.TURSO_DATABASE_URL = ":memory:";
test("chapter navigation crosses sagas in their configured order", async () => {
  const db = getDb();
  await db.run(
    sql`CREATE TABLE sagas (id INTEGER PRIMARY KEY, slug TEXT, title TEXT, "order" INTEGER)`,
  );
  await db.run(
    sql`CREATE TABLE chapters (id INTEGER PRIMARY KEY, saga_id INTEGER, slug TEXT, title TEXT, chapter_number INTEGER)`,
  );
  await db.run(
    sql`INSERT INTO sagas VALUES (1,'later','Later',20),(2,'earlier','Earlier',10)`,
  );
  await db.run(
    sql`INSERT INTO chapters VALUES (1,1,'c','C',1),(2,2,'a','A',1),(3,2,'b','B',4)`,
  );
  assert.equal((await getAdjacentChapters(2, 4)).next?.slug, "c");
  assert.equal((await getAdjacentChapters(1, 1)).prev?.slug, "b");
  assert.equal((await getAdjacentChapters(2, 1)).prev, null);
  assert.equal((await getAdjacentChapters(1, 1)).next, null);
  assert.deepEqual(await getAdjacentChapters(99, 1), {
    prev: null,
    next: null,
  });
  assert.deepEqual(
    (await getAllChaptersGroupedBySaga()).map((s) => s.sagaSlug),
    ["earlier", "later"],
  );
});
