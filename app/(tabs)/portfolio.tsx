import { ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import GalacticBackground from "@/components/GalacticBackground";
import GameCard, { Pill, StatNumber } from "@/components/GameCard";
import ScreenEntrance from "@/components/ScreenEntrance";
import { useTheme } from "@/components/ThemeContext";
import { ScreenTitle } from "@/components/ui";
import { fonts } from "@/lib/theme";

export default function PortfolioScreen() {
  const { colors } = useTheme();

  return (
    <GalacticBackground>
      <SafeAreaView style={styles.fill} edges={["top"]}>
        <ScreenEntrance>
          <ScrollView contentContainerStyle={styles.content}>
            <Pill label="Academic XP · Rewards" />
            <ScreenTitle title="Academic Portfolio" subtitle="Build a living record of who you are — beyond marks." />
            <GameCard accent="purple">
              <StatNumber value="32" label="Current APS Score" />
              <Text style={[styles.note, { color: colors.text2 }]}>Based on your latest subject results.</Text>
            </GameCard>
            <GameCard title="Psychometric Results" accent="orange">
              <Text style={[styles.body, { color: colors.text2 }]}>
                Explore your cognitive strengths, personality traits, and tailored career matches based on your
                assessments.
              </Text>
            </GameCard>
          </ScrollView>
        </ScreenEntrance>
      </SafeAreaView>
    </GalacticBackground>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { padding: 20, paddingBottom: 120, gap: 16 },
  note: { fontFamily: fonts.sans, fontSize: 13, marginTop: 8 },
  body: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 22 },
});
