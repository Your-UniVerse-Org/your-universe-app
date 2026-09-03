import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View, type ViewStyle } from "react-native";
import { useTheme } from "@/components/ThemeContext";
import { calculateUniverseScore } from "@/lib/universe-score";
import { fonts } from "@/lib/theme";

type Props = {
  apsScore?: number;
  profileCompletion?: number;
  xpPoints?: number;
  portfolioItems?: number;
  variant?: "full" | "compact" | "badge";
  style?: ViewStyle;
};

export default function YourUniverseScore({
  apsScore = 32,
  profileCompletion = 75,
  xpPoints = 240,
  portfolioItems = 3,
  variant = "full",
  style,
}: Props) {
  const { colors } = useTheme();
  const result = calculateUniverseScore({ apsScore, profileCompletion, xpPoints, portfolioItems });

  if (variant === "badge") {
    return (
      <View style={[styles.badge, { backgroundColor: colors.purple, borderColor: colors.bg }, style]}>
        <Text style={[styles.badgeScore, { color: colors.white }]}>{result.score}</Text>
      </View>
    );
  }

  if (variant === "compact") {
    return (
      <View
        style={[
          styles.compactWrap,
          { backgroundColor: colors.surface, borderColor: colors.borderPurple },
          style,
        ]}
      >
        <View style={styles.compactLeft}>
          <Text style={[styles.compactKicker, { color: colors.purple }]}>YOUR UNIVERSE SCORE</Text>
          <View style={styles.compactScoreRow}>
            <Text style={[styles.compactScore, { color: colors.text1 }]}>{result.score}</Text>
            <Text style={[styles.compactOutOf, { color: colors.text2 }]}>/ 1000</Text>
          </View>
        </View>
        <View style={[styles.compactTier, { backgroundColor: `${result.tierColor}18`, borderColor: `${result.tierColor}44` }]}>
          <Text style={[styles.compactTierText, { color: result.tierColor }]}>{result.tier}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.wrap, { backgroundColor: colors.surface, borderColor: colors.borderPurple }, style]}>
      <LinearGradient
        colors={[`${result.tierColor}18`, "transparent"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.glow}
      />

      <View style={styles.header}>
        <Text style={[styles.kicker, { color: colors.purple }]}>YOUR UNIVERSE SCORE</Text>
        <View style={[styles.tierPill, { backgroundColor: `${result.tierColor}22`, borderColor: `${result.tierColor}55` }]}>
          <Text style={[styles.tierText, { color: result.tierColor }]}>{result.tier}</Text>
        </View>
      </View>

      <View style={styles.scoreRow}>
        <Text style={[styles.score, { color: colors.text1 }]}>{result.score}</Text>
        <Text style={[styles.outOf, { color: colors.text2 }]}>/ 1000</Text>
      </View>

      <Text style={[styles.hint, { color: colors.text2 }]}>
        APS {apsScore} · Profile {profileCompletion}% · {xpPoints} XP · {portfolioItems} portfolio items
      </Text>

      <View style={styles.bars}>
        {(
          [
            ["Academic", result.breakdown.academic, colors.purple],
            ["Profile", result.breakdown.profile, "#A78BFF"],
            ["Engagement", result.breakdown.engagement, colors.orange],
            ["Portfolio", result.breakdown.portfolio, colors.orangeText],
          ] as const
        ).map(([label, pct, fill]) => (
          <View key={label} style={styles.barRow}>
            <Text style={[styles.barLabel, { color: colors.text2 }]}>{label}</Text>
            <View style={[styles.barTrack, { backgroundColor: colors.surface2 }]}>
              <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: fill }]} />
            </View>
            <Text style={[styles.barPct, { color: colors.text1 }]}>{pct}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    gap: 8,
    overflow: "hidden",
  },
  glow: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.9,
  },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  kicker: { fontFamily: fonts.ui, fontSize: 11, letterSpacing: 1.2 },
  tierPill: { borderRadius: 999, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4 },
  tierText: { fontFamily: fonts.ui, fontSize: 11, letterSpacing: 0.4 },
  scoreRow: { flexDirection: "row", alignItems: "baseline", gap: 6, marginTop: 4 },
  score: { fontFamily: fonts.display, fontSize: 56, letterSpacing: -1.5 },
  outOf: { fontFamily: fonts.sansMedium, fontSize: 18 },
  hint: { fontFamily: fonts.sans, fontSize: 12, lineHeight: 18 },
  bars: { marginTop: 8, gap: 10 },
  barRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  barLabel: { width: 72, fontFamily: fonts.sans, fontSize: 11 },
  barTrack: { flex: 1, height: 6, borderRadius: 999, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 999 },
  barPct: { width: 28, textAlign: "right", fontFamily: fonts.sansSemiBold, fontSize: 11 },
  compactWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 12,
  },
  compactLeft: { flex: 1, gap: 4 },
  compactKicker: { fontFamily: fonts.ui, fontSize: 10, letterSpacing: 1.1 },
  compactScoreRow: { flexDirection: "row", alignItems: "baseline", gap: 4 },
  compactScore: { fontFamily: fonts.display, fontSize: 40, letterSpacing: -1 },
  compactOutOf: { fontFamily: fonts.sansMedium, fontSize: 14 },
  compactTier: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  compactTierText: { fontFamily: fonts.ui, fontSize: 11, letterSpacing: 0.3, textAlign: "center" },
  badge: {
    minWidth: 52,
    height: 52,
    borderRadius: 999,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  badgeScore: {
    fontFamily: fonts.uiBold,
    fontSize: 14,
    letterSpacing: -0.3,
  },
});
