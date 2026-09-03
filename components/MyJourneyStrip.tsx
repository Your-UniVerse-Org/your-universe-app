import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/components/ThemeContext";
import { fonts } from "@/lib/theme";

export default function MyJourneyStrip() {
  const { colors } = useTheme();

  const phases = [
    { grade: "9", label: "Discover", color: colors.purple, active: true },
    { grade: "10", label: "Develop", color: colors.purple, active: false },
    { grade: "11", label: "Prepare", color: colors.orange, active: false },
    { grade: "12", label: "Apply", color: colors.orange, active: false },
    { grade: "T", label: "Transition", color: "#A78BFF", active: false },
  ];

  return (
    <View style={styles.wrap}>
      <Text style={[styles.heading, { color: colors.text1 }]}>My Journey</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {phases.map((phase, i) => (
          <View key={phase.grade} style={styles.item}>
            {i > 0 ? <View style={[styles.connector, { backgroundColor: colors.borderPurple }]} /> : null}
            <View style={styles.phaseCol}>
              <View
                style={[
                  styles.node,
                  {
                    borderColor: phase.active ? phase.color : colors.borderPurple,
                    backgroundColor: phase.active ? `${phase.color}22` : colors.surface2,
                  },
                ]}
              >
                <Text style={[styles.grade, { color: phase.active ? phase.color : colors.text2 }]}>
                  {phase.grade}
                </Text>
              </View>
              <Text style={[styles.label, { color: phase.active ? colors.text1 : colors.text2 }]}>{phase.label}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  heading: { fontFamily: fonts.uiBold, fontSize: 18 },
  row: { flexDirection: "row", alignItems: "flex-start", paddingRight: 8 },
  item: { flexDirection: "row", alignItems: "center" },
  connector: { width: 24, height: 1, marginTop: 18, marginHorizontal: 4 },
  phaseCol: { alignItems: "center", gap: 6, width: 72 },
  node: {
    width: 36,
    height: 36,
    borderRadius: 999,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  grade: { fontFamily: fonts.uiBold, fontSize: 13 },
  label: { fontFamily: fonts.sansMedium, fontSize: 10, letterSpacing: 0.3, textAlign: "center" },
});
