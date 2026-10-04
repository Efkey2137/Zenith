import { Tabs } from "expo-router";
import { BookOpen, Compass, Home, Users } from "lucide-react-native";
import { colors } from "@/components/ui";
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.foreground,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: { fontSize: 11 },
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Zenith",
          tabBarIcon: ({ color, size }) => (
            <Home color={color} size={size} strokeWidth={1.3} />
          ),
        }}
      />
      <Tabs.Screen
        name="chapters"
        options={{
          title: "Rozdziały",
          tabBarIcon: ({ color, size }) => (
            <BookOpen color={color} size={size} strokeWidth={1.3} />
          ),
        }}
      />
      <Tabs.Screen
        name="characters"
        options={{
          title: "Postacie",
          tabBarIcon: ({ color, size }) => (
            <Users color={color} size={size} strokeWidth={1.3} />
          ),
        }}
      />
      <Tabs.Screen
        name="world"
        options={{
          title: "Świat",
          tabBarIcon: ({ color, size }) => (
            <Compass color={color} size={size} strokeWidth={1.3} />
          ),
        }}
      />
    </Tabs>
  );
}
