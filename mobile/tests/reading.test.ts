import test from "node:test";
import assert from "node:assert/strict";
import {
  parseReading,
  defaultReading,
  normalize,
  isCatalog,
} from "../src/lib/models";
test("invalid saved reading state cannot break the reader", () => {
  assert.deepEqual(parseReading("invalid"), defaultReading);
  assert.deepEqual(parseReading("null"), defaultReading);
  const reading = parseReading(
    JSON.stringify({
      progress: { a: 3, b: -2, c: "bad" },
      bookmarks: { a: 0.7 },
      settings: { size: 99, leading: 0, paper: true },
    }),
  );
  assert.deepEqual(reading.progress, { a: 1, b: 0 });
  assert.equal(reading.bookmarks.a, 0.7);
  assert.deepEqual(reading.settings, { size: 19, leading: 1.9, paper: true });
});
test("Polish search matches titles without diacritics", () => {
  assert.equal(normalize("  Ślad Łowcy  "), "slad lowcy");
});
test("cached catalogs require supported schema and chapter metadata", () => {
  const catalog = {
    version: 1,
    sagas: [
      {
        slug: "saga",
        title: "Saga",
        chapters: [{ slug: "c", title: "Chapter", number: 1 }],
      },
    ],
    characters: [],
    sections: [],
  };
  assert.equal(isCatalog(catalog), true);
  assert.equal(isCatalog({ ...catalog, version: 2 }), false);
  assert.equal(isCatalog({ ...catalog, sagas: [{ chapters: [{}] }] }), false);
  assert.equal(isCatalog(null), false);
});
