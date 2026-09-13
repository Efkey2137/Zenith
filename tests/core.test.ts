import test from "node:test";
import assert from "node:assert/strict";
import { parseChapterFile } from "../src/lib/parsers/chapter-parser";
import { validSlug, normalizeSearch } from "../src/lib/validation";
import { parseProgress, parseSettings } from "../src/lib/reading";
import {
  signSession,
  verifySession,
  SESSION_SECONDS,
} from "../src/lib/auth/session";
const source = (header: string, content = "Treść rozdziału.") =>
  `---\n${header}\n---\n\n${content}`;
const header = "title: Próba\nchapterNumber: 1\nsaga: test-saga";
test("imports YAML with BOM and CRLF without changing the story", () => {
  const parsed = parseChapterFile(
    "\uFEFF" +
      source(header, "Akapit pierwszy.\n\nAkapit drugi.").replaceAll(
        "\n",
        "\r\n",
      ),
    "fallback",
  );
  assert.deepEqual(parsed, {
    slug: "proba",
    title: "Próba",
    chapterNumber: 1,
    sagaSlug: "test-saga",
    content: "Akapit pierwszy.\n\nAkapit drugi.",
  });
});
test("rejects missing, fractional, negative and infinite chapter numbers", () => {
  for (const number of ["", "-1", "1.5", ".inf", "null", "[]", "true"])
    assert.throws(() =>
      parseChapterFile(
        source(`title: Próba\nchapterNumber: ${number}\nsaga: test`),
        "fallback",
      ),
    );
  assert.throws(() =>
    parseChapterFile(source("title: Próba\nsaga: test"), "fallback"),
  );
});
test("allows chapter zero and filename title fallback", () => {
  assert.equal(
    parseChapterFile(source("chapterNumber: 0\nsaga: test"), "Prolog")
      .chapterNumber,
    0,
  );
});
test("rejects empty content and malformed metadata", () => {
  for (const input of [
    source(header, ""),
    source(header.replace("Próba", "[]")),
    source(header.replace("test-saga", "../test")),
    source(header + "\nslug: []"),
  ])
    assert.throws(() => parseChapterFile(input, "fallback"));
});
test("rejects executable frontmatter before the parser is called", () => {
  assert.throws(() =>
    parseChapterFile(
      '---javascript\n({title:"x",chapterNumber:1,saga:"test"})\n---\nText',
      "fallback",
    ),
  );
  assert.throws(() =>
    parseChapterFile(
      '---js\nthrow new Error("executed")\n---\nText',
      "fallback",
    ),
  );
});
test("rejects URL and path injection in slugs", () => {
  for (const slug of [
    "../x",
    "x/y",
    "javascript:alert(1)",
    "a?b",
    "%2f",
    "a".repeat(161),
  ])
    assert.throws(() => validSlug(slug));
});
test("search ignores Polish diacritics and letter case", () => {
  assert.equal(normalizeSearch("  Żółć ŁĄKA "), "zolc laka");
});
test("reading state survives corrupted and out-of-range values", () => {
  assert.equal(parseProgress("NaN"), null);
  assert.equal(parseProgress("Infinity"), null);
  assert.equal(parseProgress(""), null);
  assert.equal(parseProgress("-1"), 0);
  assert.equal(parseProgress("2"), 1);
  assert.equal(parseProgress("0.42"), 0.42);
  for (const value of [
    "null",
    "{broken",
    '{"size":999,"leading":0,"theme":"evil"}',
  ])
    assert.equal(parseSettings(value).size, 19);
});
test("valid sessions expire and cannot be modified or reused after password rotation", () => {
  const secret = "test-only-secret-with-more-than-24-characters";
  const now = 1900000000000;
  const token = signSession(secret, now);
  assert.equal(verifySession(token, secret, now), true);
  assert.equal(
    verifySession(token, secret, now + SESSION_SECONDS * 1000),
    false,
  );
  assert.equal(verifySession(token, secret + "rotated", now), false);
  assert.equal(
    verifySession(token.replace(/^\d+/, String(now + 10000)), secret, now),
    false,
  );
  assert.equal(verifySession(token + ".extra", secret, now), false);
  assert.equal(verifySession(undefined, secret, now), false);
  assert.equal(verifySession(signSession("short", now), "short", now), false);
});
