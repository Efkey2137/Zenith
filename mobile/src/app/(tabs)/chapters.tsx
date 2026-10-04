import { useMemo, useState } from "react";
import { FlatList, Text, View, RefreshControl } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Download, ChevronRight, Check } from "lucide-react-native";
import { useLibrary } from "@/lib/library";
import { normalize } from "@/lib/models";
import {
  Screen,
  ui,
  colors,
  serif,
  Title,
  Body,
  LibraryStatus,
  Touch,
  FilterBar,
  SearchField,
} from "@/components/ui";

export default function Chapters() {
  const { catalog, reading, downloads, loading, refresh } = useLibrary();
  const { saga = "" } = useLocalSearchParams<{ saga?: string }>();
  const [search, setSearch] = useState("");
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
          keyboardDismissMode="on-drag"
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={() => void refresh()}
              tintColor={colors.accent}
            />
          }
          contentContainerStyle={[ui.content, { gap: 0 }]}
          ListHeaderComponent={
            <View style={{ gap: 18, paddingBottom: 12 }}>
              <Title>Rozdziały</Title>
              <Body>Twoje miejsce w opowieści.</Body>
              <SearchField
                accessibilityLabel="Szukaj rozdziału"
                placeholder="Tytuł lub numer rozdziału"
                value={search}
                onChangeText={setSearch}
              />
              <FilterBar
                options={[
                  { key: "", label: "Wszystkie" },
                  ...catalog.sagas.map((s) => ({
                    key: s.slug,
                    label: s.title,
                  })),
                ]}
                selected={saga}
                onSelect={(key) => router.setParams({ saga: key })}
              />
              <View
                style={[
                  ui.row,
                  { justifyContent: "space-between", flexWrap: "wrap" },
                ]}
              >
                <Touch
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: savedOnly }}
                  onPress={() => setSavedOnly(!savedOnly)}
                  style={[ui.row, { minHeight: 44, gap: 8, paddingRight: 10 }]}
                >
                  <View
                    style={{
                      width: 23,
                      height: 23,
                      borderRadius: 7,
                      backgroundColor: savedOnly ? colors.accent : colors.card,
                      borderWidth: 1,
                      borderColor: savedOnly ? colors.accent : colors.border,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {savedOnly && <Check size={15} color={colors.background} />}
                  </View>
                  <Text
                    style={{
                      color: savedOnly ? colors.foreground : colors.muted,
                      fontSize: 14,
                    }}
                  >
                    Pobrane ({Object.keys(downloads).length})
                  </Text>
                </Touch>
                <Text
                  accessibilityLiveRegion="polite"
                  style={{ color: colors.muted, fontSize: 13 }}
                >
                  Rozdziały: {rows.length}
                </Text>
              </View>
            </View>
          }
          ListEmptyComponent={
            <View style={{ paddingVertical: 30 }}>
              <Body>
                Nie znaleziono rozdziałów. Zmień wyszukiwanie lub filtr.
              </Body>
            </View>
          }
          renderItem={({ item: c, index }) => {
            const p = reading.progress[c.slug];
            return (
              <View>
                {(index === 0 || rows[index - 1].sagaTitle !== c.sagaTitle) && (
                  <Text
                    accessibilityRole="header"
                    style={{
                      marginTop: 20,
                      marginBottom: 4,
                      fontSize: 14,
                      fontWeight: "600",
                      color: colors.brass,
                    }}
                  >
                    {c.sagaTitle}
                  </Text>
                )}
                <Touch
                  accessibilityRole="button"
                  accessibilityLabel={`${c.number}. ${c.title}${p === 1 ? ", przeczytany" : ""}${downloads[c.slug] ? ", pobrany" : ""}`}
                  onPress={() => router.push(`/chapter/${c.slug}`)}
                  style={[ui.divider, ui.row, { gap: 14 }]}
                >
                  <View
                    style={{
                      minWidth: 34,
                      minHeight: 38,
                      borderRadius: 10,
                      backgroundColor: colors.card,
                      alignItems: "center",
                      justifyContent: "center",
                      paddingHorizontal: 5,
                    }}
                  >
                    {p === 1 ? (
                      <Check size={17} color={colors.accent} />
                    ) : (
                      <Text
                        style={{
                          color: colors.muted,
                          fontSize: 14,
                          fontVariant: ["tabular-nums"],
                        }}
                      >
                        {c.number}
                      </Text>
                    )}
                  </View>
                  <View style={{ flex: 1, gap: 7 }}>
                    <Text
                      style={{
                        fontFamily: serif,
                        color: colors.foreground,
                        fontSize: 20,
                        lineHeight: 27,
                      }}
                    >
                      {c.title}
                    </Text>
                    {(p !== undefined || downloads[c.slug]) && (
                      <View style={[ui.row, { gap: 8 }]}>
                        {p !== undefined && (
                          <Text style={{ color: colors.muted, fontSize: 12 }}>
                            {p === 1
                              ? "Przeczytany"
                              : `${Math.round(p * 100)}% przeczytane`}
                          </Text>
                        )}
                        {downloads[c.slug] && (
                          <Download size={13} color={colors.accent} />
                        )}
                      </View>
                    )}
                  </View>
                  <ChevronRight size={17} color={colors.muted} />
                </Touch>
              </View>
            );
          }}
        />
      )}
    </Screen>
  );
}
