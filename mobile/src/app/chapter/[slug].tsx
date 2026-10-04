import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  AppState,
  ScrollView,
  Text,
  View,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Bookmark, Check, Download, Settings2 } from "lucide-react-native";
import { ApiError, fetchChapter } from "@/lib/api";
import { useLibrary } from "@/lib/library";
import { ratio, type Chapter } from "@/lib/models";
import { ChapterText } from "@/components/markdown";
import { ui, colors, serif, Body, Button, Touch } from "@/components/ui";
import { ReaderSettings } from "@/components/reader-settings";

export default function ChapterPage() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  return <LoadChapter key={slug} slug={slug} />;
}
function LoadChapter({ slug }: { slug: string }) {
  const { downloads, removeDownload } = useLibrary();
  const saved = useRef<Chapter | undefined>(downloads[slug]);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [error, setError] = useState("");
  const [offline, setOffline] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let cancelled = false;
    fetchChapter(slug)
      .then((c) => {
        if (!cancelled) {
          setChapter(c);
          setOffline(false);
        }
      })
      .catch(async (e) => {
        if (cancelled) return;
        // A confirmed withdrawal must never fall back to a saved copy online.
        if (e instanceof ApiError && e.status === 404) {
          setChapter(null);
          setError("Autor nie udostępnia teraz tego rozdziału.");
          await removeDownload(slug).catch(() => {});
          saved.current = undefined;
        } else if (saved.current) {
          setChapter(saved.current);
          setOffline(true);
        } else
          setError(
            "Nie udało się pobrać rozdziału. Sprawdź połączenie z internetem.",
          );
      });
    return () => {
      cancelled = true;
    };
  }, [slug, attempt, removeDownload]);
  if (!chapter)
    return (
      <SafeAreaView edges={["bottom", "left", "right"]} style={ui.screen}>
        <View style={[ui.content, { marginTop: 40 }]}>
          {error ? (
            <>
              <Body>{error}</Body>
              <Button
                onPress={() => {
                  setError("");
                  setAttempt((v) => v + 1);
                }}
              >
                Spróbuj ponownie
              </Button>
              <Button secondary onPress={() => router.replace("/chapters")}>
                Wróć do spisu
              </Button>
            </>
          ) : (
            <ActivityIndicator color={colors.foreground} />
          )}
        </View>
      </SafeAreaView>
    );
  return <Reader key={chapter.slug} chapter={chapter} offline={offline} />;
}

function Reader({ chapter, offline }: { chapter: Chapter; offline: boolean }) {
  const { reading, setReading, downloads, download, removeDownload } =
    useLibrary();
  const settings = reading.settings;
  const paper = settings.paper;
  const ink = paper ? "#30291f" : colors.foreground;
  const muted = paper ? "#62584a" : colors.muted;
  const background = paper ? "#eee7da" : colors.background;
  const scroll = useRef<ScrollView>(null);
  const position = useRef(reading.progress[chapter.slug] ?? 0);
  const restored = useRef(false);
  const height = useRef(0);
  const viewport = useRef(0);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const [progress, setProgress] = useState(
    () => reading.progress[chapter.slug] ?? 0,
  );
  const [showSettings, setShowSettings] = useState(false);
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const bookmark = reading.bookmarks[chapter.slug];
  const minutes = Math.max(
    1,
    Math.ceil(chapter.content.trim().split(/\s+/).length / 220),
  );
  useEffect(() => {
    function save() {
      setReading((current) => ({
        ...current,
        lastSlug: chapter.slug,
        progress: { ...current.progress, [chapter.slug]: position.current },
      }));
    }
    save();
    const subscription = AppState.addEventListener("change", (state) => {
      if (state !== "active") save();
    });
    return () => {
      clearTimeout(saveTimer.current);
      save();
      subscription.remove();
    };
  }, [chapter.slug, setReading]);
  function scrollTo(value: number) {
    const p = ratio(value);
    position.current = p;
    setProgress(p);
    scroll.current?.scrollTo({
      y: p * Math.max(0, height.current - viewport.current),
      animated: false,
    });
  }
  function restore() {
    if (restored.current || !height.current || !viewport.current) return;
    restored.current = true;
    requestAnimationFrame(() => scrollTo(position.current));
  }
  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    if (!restored.current) return;
    const range = height.current - viewport.current;
    if (range <= 0) return;
    const p = ratio(event.nativeEvent.contentOffset.y / range);
    position.current = p;
    setProgress((current) =>
      Math.round(current * 100) === Math.round(p * 100) ? current : p,
    );
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(
      () =>
        setReading((current) => ({
          ...current,
          lastSlug: chapter.slug,
          progress: { ...current.progress, [chapter.slug]: position.current },
        })),
      300,
    );
  }
  function changeSettings(update: Partial<typeof settings>) {
    if (update.size !== undefined || update.leading !== undefined)
      restored.current = false;
    setReading((current) => ({
      ...current,
      settings: { ...current.settings, ...update },
    }));
  }
  async function toggleDownload() {
    setSaving(true);
    try {
      if (downloads[chapter.slug]) {
        await removeDownload(chapter.slug);
        setNotice("Usunięto kopię z urządzenia.");
      } else {
        await download(chapter);
        setNotice("Rozdział jest dostępny bez internetu.");
      }
    } catch {
      Alert.alert(
        "Nie udało się zapisać rozdziału.",
        "Sprawdź wolne miejsce na urządzeniu.",
      );
    } finally {
      setSaving(false);
    }
  }
  function saveBookmark() {
    setReading((current) => ({
      ...current,
      bookmarks: { ...current.bookmarks, [chapter.slug]: position.current },
    }));
    setNotice("Zapisano zakładkę.");
  }
  function openBookmark() {
    if (bookmark === undefined) {
      saveBookmark();
      return;
    }
    Alert.alert(
      "Zakładka",
      `Zapisane miejsce: ${Math.round(bookmark * 100)}% rozdziału.`,
      [
        {
          text: "Wróć do zakładki",
          onPress: () => {
            scrollTo(bookmark);
            setNotice("Powrót do zakładki.");
          },
        },
        { text: "Zapisz w tym miejscu", onPress: saveBookmark },
        { text: "Anuluj", style: "cancel" },
      ],
    );
  }
  const border = paper ? "#30291f30" : colors.border;
  return (
    <SafeAreaView
      edges={["bottom", "left", "right"]}
      style={{ flex: 1, backgroundColor: background }}
    >
      <StatusBar style={paper ? "dark" : "light"} />
      <Stack.Screen
        options={{
          title: chapter.title,
          headerStyle: { backgroundColor: background },
          headerTintColor: ink,
          headerTitleStyle: { fontFamily: serif, fontSize: 16 },
        }}
      />
      <View
        accessibilityRole="progressbar"
        accessibilityLabel="Postęp czytania"
        accessibilityValue={{
          min: 0,
          max: 100,
          now: Math.round(progress * 100),
        }}
        style={{ height: 2, backgroundColor: border }}
      >
        <View
          style={{
            height: 2,
            width: `${Math.round(progress * 100)}%`,
            backgroundColor: paper ? ink : colors.accent,
          }}
        />
      </View>
      <ScrollView
        ref={scroll}
        onScroll={handleScroll}
        scrollEventThrottle={64}
        onContentSizeChange={(_w, h) => {
          height.current = h;
          restore();
        }}
        onLayout={(e) => {
          viewport.current = e.nativeEvent.layout.height;
          restore();
        }}
        contentContainerStyle={[
          ui.content,
          { paddingTop: 28, gap: 18, paddingBottom: 40 },
        ]}
      >
        {offline && (
          <Text style={{ fontSize: 13, color: muted }}>
            Pobrana kopia · czytasz bez połączenia
          </Text>
        )}
        <Text
          style={{
            fontSize: 13,
            lineHeight: 20,
            color: paper ? muted : colors.brass,
          }}
        >
          {chapter.sagaTitle} · Rozdział {chapter.number}
        </Text>
        <Text
          accessibilityRole="header"
          selectable
          style={{
            fontFamily: serif,
            fontSize: 35,
            lineHeight: 44,
            letterSpacing: -0.5,
            color: ink,
          }}
        >
          {chapter.title}
        </Text>
        <Text style={{ fontSize: 13, color: muted, marginBottom: 12 }}>
          Około {minutes} min czytania
        </Text>
        <ChapterText
          content={chapter.content}
          size={settings.size}
          leading={settings.leading}
          paper={paper}
        />
        <Touch
          accessibilityRole="button"
          accessibilityLabel="Oznacz jako przeczytany"
          onPress={() => {
            scrollTo(1);
            setReading((current) => ({
              ...current,
              progress: { ...current.progress, [chapter.slug]: 1 },
            }));
            setNotice("Rozdział oznaczony jako przeczytany.");
          }}
          style={[
            ui.row,
            {
              minHeight: 52,
              padding: 16,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: border,
              justifyContent: "center",
            },
          ]}
        >
          <Check size={18} color={ink} />
          <Text style={{ color: ink, fontSize: 15, flexShrink: 1 }}>
            Oznacz jako przeczytany
          </Text>
        </Touch>
        <View
          style={{
            gap: 20,
            borderTopWidth: 1,
            borderColor: border,
            paddingTop: 24,
          }}
        >
          {chapter.previous && (
            <Touch
              accessibilityRole="button"
              onPress={() =>
                router.replace(`/chapter/${chapter.previous!.slug}`)
              }
              style={{ minHeight: 52, gap: 8 }}
            >
              <Text style={{ fontSize: 13, color: muted }}>
                Poprzedni rozdział
              </Text>
              <Text
                style={{
                  fontFamily: serif,
                  fontSize: 21,
                  lineHeight: 29,
                  color: ink,
                }}
              >
                ← {chapter.previous.title}
              </Text>
            </Touch>
          )}
          {chapter.next ? (
            <Touch
              accessibilityRole="button"
              onPress={() => router.replace(`/chapter/${chapter.next!.slug}`)}
              style={{ minHeight: 52, gap: 8 }}
            >
              <Text style={{ fontSize: 13, color: muted }}>
                Następny rozdział
              </Text>
              <Text
                style={{
                  fontFamily: serif,
                  fontSize: 21,
                  lineHeight: 29,
                  color: ink,
                }}
              >
                {chapter.next.title} →
              </Text>
            </Touch>
          ) : (
            <Text style={{ color: muted }}>
              Jesteś na końcu opublikowanej historii.
            </Text>
          )}
          <Touch
            accessibilityRole="button"
            onPress={() => router.replace("/chapters")}
            style={{ minHeight: 44, justifyContent: "center" }}
          >
            <Text style={{ color: muted, fontSize: 15 }}>Wróć do spisu →</Text>
          </Touch>
        </View>
      </ScrollView>
      <View
        style={{
          borderTopWidth: 1,
          borderColor: border,
          paddingHorizontal: 20,
          paddingTop: 10,
          paddingBottom: 4,
          gap: 6,
          backgroundColor: background,
        }}
      >
        <View
          style={[ui.row, { justifyContent: "space-between", minHeight: 21 }]}
        >
          <Text
            accessibilityLiveRegion="polite"
            style={{ color: muted, fontSize: 12, flex: 1 }}
          >
            {notice ||
              (bookmark !== undefined
                ? `Zakładka: ${Math.round(bookmark * 100)}%`
                : "Miejsce zapisuje się automatycznie")}
          </Text>
          <Text
            style={{
              color: muted,
              fontSize: 12,
              fontVariant: ["tabular-nums"],
            }}
          >
            {Math.round(progress * 100)}%
          </Text>
        </View>
        <View style={[ui.row, { gap: 6 }]}>
          <Touch
            accessibilityRole="button"
            accessibilityLabel="Ustawienia czytania"
            accessibilityState={{ expanded: showSettings }}
            onPress={() => setShowSettings(true)}
            style={{
              flex: 1,
              minHeight: 54,
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
            }}
          >
            <Settings2 size={21} color={ink} />
            <Text style={{ color: muted, fontSize: 12 }}>Wygląd</Text>
          </Touch>
          <Touch
            accessibilityRole="button"
            accessibilityLabel={
              bookmark === undefined
                ? "Zapisz zakładkę w tym miejscu"
                : "Otwórz zapisaną zakładkę"
            }
            onPress={openBookmark}
            style={{
              flex: 1,
              minHeight: 54,
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
            }}
          >
            <Bookmark
              size={21}
              color={ink}
              fill={bookmark !== undefined ? ink : "none"}
            />
            <Text style={{ color: muted, fontSize: 12 }}>Zakładka</Text>
          </Touch>
          <Touch
            accessibilityRole="button"
            accessibilityLabel={
              downloads[chapter.slug]
                ? "Usuń pobraną kopię"
                : "Pobierz do czytania offline"
            }
            disabled={saving}
            onPress={() => void toggleDownload()}
            style={{
              flex: 1,
              minHeight: 54,
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
            }}
          >
            {saving ? (
              <ActivityIndicator size="small" color={ink} />
            ) : downloads[chapter.slug] ? (
              <Check size={21} color={ink} />
            ) : (
              <Download size={21} color={ink} />
            )}
            <Text style={{ color: muted, fontSize: 12 }}>
              {saving
                ? "Zapis…"
                : downloads[chapter.slug]
                  ? "Pobrano"
                  : "Pobierz"}
            </Text>
          </Touch>
        </View>
      </View>
      <ReaderSettings
        visible={showSettings}
        settings={settings}
        onChange={changeSettings}
        onClose={() => setShowSettings(false)}
      />
    </SafeAreaView>
  );
}
