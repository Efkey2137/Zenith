import { useState } from "react";
import { FlatList, View, Text, Image, RefreshControl } from "react-native";
import { router } from "expo-router";
import { ChevronRight } from "lucide-react-native";
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
  SearchField,
  FilterBar,
} from "@/components/ui";

export default function Characters() {
  const { catalog, loading, refresh } = useLibrary();
  const [search, setSearch] = useState("");
  const [fraction, setFraction] = useState("");
  const fractions = Array.from(
    new Set(
      catalog?.characters
        .map((c) => c.fraction)
        .filter((f): f is string => !!f),
    ),
  );
  const rows =
    catalog?.characters.filter(
      (c) =>
        (!fraction || c.fraction === fraction) &&
        normalize(`${c.name} ${c.fraction ?? ""}`).includes(normalize(search)),
    ) ?? [];
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
          contentContainerStyle={[ui.content, { gap: 0 }]}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={() => void refresh()}
              tintColor={colors.accent}
            />
          }
          ListHeaderComponent={
            <View style={{ gap: 18, paddingBottom: 12 }}>
              <Title>Postacie</Title>
              <Body>Bohaterowie, ich historie i przynależność.</Body>
              <SearchField
                accessibilityLabel="Szukaj postaci"
                placeholder="Imię lub frakcja"
                value={search}
                onChangeText={setSearch}
              />
              {!!fractions.length && (
                <FilterBar
                  options={["", ...fractions].map((f) => ({
                    key: f,
                    label: f || "Wszystkie frakcje",
                  }))}
                  selected={fraction}
                  onSelect={setFraction}
                />
              )}
              <Text
                accessibilityLiveRegion="polite"
                style={{ fontSize: 13, color: colors.muted }}
              >
                Postacie: {rows.length}
              </Text>
            </View>
          }
          ListEmptyComponent={
            <View style={{ paddingVertical: 30 }}>
              <Body>Nie znaleziono postaci pasujących do wyszukiwania.</Body>
            </View>
          }
          renderItem={({ item: c }) => (
            <Touch
              accessibilityRole="button"
              accessibilityLabel={c.name}
              onPress={() => router.push(`/character/${c.slug}`)}
              style={[ui.divider, ui.row, { gap: 16 }]}
            >
              {c.imageUrl ? (
                <Image
                  source={{ uri: c.imageUrl }}
                  accessible={false}
                  style={{
                    width: 62,
                    height: 76,
                    borderRadius: 12,
                    backgroundColor: colors.card,
                  }}
                />
              ) : (
                <View
                  accessible={false}
                  style={{
                    width: 62,
                    height: 76,
                    borderRadius: 12,
                    backgroundColor: colors.card,
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: serif,
                      fontSize: 30,
                      color: colors.brass,
                    }}
                  >
                    {c.name.charAt(0)}
                  </Text>
                </View>
              )}
              <View style={{ flex: 1, gap: 6 }}>
                <Text
                  style={{
                    fontFamily: serif,
                    fontSize: 22,
                    lineHeight: 29,
                    color: colors.foreground,
                  }}
                >
                  {c.name}
                </Text>
                <Text
                  style={{ fontSize: 13, lineHeight: 19, color: colors.muted }}
                >
                  {c.fraction || "Bez przypisanej frakcji"}
                </Text>
              </View>
              <ChevronRight size={17} color={colors.muted} />
            </Touch>
          )}
        />
      )}
    </Screen>
  );
}
