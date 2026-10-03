import { config } from "dotenv";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrateChapterPublication } from "../src/lib/db/chapter-publication";
config({ path: ".env.local", quiet: true });
if (!process.env.TURSO_DATABASE_URL)
  throw new Error("Ustaw TURSO_DATABASE_URL w .env.local.");
const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});
// Additive and repeatable: existing chapters, characters and sagas are never replaced.
await client.batch(
  [
    `CREATE TABLE IF NOT EXISTS sagas (id INTEGER PRIMARY KEY AUTOINCREMENT, slug TEXT NOT NULL UNIQUE, title TEXT NOT NULL, "order" INTEGER NOT NULL, description TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')))`,
    `CREATE TABLE IF NOT EXISTS chapters (id INTEGER PRIMARY KEY AUTOINCREMENT, saga_id INTEGER NOT NULL REFERENCES sagas(id), slug TEXT NOT NULL UNIQUE, title TEXT NOT NULL, chapter_number INTEGER NOT NULL, content TEXT NOT NULL, published INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')))`,
    `CREATE TABLE IF NOT EXISTS characters (id INTEGER PRIMARY KEY AUTOINCREMENT, slug TEXT NOT NULL UNIQUE, name TEXT NOT NULL, fraction TEXT, image_url TEXT, bio TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')))`,
    `CREATE TABLE IF NOT EXISTS pages (slug TEXT PRIMARY KEY, content TEXT NOT NULL, updated_at TEXT NOT NULL DEFAULT (datetime('now')))`,
  ],
  "write",
);
await migrateChapterPublication(drizzle(client));
client.close();
console.log("Struktura bazy gotowa. Istniejące treści zachowane.");
