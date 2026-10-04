import {
  ActivityIndicator,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Platform,
  AccessibilityInfo,
  type PressableProps,
  type TextInputProps,
  type ViewStyle,
  type LayoutChangeEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Search } from "lucide-react-native";
import { useLibrary } from "@/lib/library";

export const colors = {
  background: "#101714",
  foreground: "#EEEFE7",
  muted: "#ABB6AE",
  border: "#334238",
  card: "#1B2520",
  accent: "#A5B9A5",
  brass: "#C6AE80",
};
export const serif = Platform.OS === "ios" ? "Georgia" : "serif";
export const ui = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: {
    padding: 24,
    paddingBottom: 40,
    gap: 20,
    maxWidth: 680,
    width: "100%",
    alignSelf: "center",
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.muted,
    lineHeight: 19,
  },
  title: {
    fontFamily: serif,
    fontSize: 36,
    color: colors.foreground,
    lineHeight: 44,
    letterSpacing: -0.5,
  },
  body: { fontSize: 16, lineHeight: 24, color: colors.muted },
  card: {
    borderRadius: 20,
    padding: 22,
    gap: 12,
    backgroundColor: colors.card,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  input: {
    flex: 1,
    paddingVertical: 14,
    color: colors.foreground,
    fontSize: 16,
    minHeight: 50,
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    paddingVertical: 19,
  },
});

const MotionContext = createContext(true);
export function MotionProvider({ children }: { children: ReactNode }) {
  const [reduced, setReduced] = useState(true);
  useEffect(() => {
    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (active) setReduced(value);
    });
    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduced,
    );
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);
  return (
    <MotionContext.Provider value={reduced}>{children}</MotionContext.Provider>
  );
}
export function useReducedMotion() {
  return useContext(MotionContext);
}
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** Immediate contact feedback; one short native-driver spring on release. */
export function Touch({
  style,
  onPressIn,
  onPressOut,
  disabled,
  ...props
}: PressableProps) {
  const reduced = useReducedMotion();
  const [pressed, setPressed] = useState(false);
  const [scale] = useState(() => new Animated.Value(1));
  const release = useRef<Animated.CompositeAnimation | null>(null);
  useEffect(() => () => release.current?.stop(), []);
  return (
    <AnimatedPressable
      {...props}
      disabled={disabled}
      onPressIn={(event) => {
        setPressed(true);
        release.current?.stop();
        scale.setValue(reduced ? 1 : 0.97);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        setPressed(false);
        if (reduced) scale.setValue(1);
        else {
          release.current = Animated.spring(scale, {
            toValue: 1,
            stiffness: 600,
            damping: 44,
            mass: 0.7,
            useNativeDriver: true,
          });
          release.current.start();
        }
        onPressOut?.(event);
      }}
      style={[
        typeof style === "function" ? style({ pressed }) : style,
        {
          opacity: disabled ? 0.4 : pressed ? 0.78 : 1,
          transform: [{ scale }],
        },
      ]}
    />
  );
}

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
    <Touch
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[
        {
          minHeight: 52,
          paddingHorizontal: 18,
          paddingVertical: 15,
          borderRadius: 14,
          backgroundColor: secondary ? colors.card : colors.accent,
          alignItems: "center",
          justifyContent: "center",
        },
        style,
      ]}
    >
      <Text
        style={{
          fontSize: 16,
          fontWeight: "600",
          color: secondary ? colors.foreground : colors.background,
          textAlign: "center",
        }}
      >
        {children}
      </Text>
    </Touch>
  );
}
export function Filter({
  children,
  selected,
  onPress,
  onLayout,
}: {
  children: ReactNode;
  selected: boolean;
  onPress: () => void;
  onLayout?: (event: LayoutChangeEvent) => void;
}) {
  return (
    <Touch
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      onLayout={onLayout}
      style={{
        minHeight: 44,
        justifyContent: "center",
        paddingVertical: 12,
        paddingHorizontal: 17,
        borderRadius: 24,
        backgroundColor: selected ? colors.accent : colors.card,
      }}
    >
      <Text
        style={{
          fontSize: 14,
          fontWeight: selected ? "600" : "400",
          color: selected ? colors.background : colors.foreground,
        }}
      >
        {children}
      </Text>
    </Touch>
  );
}
export function FilterBar({
  options,
  selected,
  onSelect,
}: {
  options: { key: string; label: string }[];
  selected: string;
  onSelect: (key: string) => void;
}) {
  const scroll = useRef<ScrollView>(null);
  const positions = useRef<Record<string, number>>({});
  const revealSelected = useCallback(() => {
    scroll.current?.scrollTo({
      x: Math.max(0, (positions.current[selected] ?? 0) - 8),
      animated: false,
    });
  }, [selected]);
  useEffect(revealSelected, [revealSelected]);
  return (
    <ScrollView
      ref={scroll}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8 }}
      onContentSizeChange={revealSelected}
    >
      {options.map((option) => (
        <Filter
          key={option.key}
          selected={selected === option.key}
          onPress={() => onSelect(option.key)}
          onLayout={(event) => {
            positions.current[option.key] = event.nativeEvent.layout.x;
            if (option.key === selected) revealSelected();
          }}
        >
          {option.label}
        </Filter>
      ))}
    </ScrollView>
  );
}
export function SearchField(props: TextInputProps) {
  const [focused, setFocused] = useState(false);
  return (
    <View
      style={[
        ui.row,
        {
          backgroundColor: colors.card,
          borderRadius: 14,
          paddingHorizontal: 16,
          borderWidth: 1,
          borderColor: focused ? colors.accent : colors.card,
        },
      ]}
    >
      <Search size={19} color={colors.muted} accessible={false} />
      <TextInput
        {...props}
        style={ui.input}
        placeholderTextColor={colors.muted}
        clearButtonMode="while-editing"
        autoCorrect={false}
        returnKeyType="search"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </View>
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
export function Screen({
  children,
  withHeader = false,
}: {
  children: ReactNode;
  withHeader?: boolean;
}) {
  const { offline, storageError } = useLibrary();
  return (
    <SafeAreaView
      edges={
        withHeader ? ["bottom", "left", "right"] : ["top", "left", "right"]
      }
      style={ui.screen}
    >
      {offline && (
        <Text
          accessibilityLiveRegion="polite"
          style={{
            paddingHorizontal: 24,
            paddingVertical: 10,
            color: colors.muted,
            fontSize: 13,
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
        <ActivityIndicator color={colors.accent} />
      ) : (
        <>
          <Body>{error || "Biblioteka jest pusta."}</Body>
          <Button onPress={() => void refresh()}>Spróbuj ponownie</Button>
        </>
      )}
    </View>
  );
}
