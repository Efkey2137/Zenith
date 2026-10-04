import { useState } from "react";
import {
  FlatList,
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  ScrollView,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { Users, ChevronRight } from "lucide-react-native";
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
          contentContainerStyle={ui.content}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={() => void refresh()}
              tintColor={colors.foreground}
            />
          }
          ListHeaderComponent={
            <View style={{ gap: 18 }}>
              <Eyebrow>Kompendium</Eyebrow>
              <Title>Postacie</Title>
              <Body>Bohaterowie, ich historie i przynależność.</Body>
              <TextInput
                accessibilityLabel="Szukaj postaci"
                placeholder="Imię lub frakcja…"
                placeholderTextColor={colors.muted}
                style={ui.input}
                value={search}
                onChangeText={setSearch}
                clearButtonMode="while-editing"
              />
              {!!fractions.length && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 8 }}
                >
                  {["", ...fractions].map((f) => (
                    <Pressable
                      key={f}
                      accessibilityRole="button"
                      accessibilityState={{ selected: f === fraction }}
                      onPress={() => setFraction(f)}
                      style={{
                        padding: 12,
                        borderWidth: 1,
                        borderColor:
                          f === fraction ? colors.foreground : colors.border,
                      }}
                    >
                      <Text style={{ color: colors.foreground, fontSize: 13 }}>
                        {f || "Wszystkie frakcje"}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              )}
            </View>
          }
          ListEmptyComponent={
            <Body>Nie znaleziono postaci pasujących do wyszukiwania.</Body>
          }
          renderItem={({ item: c }) => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={c.name}
              onPress={() => router.push(`/character/${c.slug}`)}
              style={[ui.divider, ui.row]}
            >
              {c.imageUrl ? (
                <Image
                  source={{ uri: c.imageUrl }}
                  accessibilityLabel={`Portret: ${c.name}`}
                  style={{
                    width: 58,
                    height: 70,
                    backgroundColor: colors.card,
                  }}
                />
              ) : (
                <View
                  style={{
                    width: 58,
                    height: 70,
                    backgroundColor: colors.card,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Users size={24} color={colors.muted} strokeWidth={1} />
                </View>
              )}
              <View style={{ flex: 1, gap: 8 }}>
                <Text
                  style={{
                    fontFamily: serif,
                    fontSize: 21,
                    color: colors.foreground,
                  }}
                >
                  {c.name}
                </Text>
                <Eyebrow>{c.fraction || "Bez przypisanej frakcji"}</Eyebrow>
              </View>
              <ChevronRight size={16} color={colors.muted} />
            </Pressable>
          )}
        />
      )}
    </Screen>
  );
}
