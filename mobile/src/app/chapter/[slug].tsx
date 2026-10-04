import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  AppState,
  Pressable,
  ScrollView,
  Text,
  View,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  Bookmark,
  Check,
  Download,
  Minus,
  Plus,
  Settings2,
} from "lucide-react-native";
import { ApiError, fetchChapter } from "@/lib/api";
import { useLibrary } from "@/lib/library";
import { ratio, type Chapter } from "@/lib/models";
import { ChapterText } from "@/components/markdown";
import { ui, colors, serif, Eyebrow, Body, Button } from "@/components/ui";

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
        style={{
          height: 2,
          backgroundColor: paper ? "#30291f30" : colors.border,
        }}
      >
        <View
          style={{
            height: 2,
            width: `${Math.round(progress * 100)}%`,
            backgroundColor: ink,
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
          { paddingTop: 30, gap: 18, paddingBottom: 50 },
        ]}
      >
        {offline && (
          <Text style={{ fontSize: 12, color: muted }}>
            Pobrana kopia · czytasz bez połączenia
          </Text>
        )}
        <Text style={[ui.eyebrow, { color: muted }]}>
          {chapter.sagaTitle} · Rozdział {chapter.number}
        </Text>
        <Text
          accessibilityRole="header"
          selectable
          style={{
            fontFamily: serif,
            fontSize: 34,
            lineHeight: 43,
            color: ink,
          }}
        >
          {chapter.title}
        </Text>
        <Text style={{ fontSize: 12, color: muted }}>
          Około {minutes} min czytania · {Math.round(progress * 100)}%
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ustawienia czytania"
          accessibilityState={{ expanded: showSettings }}
          onPress={() => setShowSettings(!showSettings)}
          style={[
            ui.row,
            {
              minHeight: 48,
              borderTopWidth: 1,
              borderBottomWidth: 1,
              borderColor: paper ? "#30291f30" : colors.border,
            },
          ]}
        >
          <Settings2 size={17} color={muted} />
          <Text style={{ color: muted, fontSize: 14 }}>
            Ustawienia czytania
          </Text>
        </Pressable>
        {showSettings && (
          <View style={{ gap: 16 }}>
            <Text style={{ color: muted }}>Wielkość tekstu</Text>
            <View style={ui.row}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Zmniejsz tekst"
                disabled={settings.size <= 17}
                onPress={() => changeSettings({ size: settings.size - 2 })}
                style={{ padding: 14, opacity: settings.size <= 17 ? 0.4 : 1 }}
              >
                <Minus color={ink} size={18} />
              </Pressable>
              <Text style={{ color: ink }}>{settings.size}</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Powiększ tekst"
                disabled={settings.size >= 25}
                onPress={() => changeSettings({ size: settings.size + 2 })}
                style={{ padding: 14, opacity: settings.size >= 25 ? 0.4 : 1 }}
              >
                <Plus color={ink} size={18} />
              </Pressable>
            </View>
            <Text style={{ color: muted }}>Odstępy między wierszami</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {([1.6, 1.9, 2.2] as const).map((value, i) => (
                <Pressable
                  key={value}
                  accessibilityRole="button"
                  accessibilityState={{ selected: settings.leading === value }}
                  onPress={() => changeSettings({ leading: value })}
                  style={{
                    padding: 13,
                    borderWidth: 1,
                    borderColor: settings.leading === value ? ink : muted,
                  }}
                >
                  <Text style={{ color: ink }}>
                    {["Zwarte", "Zwykłe", "Szerokie"][i]}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={paper ? "Ciemne tło" : "Jasny papier"}
              onPress={() => changeSettings({ paper: !paper })}
              style={{ padding: 14, borderWidth: 1, borderColor: muted }}
            >
              <Text style={{ color: ink }}>
                {paper ? "Ciemne tło" : "Jasny papier"}
              </Text>
            </Pressable>
          </View>
        )}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Zapisz zakładkę"
            onPress={() => {
              setReading((current) => ({
                ...current,
                bookmarks: {
                  ...current.bookmarks,
                  [chapter.slug]: position.current,
                },
              }));
              setNotice("Zapisano zakładkę.");
            }}
            style={[
              ui.row,
              {
                padding: 12,
                minHeight: 48,
                borderWidth: 1,
                borderColor: muted,
              },
            ]}
          >
            <Bookmark size={15} color={ink} />
            <Text style={{ color: ink }}>Zakładka</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              downloads[chapter.slug]
                ? "Usuń pobraną kopię"
                : "Pobierz do czytania offline"
            }
            disabled={saving}
            onPress={() => void toggleDownload()}
            style={[
              ui.row,
              {
                padding: 12,
                minHeight: 48,
                borderWidth: 1,
                borderColor: muted,
                opacity: saving ? 0.4 : 1,
              },
            ]}
          >
            <Download size={15} color={ink} />
            <Text style={{ color: ink }}>
              {saving
                ? "Zapisywanie…"
                : downloads[chapter.slug]
                  ? "Pobrano ✓"
                  : "Pobierz"}
            </Text>
          </Pressable>
        </View>
        {bookmark !== undefined && (
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              scrollTo(bookmark);
              setNotice("Powrót do zakładki.");
            }}
            style={{ minHeight: 44, justifyContent: "center" }}
          >
            <Text style={{ color: muted }}>
              Wróć do zakładki ({Math.round(bookmark * 100)}%) →
            </Text>
          </Pressable>
        )}
        {!!notice && (
          <Text
            accessibilityLiveRegion="polite"
            style={{ color: muted, fontSize: 12 }}
          >
            {notice}
          </Text>
        )}
        <ChapterText
          content={chapter.content}
          size={settings.size}
          leading={settings.leading}
          paper={paper}
        />
        <Pressable
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
            { minHeight: 48, padding: 12, borderWidth: 1, borderColor: muted },
          ]}
        >
          <Check size={16} color={ink} />
          <Text style={{ color: ink }}>Oznacz jako przeczytany</Text>
        </Pressable>
        <View
          style={{
            gap: 20,
            borderTopWidth: 1,
            borderColor: muted,
            paddingTop: 24,
          }}
        >
          {chapter.previous && (
            <Pressable
              accessibilityRole="button"
              onPress={() =>
                router.replace(`/chapter/${chapter.previous!.slug}`)
              }
              style={{ minHeight: 48, gap: 8 }}
            >
              <Eyebrow>Poprzedni rozdział</Eyebrow>
              <Text style={{ fontFamily: serif, fontSize: 19, color: ink }}>
                ← {chapter.previous.title}
              </Text>
            </Pressable>
          )}
          {chapter.next ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => router.replace(`/chapter/${chapter.next!.slug}`)}
              style={{ minHeight: 48, gap: 8 }}
            >
              <Eyebrow>Następny rozdział</Eyebrow>
              <Text style={{ fontFamily: serif, fontSize: 19, color: ink }}>
                {chapter.next.title} →
              </Text>
            </Pressable>
          ) : (
            <Text style={{ color: muted }}>
              Jesteś na końcu opublikowanej historii.
            </Text>
          )}
          <Pressable
            accessibilityRole="button"
            onPress={() => router.replace("/chapters")}
            style={{ minHeight: 44 }}
          >
            <Text style={{ color: muted }}>Wróć do spisu →</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
