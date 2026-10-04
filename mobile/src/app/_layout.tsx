import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { LibraryProvider } from "@/lib/library";
import {
  colors,
  serif,
  MotionProvider,
  useReducedMotion,
} from "@/components/ui";
export default function Layout() {
  return (
    <MotionProvider>
      <LibraryProvider>
        <Navigation />
      </LibraryProvider>
    </MotionProvider>
  );
}
function Navigation() {
  const reduced = useReducedMotion();
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.foreground,
          headerTitleStyle: { fontFamily: serif },
          contentStyle: { backgroundColor: colors.background },
          headerShadowVisible: false,
          animation: reduced ? "none" : "default",
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="chapter/[slug]"
          options={{ title: "Lektura", headerBackButtonDisplayMode: "minimal" }}
        />
        <Stack.Screen
          name="character/[slug]"
          options={{ title: "Postać", headerBackButtonDisplayMode: "minimal" }}
        />
        <Stack.Screen
          name="section/[slug]"
          options={{
            title: "Kompendium",
            headerBackButtonDisplayMode: "minimal",
          }}
        />
      </Stack>
    </>
  );
}
