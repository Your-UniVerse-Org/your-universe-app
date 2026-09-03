import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/components/ThemeContext";
import { fonts } from "@/lib/theme";

type Props = {
  title: string;
  subtitle: string;
  cta: string;
  onPress?: () => void;
};

export default function NextBestAction({ title, subtitle, cta, onPress }: Props) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[styles.wrap, { borderColor: colors.borderPurple, backgroundColor: colors.purpleDim }]}
    >
      <View style={[styles.dot, { backgroundColor: colors.purple, shadowColor: colors.purple }]} />
      <View style={styles.copy}>
        <Text style={[styles.kicker, { color: colors.purple }]}>NEXT BEST ACTION</Text>
        <Text style={[styles.title, { color: colors.text1 }]}>{title}</Text>
        <Text style={[styles.sub, { color: colors.text2 }]}>{subtitle}</Text>
      </View>
      <View style={[styles.cta, { backgroundColor: colors.purple }]}>
        <Text style={[styles.ctaText, { color: colors.white }]}>{cta}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    shadowOpacity: 0.6,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  copy: { flex: 1, gap: 2 },
  kicker: { fontFamily: fonts.ui, fontSize: 10, letterSpacing: 1.2, textTransform: "uppercase" },
  title: { fontFamily: fonts.sansSemiBold, fontSize: 14 },
  sub: { fontFamily: fonts.sans, fontSize: 12, lineHeight: 18 },
  cta: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 },
  ctaText: { fontFamily: fonts.sansSemiBold, fontSize: 11 },
});
