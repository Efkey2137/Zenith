import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";

let database: ReturnType<typeof drizzle> | undefined;

export function getDb() {
  if (!database) {
    if (!process.env.TURSO_DATABASE_URL)
      throw new Error("Brak konfiguracji bazy danych.");
    database = drizzle(
      createClient({
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN,
      }),
    );
  }
  return database;
}
