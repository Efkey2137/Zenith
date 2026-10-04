import { memo } from "react";
import Markdown from "react-native-markdown-display";
import { Linking } from "react-native";
import { colors, serif } from "./ui";

export const ChapterText = memo(function ChapterText({
  content,
  size = 19,
  leading = 1.9,
  paper = false,
}: {
  content: string;
  size?: number;
  leading?: number;
  paper?: boolean;
}) {
  const ink = paper ? "#30291f" : colors.foreground;
  return (
    <Markdown
      onLinkPress={(url) => {
        if (/^https?:\/\//i.test(url))
          void Linking.openURL(url).catch(() => {});
        return false;
      }}
      style={{
        body: {
          color: ink,
          fontFamily: serif,
          fontSize: size,
          lineHeight: Math.round(size * leading),
        },
        paragraph: { marginTop: 0, marginBottom: 22 },
        heading1: {
          fontSize: size + 10,
          lineHeight: (size + 10) * 1.3,
          marginTop: 22,
          marginBottom: 14,
          fontFamily: serif,
        },
        heading2: {
          fontSize: size + 5,
          lineHeight: (size + 5) * 1.4,
          marginTop: 18,
          marginBottom: 12,
          fontFamily: serif,
        },
        heading3: {
          fontSize: size + 2,
          lineHeight: (size + 2) * 1.4,
          marginTop: 18,
          marginBottom: 12,
          fontFamily: serif,
        },
        blockquote: {
          backgroundColor: paper ? "#ded5c4" : colors.card,
          borderLeftColor: ink,
          borderLeftWidth: 2,
          padding: 14,
          borderTopRightRadius: 10,
          borderBottomRightRadius: 10,
        },
        link: { color: ink, textDecorationLine: "underline" },
        hr: {
          backgroundColor: paper ? "#30291f30" : colors.border,
          marginVertical: 24,
        },
        code_inline: {
          backgroundColor: paper ? "#ded5c4" : colors.card,
          color: ink,
        },
        fence: { backgroundColor: paper ? "#ded5c4" : colors.card, color: ink },
        table: { borderColor: paper ? "#30291f30" : colors.border },
        tr: { borderColor: paper ? "#30291f30" : colors.border },
      }}
    >
      {content}
    </Markdown>
  );
});
