import { Tabs } from "expo-router";
import {
  BookOpen,
  Compass,
  Home,
  Users,
  type LucideIcon,
} from "lucide-react-native";
import { View, type ColorValue } from "react-native";
import { colors } from "@/components/ui";

function TabIcon({
  Icon,
  color,
  focused,
}: {
  Icon: LucideIcon;
  color: ColorValue;
  focused: boolean;
}) {
  return (
    <View
      style={{
        width: 48,
        height: 31,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: focused ? colors.card : "transparent",
      }}
    >
      <Icon color={color} size={22} strokeWidth={focused ? 1.9 : 1.6} />
    </View>
  );
}
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          paddingTop: 7,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: "500", marginTop: 3 },
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Start",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon Icon={Home} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="chapters"
        options={{
          title: "Rozdziały",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon Icon={BookOpen} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="characters"
        options={{
          title: "Postacie",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon Icon={Users} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="world"
        options={{
          title: "Świat",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon Icon={Compass} color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
