import { Modal, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Check, Minus, Plus, X } from "lucide-react-native";
import type { ReaderSettings as Settings } from "@/lib/models";
import { colors, serif, ui, Touch, useReducedMotion } from "./ui";

export function ReaderSettings({
  visible,
  settings,
  onChange,
  onClose,
}: {
  visible: boolean;
  settings: Settings;
  onChange: (update: Partial<Settings>) => void;
  onClose: () => void;
}) {
  const reduced = useReducedMotion();
  return (
    <Modal
      visible={visible}
      animationType={reduced ? "none" : "slide"}
      presentationStyle="pageSheet"
      allowSwipeDismissal
      onRequestClose={onClose}
      backdropColor={colors.background}
    >
      <SafeAreaView edges={["bottom", "left", "right"]} style={ui.screen}>
        <View
          style={{
            width: 36,
            height: 4,
            borderRadius: 2,
            backgroundColor: colors.border,
            alignSelf: "center",
            marginTop: 12,
          }}
          accessible={false}
        />
        <View
          style={[
            ui.row,
            { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 12 },
          ]}
        >
          <Text
            accessibilityRole="header"
            style={{
              fontFamily: serif,
              fontSize: 27,
              color: colors.foreground,
              flex: 1,
            }}
          >
            Wygląd lektury
          </Text>
          <Touch
            accessibilityRole="button"
            accessibilityLabel="Zamknij ustawienia czytania"
            onPress={onClose}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: colors.card,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={20} color={colors.foreground} />
          </Touch>
        </View>
        <ScrollView
          contentContainerStyle={[ui.content, { gap: 28, paddingTop: 8 }]}
        >
          <View
            style={{
              backgroundColor: settings.paper ? "#eee7da" : colors.card,
              borderRadius: 18,
              padding: 22,
              gap: 10,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                color: settings.paper ? "#62584a" : colors.muted,
              }}
            >
              Podgląd tekstu
            </Text>
            <Text
              style={{
                fontFamily: serif,
                fontSize: settings.size,
                lineHeight: Math.round(settings.size * settings.leading),
                color: settings.paper ? "#30291f" : colors.foreground,
              }}
            >
              Kroniki mrocznego słowiańskiego świata.
            </Text>
          </View>
          <View style={{ gap: 12 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "500",
                color: colors.foreground,
              }}
            >
              Wielkość tekstu
            </Text>
            <View
              style={[
                ui.row,
                {
                  backgroundColor: colors.card,
                  borderRadius: 14,
                  justifyContent: "space-between",
                  padding: 4,
                },
              ]}
            >
              <Touch
                accessibilityRole="button"
                accessibilityLabel="Zmniejsz tekst"
                disabled={settings.size <= 17}
                onPress={() => onChange({ size: settings.size - 2 })}
                style={{
                  minWidth: 66,
                  minHeight: 48,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Minus size={21} color={colors.foreground} />
              </Touch>
              <Text
                accessibilityLiveRegion="polite"
                style={{
                  fontSize: 17,
                  fontVariant: ["tabular-nums"],
                  color: colors.foreground,
                }}
              >
                {settings.size}
              </Text>
              <Touch
                accessibilityRole="button"
                accessibilityLabel="Powiększ tekst"
                disabled={settings.size >= 25}
                onPress={() => onChange({ size: settings.size + 2 })}
                style={{
                  minWidth: 66,
                  minHeight: 48,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Plus size={21} color={colors.foreground} />
              </Touch>
            </View>
          </View>
          <View style={{ gap: 12 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "500",
                color: colors.foreground,
              }}
            >
              Odstępy między wierszami
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {([1.6, 1.9, 2.2] as const).map((value, i) => (
                <Touch
                  key={value}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: settings.leading === value }}
                  onPress={() => onChange({ leading: value })}
                  style={{
                    minHeight: 48,
                    padding: 14,
                    borderRadius: 14,
                    flex: 1,
                    minWidth: 80,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor:
                      settings.leading === value ? colors.accent : colors.card,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "500",
                      color:
                        settings.leading === value
                          ? colors.background
                          : colors.foreground,
                    }}
                  >
                    {["Zwarte", "Zwykłe", "Szerokie"][i]}
                  </Text>
                </Touch>
              ))}
            </View>
          </View>
          <View style={{ gap: 12 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "500",
                color: colors.foreground,
              }}
            >
              Tło strony
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
              {[false, true].map((paper) => (
                <Touch
                  key={String(paper)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: settings.paper === paper }}
                  onPress={() => onChange({ paper })}
                  style={{
                    minHeight: 92,
                    borderRadius: 16,
                    borderWidth: 2,
                    borderColor:
                      settings.paper === paper ? colors.accent : colors.border,
                    backgroundColor: paper ? "#eee7da" : colors.card,
                    flex: 1,
                    minWidth: 120,
                    padding: 16,
                    gap: 10,
                  }}
                >
                  <View style={[ui.row, { justifyContent: "space-between" }]}>
                    <Text
                      style={{
                        fontFamily: serif,
                        fontSize: 25,
                        color: paper ? "#30291f" : colors.foreground,
                      }}
                    >
                      Aa
                    </Text>
                    {settings.paper === paper && (
                      <Check
                        size={18}
                        color={paper ? "#30291f" : colors.accent}
                      />
                    )}
                  </View>
                  <Text
                    style={{
                      fontSize: 14,
                      color: paper ? "#62584a" : colors.muted,
                    }}
                  >
                    {paper ? "Jasny papier" : "Nocny las"}
                  </Text>
                </Touch>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
