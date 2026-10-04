import { useEffect, useState } from "react";
import { ScrollView, ActivityIndicator, Image, View } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { fetchCharacter } from "@/lib/api";
import type { Character } from "@/lib/models";
import { ChapterText } from "@/components/markdown";
import {
  Screen,
  ui,
  colors,
  Eyebrow,
  Title,
  Body,
  Button,
} from "@/components/ui";
export default function CharacterPage() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  return <LoadCharacter key={slug} slug={slug} />;
}
function LoadCharacter({ slug }: { slug: string }) {
  const [character, setCharacter] = useState<Character | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let cancelled = false;
    fetchCharacter(slug)
      .then((c) => {
        if (!cancelled) setCharacter(c);
      })
      .catch(() => {
        if (!cancelled)
          setError(
            "Nie udało się pobrać biografii. Sprawdź połączenie z internetem.",
          );
      });
    return () => {
      cancelled = true;
    };
  }, [slug, attempt]);
  return (
    <Screen withHeader>
      {character ? (
        <ScrollView contentContainerStyle={ui.content}>
          <Stack.Screen options={{ title: character.name }} />
          {character.imageUrl && (
            <Image
              source={{ uri: character.imageUrl }}
              accessibilityLabel={`Portret: ${character.name}`}
              style={{
                height: 330,
                width: "100%",
                resizeMode: "contain",
                backgroundColor: colors.card,
                borderRadius: 18,
              }}
            />
          )}
          <Eyebrow>{character.fraction || "Postać Zenith"}</Eyebrow>
          <Title>{character.name}</Title>
          <ChapterText content={character.bio} />
        </ScrollView>
      ) : (
        <View style={[ui.content, { marginTop: 40 }]}>
          {error ? (
            <>
              <Body>{error}</Body>
              <Button
                onPress={() => {
                  setCharacter(null);
                  setError("");
                  setAttempt((v) => v + 1);
                }}
              >
                Spróbuj ponownie
              </Button>
            </>
          ) : (
            <ActivityIndicator color={colors.foreground} />
          )}
        </View>
      )}
    </Screen>
  );
}
