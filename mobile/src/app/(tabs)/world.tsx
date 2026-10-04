import {
  ScrollView,
  Pressable,
  Text,
  View,
  Linking,
  Alert,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { ArrowRight } from "lucide-react-native";
import { useLibrary } from "@/lib/library";
import { SITE_URL } from "@/lib/api";
import {
  Screen,
  ui,
  colors,
  serif,
  Eyebrow,
  Title,
  Body,
  Button,
  LibraryStatus,
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
              tintColor={colors.foreground}
            />
          }
        >
          <Eyebrow>Kompendium</Eyebrow>
          <Title>Świat Zenith</Title>
          <Body>Odkrywaj opowieść poza rozdziałami.</Body>
          {catalog.sections.map((s) => (
            <Pressable
              key={s.slug}
              accessibilityRole="button"
              accessibilityLabel={s.title}
              onPress={() => router.push(`/section/${s.slug}`)}
              style={ui.card}
            >
              <View style={ui.row}>
                <Text
                  style={{
                    fontFamily: serif,
                    fontSize: 25,
                    color: colors.foreground,
                    flex: 1,
                  }}
                >
                  {s.title}
                </Text>
                <ArrowRight size={18} color={colors.muted} />
              </View>
              <Body>{s.description}</Body>
            </Pressable>
          ))}
          <View style={[ui.card, { marginTop: 8 }]}>
            <Eyebrow>Biblioteka autora</Eyebrow>
            <Body>
              Wgrywaj treść i decyduj o publikacji w panelu na stronie.
            </Body>
            <Button
              secondary
              onPress={() =>
                void Linking.openURL(`${SITE_URL}/admin`).catch(() =>
                  Alert.alert("Nie udało się otworzyć panelu."),
                )
              }
            >
              Otwórz panel autora ↗
            </Button>
          </View>
          {!!Object.keys(downloads).length && (
            <View style={ui.card}>
              <Eyebrow>Na tym urządzeniu</Eyebrow>
              <Body>Pobrane rozdziały: {Object.keys(downloads).length}</Body>
              <Button
                secondary
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
              >
                Usuń pobrane kopie
              </Button>
            </View>
          )}
        </ScrollView>
      )}
    </Screen>
  );
}
