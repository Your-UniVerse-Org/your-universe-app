import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/components/ThemeContext";
import { fonts } from "@/lib/theme";

type TabBarProps = {
  state: { index: number; routes: { key: string; name: string }[] };
  navigation: { navigate: (name: string) => void };
};

const TABS: {
  name: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
}[] = [
  { name: "home", label: "Home", icon: "home-outline", activeIcon: "home" },
  { name: "explore", label: "Explore", icon: "compass-outline", activeIcon: "compass" },
  { name: "portfolio", label: "Portfolio", icon: "briefcase-outline", activeIcon: "briefcase" },
  { name: "profile", label: "Profile", icon: "person-outline", activeIcon: "person" },
];

/** Floating glass pill tab bar — icon-only inactive, purple pill + label when active */
export default function BottomTabBar({ state, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  const glassTint = isDark ? "dark" : "light";
  const glassOverlay = isDark ? "rgba(20, 30, 46, 0.55)" : "rgba(255, 255, 255, 0.62)";
  const glassBorder = isDark ? "rgba(255, 255, 255, 0.14)" : "rgba(255, 255, 255, 0.85)";
  const glassHighlight = isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(255, 255, 255, 0.45)";

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 14) }]}
    >
      <View style={[styles.shadow, { shadowColor: isDark ? "#000" : colors.purple }]}>
        <View style={[styles.barShell, { borderColor: glassBorder }]}>
          {Platform.OS === "web" ? (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: glassOverlay, borderRadius: 75 }]} />
          ) : (
            <BlurView intensity={isDark ? 55 : 72} tint={glassTint} style={StyleSheet.absoluteFill} />
          )}
          <View style={[StyleSheet.absoluteFill, styles.glassOverlay, { backgroundColor: glassOverlay }]} />
          <View style={[styles.glassHighlight, { backgroundColor: glassHighlight }]} />

          <View style={styles.row}>
            {TABS.map((tab, index) => {
              const active = state.index === index;
              return (
                <Pressable
                  key={tab.name}
                  onPress={() => navigation.navigate(tab.name)}
                  style={[
                    styles.item,
                    active && styles.itemActive,
                    active && { backgroundColor: colors.purple },
                  ]}
                >
                  <Ionicons
                    name={active ? tab.activeIcon : tab.icon}
                    size={22}
                    color={active ? colors.white : isDark ? colors.text2 : colors.purple}
                    style={{ opacity: active ? 1 : 0.85 }}
                  />
                  {active ? (
                    <Text style={[styles.label, { color: colors.white }]}>{tab.label}</Text>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    paddingTop: 8,
    backgroundColor: "transparent",
  },
  shadow: {
    borderRadius: 75,
    shadowOpacity: 0.22,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  barShell: {
    borderRadius: 75,
    borderWidth: 1,
    overflow: "hidden",
    minWidth: 280,
  },
  glassOverlay: {
    borderRadius: 75,
  },
  glassHighlight: {
    position: "absolute",
    top: 0,
    left: 16,
    right: 16,
    height: 1,
    borderRadius: 999,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  item: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  itemActive: {
    flexDirection: "row",
    gap: 6,
    borderRadius: 44,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  label: {
    fontSize: 12,
    fontFamily: fonts.ui,
    letterSpacing: 0.1,
  },
});
