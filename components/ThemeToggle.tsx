import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/components/ThemeContext";
import { fonts } from "@/lib/theme";

type Props = { compact?: boolean };

export default function ThemeToggle({ compact }: Props) {
  const { theme, setTheme, colors, isDark } = useTheme();

  if (compact) {
    return (
      <Pressable
        onPress={() => setTheme(theme === "dark" ? "light" : "dark")}
        style={[
          styles.compactBtn,
          {
            backgroundColor: isDark ? colors.surface2 : colors.white,
            borderColor: colors.border,
          },
        ]}
        accessibilityLabel={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      >
        <Ionicons
          name={theme === "dark" ? "sunny-outline" : "moon-outline"}
          size={17}
          color={colors.purple}
        />
      </Pressable>
    );
  }

  return (
    <View style={[styles.wrap, { backgroundColor: colors.surface2, borderColor: colors.border }]}>
      {(["light", "dark"] as const).map((mode) => {
        const active = theme === mode;
        return (
          <Pressable
            key={mode}
            onPress={() => setTheme(mode)}
            style={[styles.btn, active && { backgroundColor: colors.purple }]}
          >
            <Ionicons
              name={mode === "light" ? "sunny-outline" : "moon-outline"}
              size={15}
              color={active ? colors.white : colors.text2}
            />
            <Text style={[styles.text, { color: active ? colors.white : colors.text2 }]}>
              {mode === "light" ? "Light" : "Dark"}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    borderRadius: 999,
    borderWidth: 1,
    padding: 3,
    gap: 2,
  },
  btn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  text: { fontFamily: fonts.sansSemiBold, fontSize: 13 },
  compactBtn: {
    width: 34,
    height: 34,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
