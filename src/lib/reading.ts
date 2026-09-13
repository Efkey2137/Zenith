export const READING_EVENT = "zenith:reading-change";
const fallback = new Map<string, string>();
export function readStored(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key) ?? fallback.get(key) ?? null;
  } catch {
    return fallback.get(key) ?? null;
  }
}
export function writeStored(key: string, value: string) {
  fallback.set(key, value);
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* Keep reading available when storage is blocked. */
  }
  window.dispatchEvent(new Event(READING_EVENT));
}
export function subscribeReading(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(READING_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(READING_EVENT, callback);
  };
}
export function parseProgress(value: string | null): number | null {
  if (value === null || value.trim() === "") return null;
  const ratio = Number(value);
  return Number.isFinite(ratio) ? Math.min(1, Math.max(0, ratio)) : null;
}
export type ReaderSettings = {
  size: number;
  leading: number;
  theme: "dark" | "paper";
  wide: boolean;
};
export const defaultSettings: ReaderSettings = {
  size: 19,
  leading: 1.9,
  theme: "dark",
  wide: false,
};
export function parseSettings(raw: string | null): ReaderSettings {
  try {
    const p = JSON.parse(raw ?? "{}");
    return {
      size: [17, 19, 21, 23, 25].includes(p.size) ? p.size : 19,
      leading: [1.6, 1.9, 2.2].includes(p.leading) ? p.leading : 1.9,
      theme: p.theme === "paper" ? "paper" : "dark",
      wide: p.wide === true,
    };
  } catch {
    return defaultSettings;
  }
}
