import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  Platform,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { ReactNode } from "react";
import { useLibrary } from "@/lib/library";

export const colors = {
  background: "#0a0a0a",
  foreground: "#eeeae4",
  muted: "#99958f",
  border: "#292929",
  card: "#121212",
};
export const serif = Platform.OS === "ios" ? "Georgia" : "serif";
export const ui = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: {
    padding: 24,
    paddingBottom: 40,
    gap: 20,
    maxWidth: 760,
    width: "100%",
    alignSelf: "center",
  },
  eyebrow: {
    fontSize: 11,
    letterSpacing: 2.5,
    color: colors.muted,
    textTransform: "uppercase",
  },
  title: {
    fontFamily: serif,
    fontSize: 34,
    color: colors.foreground,
    lineHeight: 42,
  },
  body: {
    fontFamily: serif,
    fontSize: 16,
    lineHeight: 25,
    color: colors.muted,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    padding: 22,
    gap: 12,
    backgroundColor: colors.card,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 3,
    padding: 14,
    color: colors.foreground,
    fontSize: 16,
    minHeight: 48,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 19,
  },
});
export function Button({
  children,
  onPress,
  secondary = false,
  disabled = false,
  label,
  style,
}: {
  children: ReactNode;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
  label?: string;
  style?: ViewStyle;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        {
          minHeight: 48,
          paddingHorizontal: 18,
          paddingVertical: 13,
          borderRadius: 3,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: secondary ? colors.card : colors.foreground,
          opacity: disabled ? 0.4 : pressed ? 0.7 : 1,
          alignItems: "center",
          justifyContent: "center",
        },
        style,
      ]}
    >
      <Text
        style={{
          fontFamily: serif,
          fontSize: 15,
          color: secondary ? colors.foreground : colors.background,
        }}
      >
        {children}
      </Text>
    </Pressable>
  );
}
export function Eyebrow({ children }: { children: ReactNode }) {
  return <Text style={ui.eyebrow}>{children}</Text>;
}
export function Title({ children }: { children: ReactNode }) {
  return (
    <Text accessibilityRole="header" style={ui.title}>
      {children}
    </Text>
  );
}
export function Body({ children }: { children: ReactNode }) {
  return <Text style={ui.body}>{children}</Text>;
}
export function Screen({ children }: { children: ReactNode }) {
  const { offline, storageError } = useLibrary();
  return (
    <SafeAreaView edges={["top", "left", "right"]} style={ui.screen}>
      {offline && (
        <Text
          accessibilityLiveRegion="polite"
          style={{
            paddingHorizontal: 24,
            paddingVertical: 10,
            color: colors.muted,
            fontSize: 12,
          }}
        >
          Bez połączenia · dostępna zapisana biblioteka
        </Text>
      )}
      {!!storageError && (
        <Text style={{ color: "#e5a695", padding: 12 }}>{storageError}</Text>
      )}
      {children}
    </SafeAreaView>
  );
}
export function LibraryStatus() {
  const { catalog, loading, error, refresh } = useLibrary();
  if (catalog) return null;
  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 24, gap: 20 }}>
      {loading ? (
        <ActivityIndicator color={colors.foreground} />
      ) : (
        <>
          <Body>{error || "Biblioteka jest pusta."}</Body>
          <Button onPress={() => void refresh()}>Spróbuj ponownie</Button>
        </>
      )}
    </View>
  );
}
