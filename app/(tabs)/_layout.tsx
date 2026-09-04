import { Redirect, Tabs } from "expo-router";
import BottomTabBar from "@/components/BottomTabBar";
import { useSession } from "@/components/SessionContext";
import { useTheme } from "@/components/ThemeContext";

export default function TabLayout() {
  const { colors } = useTheme();
  const { status } = useSession();

  // Restrict the protected area of the app to signed-in learners — direct navigation to
  // /home (or any other tab) without a valid session bounces to /welcome instead of rendering.
  // "loading" renders nothing rather than bouncing, so a returning learner mid-launch-refresh
  // (see components/SessionContext.tsx) isn't flashed the welcome screen first.
  if (status === "loading") return null;
  if (status === "signedOut") return <Redirect href="/welcome" />;

  return (
    <Tabs
      tabBar={(props) => <BottomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.bg },
        tabBarStyle: { position: "absolute", backgroundColor: "transparent", borderTopWidth: 0, elevation: 0 },
      }}
    >
      <Tabs.Screen name="home" options={{ title: "Home" }} />
      <Tabs.Screen name="explore" options={{ title: "Explore" }} />
      <Tabs.Screen name="portfolio" options={{ title: "Portfolio" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
