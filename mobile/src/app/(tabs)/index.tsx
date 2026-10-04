import { ScrollView, Text, View, RefreshControl } from "react-native";
import { router } from "expo-router";
import {
  ArrowUpRight,
  ChevronRight,
  Compass,
  Users,
} from "lucide-react-native";
import { useLibrary } from "@/lib/library";
import { BranchMark, BookCover } from "@/components/book-mark";
import {
  Screen,
  ui,
  colors,
  serif,
  Body,
  Button,
  LibraryStatus,
  Touch,
} from "@/components/ui";

export default function Home() {
  const { catalog, reading, loading, refresh } = useLibrary();
  const chapters = catalog?.sagas.flatMap((s) => s.chapters) ?? [];
  const last = chapters.find((c) => c.slug === reading.lastSlug);
  const current = last ?? chapters[0];
  const saga = catalog?.sagas.find((s) =>
    s.chapters.some((c) => c.slug === current?.slug),
  );
  const progress = current
    ? Math.round((reading.progress[current.slug] ?? 0) * 100)
    : 0;
  return (
    <Screen>
      {!catalog ? (
        <LibraryStatus />
      ) : (
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={() => void refresh()}
              tintColor={colors.accent}
            />
          }
          contentContainerStyle={[ui.content, { gap: 28, paddingTop: 26 }]}
        >
          <View style={[ui.row, { justifyContent: "space-between" }]}>
            <View style={{ flex: 1, gap: 6 }}>
              <Text
                accessibilityRole="header"
                style={{
                  fontFamily: serif,
                  fontSize: 48,
                  letterSpacing: -1.5,
                  color: colors.foreground,
                }}
              >
                Zenith
              </Text>
              <Text style={{ color: colors.brass, fontSize: 13 }}>
                Powieść i jej świat
              </Text>
            </View>
            <BranchMark size={74} />
          </View>
          <Text
            style={{
              fontFamily: serif,
              fontSize: 23,
              lineHeight: 32,
              color: colors.muted,
              marginTop: -8,
            }}
          >
            Kroniki mrocznego{"\n"}słowiańskiego świata.
          </Text>
          <View style={[ui.card, { gap: 20 }]}>
            <View style={[ui.row, { alignItems: "flex-start", gap: 18 }]}>
              <BookCover />
              <View style={{ flex: 1, gap: 8 }}>
                <Text style={{ fontSize: 13, color: colors.brass }}>
                  {last ? "Twoja lektura" : "Otwórz książkę"}
                </Text>
                <Text
                  style={{
                    color: colors.foreground,
                    fontFamily: serif,
                    fontSize: 24,
                    lineHeight: 31,
                  }}
                >
                  {current?.title ?? "Biblioteka Zenith"}
                </Text>
                {current && (
                  <Text
                    style={{
                      fontSize: 13,
                      lineHeight: 19,
                      color: colors.muted,
                    }}
                  >
                    {saga?.title} · Rozdział {current.number}
                  </Text>
                )}
              </View>
            </View>
            {last && (
              <View style={{ gap: 8 }}>
                <View
                  accessibilityRole="progressbar"
                  accessibilityLabel="Postęp ostatniej lektury"
                  accessibilityValue={{ min: 0, max: 100, now: progress }}
                  style={{
                    height: 3,
                    borderRadius: 2,
                    backgroundColor: colors.border,
                    overflow: "hidden",
                  }}
                >
                  <View
                    style={{
                      height: 3,
                      width: `${progress}%`,
                      backgroundColor: colors.accent,
                    }}
                  />
                </View>
                <Text style={{ fontSize: 12, color: colors.muted }}>
                  {progress}% przeczytane
                </Text>
              </View>
            )}
            <Button
              onPress={() =>
                current
                  ? router.push(`/chapter/${current.slug}`)
                  : router.push("/chapters")
              }
            >
              {last
                ? "Czytaj dalej"
                : current
                  ? "Zacznij czytać"
                  : "Otwórz bibliotekę"}
            </Button>
          </View>
          <View style={{ gap: 4 }}>
            <View style={[ui.row, { justifyContent: "space-between" }]}>
              <Text
                accessibilityRole="header"
                style={{
                  fontFamily: serif,
                  fontSize: 23,
                  color: colors.foreground,
                }}
              >
                Twoja biblioteka
              </Text>
              <Touch
                accessibilityRole="button"
                accessibilityLabel="Otwórz spis wszystkich rozdziałów"
                onPress={() => router.push("/chapters")}
                style={[ui.row, { minHeight: 44, gap: 4 }]}
              >
                <Text style={{ color: colors.accent, fontSize: 14 }}>Spis</Text>
                <ArrowUpRight size={16} color={colors.accent} />
              </Touch>
            </View>
            {catalog.sagas.map((s) => (
              <Touch
                key={s.slug}
                accessibilityRole="button"
                accessibilityLabel={`${s.title}, ${s.chapters.length} rozdziałów`}
                onPress={() =>
                  router.push({
                    pathname: "/chapters",
                    params: { saga: s.slug },
                  })
                }
                style={[ui.row, ui.divider]}
              >
                <View
                  style={{
                    width: 3,
                    height: 32,
                    backgroundColor: colors.brass,
                    borderRadius: 2,
                    marginRight: 2,
                  }}
                />
                <View style={{ flex: 1, gap: 5 }}>
                  <Text
                    style={{
                      fontFamily: serif,
                      fontSize: 20,
                      color: colors.foreground,
                    }}
                  >
                    {s.title}
                  </Text>
                  <Text style={{ fontSize: 13, color: colors.muted }}>
                    Rozdziały: {s.chapters.length}
                  </Text>
                </View>
                <ChevronRight size={18} color={colors.muted} />
              </Touch>
            ))}
            {!catalog.sagas.length && (
              <Body>Opublikowane sagi pojawią się tutaj.</Body>
            )}
          </View>
          <View style={{ gap: 16 }}>
            <Text
              accessibilityRole="header"
              style={{
                fontFamily: serif,
                fontSize: 23,
                color: colors.foreground,
              }}
            >
              Poza rozdziałami
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
              {(
                [
                  {
                    title: "Postacie",
                    detail: "Bohaterowie i historie",
                    href: "/characters",
                    Icon: Users,
                  },
                  {
                    title: "Świat",
                    detail: "Atlas i zasady mocy",
                    href: "/world",
                    Icon: Compass,
                  },
                ] as const
              ).map(({ title, detail, href, Icon }) => (
                <Touch
                  key={title}
                  accessibilityRole="button"
                  accessibilityLabel={title}
                  onPress={() => router.push(href)}
                  style={{
                    backgroundColor: colors.card,
                    borderRadius: 18,
                    padding: 18,
                    gap: 12,
                    flex: 1,
                    minWidth: 130,
                  }}
                >
                  <Icon color={colors.accent} size={23} strokeWidth={1.6} />
                  <Text
                    style={{
                      fontFamily: serif,
                      fontSize: 21,
                      color: colors.foreground,
                    }}
                  >
                    {title}
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      lineHeight: 19,
                      color: colors.muted,
                    }}
                  >
                    {detail}
                  </Text>
                </Touch>
              ))}
            </View>
          </View>
        </ScrollView>
      )}
    </Screen>
  );
}
