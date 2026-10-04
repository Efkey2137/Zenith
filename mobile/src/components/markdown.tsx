import { memo } from "react";
import Markdown from "react-native-markdown-display";
import { Linking } from "react-native";
import { serif } from "./ui";

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
  const ink = paper ? "#30291f" : "#ddd8d0";
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
          backgroundColor: paper ? "#ded5c4" : "#171717",
          borderLeftColor: ink,
          borderLeftWidth: 2,
          padding: 14,
        },
        link: { color: ink, textDecorationLine: "underline" },
        hr: {
          backgroundColor: paper ? "#30291f30" : "#303030",
          marginVertical: 24,
        },
        code_inline: {
          backgroundColor: paper ? "#ded5c4" : "#171717",
          color: ink,
        },
        fence: { backgroundColor: paper ? "#ded5c4" : "#171717", color: ink },
        table: { borderColor: paper ? "#30291f30" : "#303030" },
        tr: { borderColor: paper ? "#30291f30" : "#303030" },
      }}
    >
      {content}
    </Markdown>
  );
});
