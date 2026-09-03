import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import GalacticBackground from "@/components/GalacticBackground";
import GameCard, { Pill, StatNumber } from "@/components/GameCard";
import ScreenEntrance from "@/components/ScreenEntrance";
import { useTheme } from "@/components/ThemeContext";
import { PrimaryButton, ScreenTitle } from "@/components/ui";
import { fonts } from "@/lib/theme";

export default function ExploreScreen() {
  const { colors } = useTheme();

  return (
    <GalacticBackground>
      <SafeAreaView style={styles.fill} edges={["top"]}>
        <ScreenEntrance>
          <ScrollView contentContainerStyle={styles.content}>
            <Pill label="Discover" accent="orange" />
            <ScreenTitle
              title="Discover the next step in your Journey"
              subtitle="Explore top universities and TVET colleges across South Africa."
            />
            <GameCard accent="purple">
              <TextInput
                placeholder="Search institutions, courses..."
                placeholderTextColor={colors.text3}
                style={[
                  styles.search,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.surface2,
                    color: colors.text1,
                  },
                ]}
              />
              <PrimaryButton label="Filter" variant="primary" />
            </GameCard>
            <Text style={[styles.sectionTitle, { color: colors.text1 }]}>All Institutions</Text>
            <GameCard title="Stellenbosch University" subtitle="Stellenbosch, Western Cape" accent="purple">
              <View style={styles.stats}>
                <StatNumber value="R45k - R70k" label="Avg. Fees" />
                <StatNumber value="28+" label="Min. APS" />
              </View>
            </GameCard>
            <GameCard title="University of Cape Town" subtitle="Cape Town, Western Cape" accent="orange">
              <View style={styles.stats}>
                <StatNumber value="R50k - R85k" label="Avg. Fees" />
                <StatNumber value="32+" label="Min. APS" />
              </View>
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
  search: {
    height: 46,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontFamily: fonts.sansMedium,
    fontSize: 14,
    marginBottom: 12,
  },
  sectionTitle: { fontFamily: fonts.uiBold, fontSize: 20, marginTop: 8 },
  stats: { flexDirection: "row", gap: 32, marginTop: 8 },
});
