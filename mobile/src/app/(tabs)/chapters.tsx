import { useMemo, useState } from "react";
import {
  FlatList,
  Text,
  View,
  TextInput,
  Pressable,
  ScrollView,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { Download, ChevronRight } from "lucide-react-native";
import { useLibrary } from "@/lib/library";
import { normalize } from "@/lib/models";
import {
  Screen,
  ui,
  colors,
  serif,
  Eyebrow,
  Title,
  Body,
  LibraryStatus,
} from "@/components/ui";
export default function Chapters() {
  const { catalog, reading, downloads, loading, refresh } = useLibrary();
  const [search, setSearch] = useState("");
  const [saga, setSaga] = useState("");
  const [savedOnly, setSavedOnly] = useState(false);
  const rows = useMemo(
    () =>
      catalog?.sagas
        .filter((s) => !saga || s.slug === saga)
        .flatMap((s) =>
          s.chapters
            .filter(
              (c) =>
                (!savedOnly || !!downloads[c.slug]) &&
                normalize(`${c.title} ${c.number} ${s.title}`).includes(
                  normalize(search),
                ),
            )
            .map((c) => ({ ...c, sagaTitle: s.title })),
        ) ?? [],
    [catalog, saga, savedOnly, downloads, search],
  );
  return (
    <Screen>
      {!catalog ? (
        <LibraryStatus />
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(c) => c.slug}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={() => void refresh()}
              tintColor={colors.foreground}
            />
          }
          contentContainerStyle={ui.content}
          ListHeaderComponent={
            <View style={{ gap: 18 }}>
              <Eyebrow>Biblioteka</Eyebrow>
              <Title>Rozdziały</Title>
              <Body>Wybierz sagę i wejdź w opowieść.</Body>
              <TextInput
                accessibilityLabel="Szukaj rozdziału"
                placeholder="Tytuł lub numer…"
                placeholderTextColor={colors.muted}
                style={ui.input}
                value={search}
                onChangeText={setSearch}
                clearButtonMode="while-editing"
              />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8 }}
              >
                {[{ slug: "", title: "Wszystkie" }, ...catalog.sagas].map(
                  (s) => (
                    <Pressable
                      key={s.slug}
                      accessibilityRole="button"
                      accessibilityState={{ selected: saga === s.slug }}
                      onPress={() => setSaga(s.slug)}
                      style={{
                        paddingVertical: 12,
                        paddingHorizontal: 14,
                        borderWidth: 1,
                        borderColor:
                          saga === s.slug ? colors.foreground : colors.border,
                        borderRadius: 3,
                      }}
                    >
                      <Text style={{ color: colors.foreground, fontSize: 13 }}>
                        {s.title}
                      </Text>
                    </Pressable>
                  ),
                )}
              </ScrollView>
              <Pressable
                accessibilityRole="checkbox"
                accessibilityState={{ checked: savedOnly }}
                onPress={() => setSavedOnly(!savedOnly)}
                style={[ui.row, { minHeight: 44 }]}
              >
                <Download
                  size={16}
                  color={savedOnly ? colors.foreground : colors.muted}
                />
                <Text
                  style={{
                    color: savedOnly ? colors.foreground : colors.muted,
                  }}
                >
                  Tylko pobrane ({Object.keys(downloads).length})
                </Text>
              </Pressable>
              <Text
                accessibilityLiveRegion="polite"
                style={{ color: colors.muted, fontSize: 12 }}
              >
                Rozdziały: {rows.length}
              </Text>
            </View>
          }
          ListEmptyComponent={
            <Body>
              Nie znaleziono rozdziałów. Zmień wyszukiwanie lub filtr.
            </Body>
          }
          renderItem={({ item: c, index }) => (
            <View>
              {(index === 0 || rows[index - 1].sagaTitle !== c.sagaTitle) && (
                <View style={{ marginTop: 20 }}>
                  <Eyebrow>{c.sagaTitle}</Eyebrow>
                </View>
              )}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${c.number}. ${c.title}`}
                onPress={() => router.push(`/chapter/${c.slug}`)}
                style={[ui.divider, ui.row]}
              >
                <Text style={{ color: colors.muted, fontSize: 12, width: 24 }}>
                  {String(c.number).padStart(2, "0")}
                </Text>
                <View style={{ flex: 1, gap: 7 }}>
                  <Text
                    style={{
                      fontFamily: serif,
                      color: colors.foreground,
                      fontSize: 19,
                    }}
                  >
                    {c.title}
                  </Text>
                  <View style={ui.row}>
                    {reading.progress[c.slug] !== undefined && (
                      <Text style={{ color: colors.muted, fontSize: 11 }}>
                        {Math.round(reading.progress[c.slug] * 100)}%
                      </Text>
                    )}
                    {downloads[c.slug] && (
                      <Download size={12} color={colors.muted} />
                    )}
                  </View>
                </View>
                <ChevronRight size={16} color={colors.muted} />
              </Pressable>
            </View>
          )}
        />
      )}
    </Screen>
  );
}
