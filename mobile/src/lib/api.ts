import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Chapter, Character, Catalog } from "./models";
import { isCatalog } from "./models";

export const SITE_URL = (
  process.env.EXPO_PUBLIC_ZENITH_URL ??
  "https://zenith-git-codex-ios-test-app-efkeys-projects.vercel.app"
).replace(/\/$/, "");
const API_URL = `${SITE_URL}/api/mobile/v1`;
const cacheKey = (path: string) => `zenith:v1:${API_URL}:${path}`;
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
async function request<T>(path: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(`${API_URL}/${path}`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    if (!response.ok)
      throw new ApiError(
        response.status,
        response.status === 404
          ? "Ta treść nie jest już dostępna."
          : "Nie można teraz pobrać biblioteki.",
      );
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}
export async function fetchCatalog(): Promise<Catalog> {
  const data = await request<unknown>("catalog");
  if (!isCatalog(data))
    throw new Error("Biblioteka wymaga aktualizacji aplikacji.");
  return data;
}
export async function storeCatalog(value: Catalog) {
  try {
    await AsyncStorage.setItem(cacheKey("catalog"), JSON.stringify(value));
  } catch {
    /* Network reading remains available. */
  }
}
export async function cachedCatalog(): Promise<Catalog | null> {
  try {
    const value = JSON.parse(
      (await AsyncStorage.getItem(cacheKey("catalog"))) ?? "null",
    );
    return isCatalog(value) ? value : null;
  } catch {
    return null;
  }
}

export async function fetchChapter(slug: string) {
  return request<Chapter>(`chapters/${encodeURIComponent(slug)}`);
}
export async function fetchCharacter(slug: string) {
  return request<Character>(`characters/${encodeURIComponent(slug)}`);
}
export async function downloadedChapters(): Promise<Record<string, Chapter>> {
  try {
    const value = JSON.parse(
      (await AsyncStorage.getItem(cacheKey("downloads"))) ?? "{}",
    );
    if (!value || typeof value !== "object" || Array.isArray(value)) return {};
    return Object.fromEntries(
      Object.entries(value).filter(([slug, c]) => {
        const chapter = c as Chapter;
        return (
          chapter &&
          chapter.slug === slug &&
          typeof chapter.content === "string" &&
          typeof chapter.title === "string" &&
          typeof chapter.sagaTitle === "string"
        );
      }),
    ) as Record<string, Chapter>;
  } catch {
    return {};
  }
}
export async function saveDownloads(chapters: Record<string, Chapter>) {
  await AsyncStorage.setItem(cacheKey("downloads"), JSON.stringify(chapters));
}
