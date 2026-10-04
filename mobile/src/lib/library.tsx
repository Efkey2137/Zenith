import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  cachedCatalog,
  fetchCatalog,
  storeCatalog,
  downloadedChapters,
  saveDownloads,
} from "./api";
import {
  defaultReading,
  parseReading,
  type Catalog,
  type Chapter,
} from "./models";

function useLibraryState() {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [reading, setReading] = useState(defaultReading);
  const [downloads, setDownloads] = useState<Record<string, Chapter>>({});
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [error, setError] = useState("");
  const [storageError, setStorageError] = useState("");
  const hydrated = useRef(false);
  const activeRequest = useRef(0);
  const downloadsRef = useRef(downloads);
  const writeQueue = useRef(Promise.resolve());
  const downloadQueue = useRef(Promise.resolve());
  const changeDownloads = useCallback(
    (update: (current: Record<string, Chapter>) => Record<string, Chapter>) => {
      const pending = downloadQueue.current.then(async () => {
        const next = update(downloadsRef.current);
        await saveDownloads(next);
        downloadsRef.current = next;
        setDownloads(next);
      });
      downloadQueue.current = pending.catch(() => {});
      return pending;
    },
    [],
  );
  const invalidateRequests = useCallback(() => {
    activeRequest.current++;
  }, []);
  const refresh = useCallback(async () => {
    const id = ++activeRequest.current;
    setLoading(true);
    setError("");
    try {
      const data = await fetchCatalog();
      if (id !== activeRequest.current) return;
      setCatalog(data);
      setOffline(false);
      await storeCatalog(data);
      const visible = new Set(
        data.sagas.flatMap((s) => s.chapters.map((c) => c.slug)),
      );
      await changeDownloads((current) =>
        Object.fromEntries(Object.entries(current).filter(([slug]) => visible.has(slug))),
      );
    } catch {
      if (id !== activeRequest.current) return;
      const cached = await cachedCatalog();
      setOffline(true);
      if (cached) setCatalog(cached);
      else
        setError(
          "Nie udało się pobrać biblioteki. Sprawdź połączenie z internetem.",
        );
    } finally {
      if (id === activeRequest.current) setLoading(false);
    }
  }, [changeDownloads]);
  useEffect(() => {
    let cancelled = false;
    Promise.all([
      AsyncStorage.getItem("zenith:reading:v1").catch(() => null),
      downloadedChapters(),
    ]).then(([raw, saved]) => {
      if (cancelled) return;
      setReading(parseReading(raw));
      downloadsRef.current = saved;
      setDownloads(saved);
      hydrated.current = true;
      void refresh();
    });
    return () => {
      cancelled = true;
      invalidateRequests();
    };
  }, [refresh, invalidateRequests]);
  useEffect(() => {
    if (!hydrated.current) return;
    const timeout = setTimeout(() => {
      writeQueue.current = writeQueue.current
        .then(() =>
          AsyncStorage.setItem("zenith:reading:v1", JSON.stringify(reading)),
        )
        .catch(() => setStorageError("Brak miejsca na zapis postępu."));
    }, 200);
    return () => clearTimeout(timeout);
  }, [reading]);
  const download = useCallback((chapter: Chapter) =>
    changeDownloads((current) => ({ ...current, [chapter.slug]: chapter })), [changeDownloads]);
  const removeDownload = useCallback((slug: string) =>
    changeDownloads((current) => {
      const next = { ...current };
      delete next[slug];
      return next;
    }), [changeDownloads]);
  return {
    catalog,
    loading,
    offline,
    error,
    storageError,
    refresh,
    reading,
    setReading,
    downloads,
    download,
    removeDownload,
  };
}
const LibraryContext = createContext<ReturnType<typeof useLibraryState> | null>(
  null,
);
export function LibraryProvider({ children }: { children: ReactNode }) {
  const value = useLibraryState();
  return (
    <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
  );
}
export function useLibrary() {
  const value = useContext(LibraryContext);
  if (!value) throw new Error("Brak biblioteki");
  return value;
}
