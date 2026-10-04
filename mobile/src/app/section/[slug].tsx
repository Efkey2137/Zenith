import { ScrollView, Text } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { useLibrary } from "@/lib/library";
import { ChapterText } from "@/components/markdown";
import {
  Screen,
  ui,
  colors,
  Eyebrow,
  Title,
  Body,
  LibraryStatus,
} from "@/components/ui";
export default function SectionPage() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { catalog } = useLibrary();
  const section = catalog?.sections.find((s) => s.slug === slug);
  return (
    <Screen withHeader>
      {!catalog ? (
        <LibraryStatus />
      ) : !section ? (
        <Body>Nie znaleziono tej sekcji.</Body>
      ) : (
        <ScrollView contentContainerStyle={ui.content}>
          <Stack.Screen options={{ title: section.title }} />
          <Eyebrow>{section.eyebrow}</Eyebrow>
          <Title>{section.title}</Title>
          <Body>{section.description}</Body>
          {section.content ? (
            <ChapterText content={section.content} />
          ) : (
            <Text
              style={{
                color: colors.muted,
                borderWidth: 1,
                borderColor: colors.border,
                padding: 24,
                borderRadius: 18,
                backgroundColor: colors.card,
                lineHeight: 25,
              }}
            >
              {section.empty}
            </Text>
          )}
        </ScrollView>
      )}
    </Screen>
  );
}
