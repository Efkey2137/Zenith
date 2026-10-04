import {
  ScrollView,
  Text,
  View,
  Linking,
  Alert,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import {
  ChevronRight,
  Map,
  Sparkles,
  Feather,
  Download,
  ArrowUpRight,
} from "lucide-react-native";
import { useLibrary } from "@/lib/library";
import { SITE_URL } from "@/lib/api";
import {
  Screen,
  ui,
  colors,
  serif,
  Title,
  Body,
  LibraryStatus,
  Touch,
} from "@/components/ui";

export default function World() {
  const { catalog, loading, refresh, downloads, removeDownload } = useLibrary();
  return (
    <Screen>
      {!catalog ? (
        <LibraryStatus />
      ) : (
        <ScrollView
          contentContainerStyle={ui.content}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={() => void refresh()}
              tintColor={colors.accent}
            />
          }
        >
          <Title>Świat Zenith</Title>
          <Body>Odkrywaj opowieść poza rozdziałami.</Body>
          <View style={{ marginTop: 4 }}>
            {catalog.sections.map((s) => {
              const Icon =
                s.slug === "world"
                  ? Map
                  : s.slug === "power-system"
                    ? Sparkles
                    : Feather;
              return (
                <Touch
                  key={s.slug}
                  accessibilityRole="button"
                  accessibilityLabel={s.title}
                  onPress={() => router.push(`/section/${s.slug}`)}
                  style={[
                    ui.row,
                    ui.divider,
                    { alignItems: "flex-start", gap: 16 },
                  ]}
                >
                  <View
                    style={{
                      padding: 13,
                      borderRadius: 14,
                      backgroundColor: colors.card,
                    }}
                  >
                    <Icon size={24} color={colors.brass} strokeWidth={1.5} />
                  </View>
                  <View style={{ flex: 1, gap: 8 }}>
                    <Text
                      style={{
                        fontFamily: serif,
                        fontSize: 24,
                        lineHeight: 31,
                        color: colors.foreground,
                      }}
                    >
                      {s.title}
                    </Text>
                    <Text
                      style={{
                        fontSize: 15,
                        lineHeight: 23,
                        color: colors.muted,
                      }}
                    >
                      {s.description}
                    </Text>
                  </View>
                  <ChevronRight
                    size={17}
                    color={colors.muted}
                    style={{ marginTop: 17 }}
                  />
                </Touch>
              );
            })}
          </View>
          <View style={{ gap: 12, marginTop: 18 }}>
            <Text
              accessibilityRole="header"
              style={{ fontSize: 14, fontWeight: "600", color: colors.muted }}
            >
              Twoja biblioteka
            </Text>
            <View
              style={{
                backgroundColor: colors.card,
                borderRadius: 18,
                paddingHorizontal: 18,
              }}
            >
              <Touch
                accessibilityRole="button"
                accessibilityLabel="Otwórz panel autora w przeglądarce"
                onPress={() =>
                  void Linking.openURL(`${SITE_URL}/admin`).catch(() =>
                    Alert.alert("Nie udało się otworzyć panelu."),
                  )
                }
                style={[ui.row, { minHeight: 76, paddingVertical: 16 }]}
              >
                <Feather size={21} color={colors.accent} />
                <View style={{ flex: 1, gap: 5 }}>
                  <Text
                    style={{
                      color: colors.foreground,
                      fontSize: 16,
                      fontWeight: "500",
                    }}
                  >
                    Panel autora
                  </Text>
                  <Text
                    style={{
                      color: colors.muted,
                      fontSize: 13,
                      lineHeight: 19,
                    }}
                  >
                    Dodawanie treści i publikacja na stronie
                  </Text>
                </View>
                <ArrowUpRight size={18} color={colors.muted} />
              </Touch>
              {!!Object.keys(downloads).length && (
                <Touch
                  accessibilityRole="button"
                  accessibilityLabel="Usuń pobrane kopie z telefonu"
                  onPress={() =>
                    Alert.alert(
                      "Usuń pobrane kopie?",
                      "Tekst na stronie i Twój postęp pozostaną zachowane.",
                      [
                        { text: "Anuluj", style: "cancel" },
                        {
                          text: "Usuń z telefonu",
                          style: "destructive",
                          onPress: () => {
                            void (async () => {
                              for (const slug of Object.keys(downloads))
                                await removeDownload(slug);
                            })().catch(() =>
                              Alert.alert("Nie udało się usunąć kopii."),
                            );
                          },
                        },
                      ],
                    )
                  }
                  style={[
                    ui.row,
                    {
                      borderTopWidth: 1,
                      borderColor: colors.border,
                      minHeight: 76,
                      paddingVertical: 16,
                    },
                  ]}
                >
                  <Download size={21} color={colors.accent} />
                  <View style={{ flex: 1, gap: 5 }}>
                    <Text
                      style={{
                        color: colors.foreground,
                        fontSize: 16,
                        fontWeight: "500",
                      }}
                    >
                      Pobrane rozdziały: {Object.keys(downloads).length}
                    </Text>
                    <Text style={{ color: colors.muted, fontSize: 13 }}>
                      Usuń kopie z urządzenia
                    </Text>
                  </View>
                  <ChevronRight size={17} color={colors.muted} />
                </Touch>
              )}
            </View>
          </View>
        </ScrollView>
      )}
    </Screen>
  );
}
