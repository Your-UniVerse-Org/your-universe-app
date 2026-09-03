import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View, type ViewProps } from "react-native";
import { useTheme } from "@/components/ThemeContext";
import { fonts, radii } from "@/lib/theme";

type Props = ViewProps & {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  accent?: "purple" | "orange";
};

export default function GameCard({ title, subtitle, children, accent = "purple", style, ...rest }: Props) {
  const { colors, shadow } = useTheme();
  const borderColors =
    accent === "orange"
      ? (["rgba(254,74,35,0.45)", "rgba(254,74,35,0.08)", "transparent"] as const)
      : (["rgba(119,77,255,0.45)", "rgba(119,77,255,0.08)", "transparent"] as const);

  return (
    <View style={[styles.outer, shadow.card, style]} {...rest}>
      <LinearGradient colors={borderColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.border}>
        <View style={[styles.inner, { backgroundColor: colors.surface }]}>
          {title ? <Text style={[styles.title, { color: colors.text1 }]}>{title}</Text> : null}
          {subtitle ? <Text style={[styles.subtitle, { color: colors.text2 }]}>{subtitle}</Text> : null}
          {children}
        </View>
      </LinearGradient>
    </View>
  );
}

export function Pill({ label, accent = "purple" }: { label: string; accent?: "purple" | "orange" }) {
  const { colors } = useTheme();
  const isOrange = accent === "orange";
  return (
    <View
      style={[
        styles.pill,
        {
          backgroundColor: isOrange ? colors.orangeDim : colors.purpleDim,
          borderColor: isOrange ? colors.orangeBorder : colors.purpleBorder,
        },
      ]}
    >
      <View style={[styles.pillDot, { backgroundColor: isOrange ? colors.orangeText : colors.purple }]} />
      <Text style={[styles.pillText, { color: isOrange ? colors.orangeText : colors.purple }]}>{label}</Text>
    </View>
  );
}

export function StatNumber({ value, label }: { value: string; label: string }) {
  const { colors } = useTheme();
  return (
    <View>
      <Text style={[styles.statValue, { color: colors.text1 }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.text2 }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { borderRadius: radii.lg },
  border: { borderRadius: radii.lg, padding: 1 },
  inner: {
    borderRadius: radii.lg - 1,
    padding: 20,
    gap: 8,
  },
  title: {
    fontFamily: fonts.uiBold,
    fontSize: 20,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 20,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  pillDot: { width: 6, height: 6, borderRadius: 999 },
  pillText: {
    fontFamily: fonts.ui,
    fontSize: 12,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  statValue: {
    fontFamily: fonts.display,
    fontSize: 36,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    marginTop: 2,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
});
