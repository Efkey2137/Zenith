// Local, read-only relay for Expo Go. Preview access stays on the Mac.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const accessFile = fileURLToPath(new URL("../../.vercel/mobile-preview-access.json", import.meta.url));
const previewOrigin = "https://zenith-git-codex-ios-test-app-efkeys-projects.vercel.app";
const local = process.argv.includes("--local");
const origin = local ? "http://127.0.0.1:3100" : previewOrigin;
let accessUrl = "";
let cookie = "";

async function previewCookie() {
  if (local) return "";
  const saved = JSON.parse(await readFile(accessFile, "utf8"));
  const url = new URL(saved.url);
  if (url.origin !== previewOrigin || !url.searchParams.has("_vercel_share")) throw new Error("Invalid preview access");
  if (accessUrl === url.href && cookie) return cookie;
  const result = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(10000) });
  cookie = result.headers.getSetCookie().map((value) => value.split(";")[0]).join("; ");
  if (!cookie) throw new Error("Preview access expired");
  accessUrl = url.href;
  return cookie;
}

export function publicPath(path) {
  return /^\/api\/mobile\/v1\/(?:catalog|(?:chapters|characters)\/[A-Za-z0-9_-]+)$/.test(path);
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", "http://localhost");
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("X-Content-Type-Options", "nosniff");
  if (request.method !== "GET" || url.search || !publicPath(url.pathname)) {
    response.writeHead(404);
    response.end(JSON.stringify({ error: "Brak strony." }));
    return;
  }
  try {
    const auth = await previewCookie();
    const upstream = await fetch(`${origin}${url.pathname}`, {
      headers: { Accept: "application/json", ...(auth ? { Cookie: auth } : {}) },
      redirect: "manual",
      signal: AbortSignal.timeout(10000),
    });
    if (![200, 404, 503].includes(upstream.status) || !upstream.headers.get("content-type")?.includes("application/json")) {
      cookie = "";
      throw new Error("Preview unavailable");
    }
    const data = await upstream.json();
    response.writeHead(upstream.status);
    response.end(JSON.stringify(data));
  } catch {
    response.writeHead(503);
    response.end(JSON.stringify({ error: "Połączenie testowe jest niedostępne. Uruchom ponownie test na Macu." }));
  }
});
server.listen(3101, "0.0.0.0", () => console.log(`Zenith: połączenie testowe na porcie 3101 (${local ? "lokalna biblioteka" : "podgląd Vercel"}).`));
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => server.close(() => process.exit(0)));
