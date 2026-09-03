import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/components/ThemeContext";
import { fonts } from "@/lib/theme";

type Props = { level: number; xp: number; maxXp: number; title: string };

export default function XpBar({ level, xp, maxXp, title }: Props) {
  const { colors } = useTheme();
  const pct = Math.min(100, (xp / maxXp) * 100);

  return (
    <View style={[styles.wrap, { backgroundColor: colors.surface2, borderColor: colors.borderPurple }]}>
      <View style={styles.top}>
        <View style={[styles.levelBadge, { backgroundColor: colors.purple }]}>
          <Text style={styles.levelNum}>{level}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.text1 }]}>{title}</Text>
          <Text style={[styles.xp, { color: colors.text2 }]}>
            {xp} / {maxXp} XP
          </Text>
        </View>
        <Text style={[styles.fire, { color: colors.orange }]}>🔥 5-day streak</Text>
      </View>
      <View style={[styles.track, { backgroundColor: colors.surface3 }]}>
        <View style={[styles.fill, { width: `${pct}%`, backgroundColor: colors.purple }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 10 },
  top: { flexDirection: "row", alignItems: "center", gap: 12 },
  levelBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  levelNum: { fontFamily: fonts.uiBold, fontSize: 18, color: "#FFF" },
  title: { fontFamily: fonts.uiBold, fontSize: 15 },
  xp: { fontFamily: fonts.sans, fontSize: 12, marginTop: 2 },
  fire: { fontFamily: fonts.sansSemiBold, fontSize: 11 },
  track: { height: 8, borderRadius: 999, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 999 },
});
