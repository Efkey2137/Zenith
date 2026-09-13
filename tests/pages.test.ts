import test from "node:test";
import assert from "node:assert/strict";
import { getDb } from "../src/lib/db";
import { getPage, ensurePagesTable } from "../src/lib/db/queries/pages";
import { sql } from "drizzle-orm";
process.env.TURSO_DATABASE_URL = ":memory:";
test("an existing installation can open sections before its first save", async () => {
  assert.equal(await getPage("world"), null);
  await ensurePagesTable();
  await getDb().run(
    sql`INSERT INTO pages (slug, content) VALUES ('world','Existing content')`,
  );
  await ensurePagesTable();
  assert.equal((await getPage("world"))?.content, "Existing content");
});
