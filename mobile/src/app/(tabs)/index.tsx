import {
  ScrollView,
  Text,
  View,
  RefreshControl,
  Pressable,
} from "react-native";
import { router } from "expo-router";
import { ArrowRight, BookOpen, Compass, Users } from "lucide-react-native";
import { useLibrary } from "@/lib/library";
import {
  Screen,
  ui,
  colors,
  serif,
  Eyebrow,
  Body,
  Button,
  LibraryStatus,
} from "@/components/ui";
export default function Home() {
  const { catalog, reading, loading, refresh } = useLibrary();
  const chapters = catalog?.sagas.flatMap((s) => s.chapters) ?? [];
  const first = chapters[0];
  const last = chapters.find((c) => c.slug === reading.lastSlug);
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
              tintColor={colors.foreground}
            />
          }
          contentContainerStyle={[ui.content, { paddingTop: 48 }]}
        >
          <Eyebrow>Powieść i jej świat</Eyebrow>
          <Text
            accessibilityRole="header"
            style={{
              fontFamily: serif,
              fontSize: 60,
              letterSpacing: 7,
              color: colors.foreground,
              marginTop: 10,
            }}
          >
            ZENITH
          </Text>
          <Text
            style={{
              fontFamily: serif,
              fontSize: 25,
              lineHeight: 35,
              color: colors.muted,
            }}
          >
            Kroniki mrocznego{"\n"}słowiańskiego świata.
          </Text>
          <Button
            onPress={() =>
              first
                ? router.push(`/chapter/${first.slug}`)
                : router.push("/chapters")
            }
          >
            {first ? "Zacznij czytać  →" : "Przejdź do rozdziałów  →"}
          </Button>
          <Text style={{ color: colors.muted, fontSize: 12 }}>
            Rozdziały: {chapters.length} · Sagi: {catalog.sagas.length}
          </Text>
          {last && (
            <View style={[ui.card, { marginTop: 12 }]}>
              <Eyebrow>Twoja ostatnia lektura</Eyebrow>
              <Text
                style={{
                  fontFamily: serif,
                  fontSize: 23,
                  color: colors.foreground,
                }}
              >
                {last.title}
              </Text>
              <Body>
                {Math.round((reading.progress[last.slug] ?? 0) * 100)}%
                przeczytane
              </Body>
              <Button
                secondary
                onPress={() => router.push(`/chapter/${last.slug}`)}
              >
                Wróć do lektury →
              </Button>
            </View>
          )}
          <Eyebrow>Poznaj Zenith</Eyebrow>
          {(
            [
              {
                title: "Rozdziały",
                text: "Kolejne sagi, jeden spis.",
                href: "/chapters",
                Icon: BookOpen,
              },
              {
                title: "Postacie",
                text: "Bohaterowie i ich historie.",
                href: "/characters",
                Icon: Users,
              },
              {
                title: "Świat",
                text: "Atlas i zasady mocy.",
                href: "/world",
                Icon: Compass,
              },
            ] as const
          ).map(({ title, text, href, Icon }) => (
            <Pressable
              key={title}
              accessibilityRole="button"
              accessibilityLabel={title}
              onPress={() => router.push(href)}
              style={ui.card}
            >
              <View style={ui.row}>
                <Icon color={colors.muted} size={20} strokeWidth={1.3} />
                <Text
                  style={{
                    fontFamily: serif,
                    fontSize: 24,
                    color: colors.foreground,
                    flex: 1,
                  }}
                >
                  {title}
                </Text>
                <ArrowRight color={colors.muted} size={18} />
              </View>
              <Body>{text}</Body>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </Screen>
  );
}
