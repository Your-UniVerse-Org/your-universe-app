import { Image } from "expo-image";
import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import GalacticBackground from "@/components/GalacticBackground";
import GameCard, { Pill } from "@/components/GameCard";
import { PrimaryButton, ScreenTitle } from "@/components/ui";
import { FIGMA_ASSETS } from "@/lib/figma-assets";
import { colors, fonts } from "@/lib/theme";

export default function RoleScreen() {
  return (
    <GalacticBackground>
      <SafeAreaView style={styles.fill}>
        <View style={styles.content}>
          <Pill label="Choose your path" />
          <ScreenTitle title="Welcome..." subtitle="How would you like to continue?" />
          <Image source={{ uri: FIGMA_ASSETS.logo.welcome }} style={styles.hero} contentFit="contain" />
          <View style={styles.row}>
            <View style={styles.half}>
              <PrimaryButton label="Learner" href="/signup" variant="primary" />
            </View>
            <View style={styles.half}>
              <PrimaryButton label="Guardian" href="/signup" variant="outline" />
            </View>
          </View>
          <GameCard accent="purple">
            <Text style={styles.cardCopy}>
              Learners unlock quests, APS tracking, and career pathways. Guardians stay connected to progress.
            </Text>
          </GameCard>
          <Text style={styles.footer}>
            Already have an account?{" "}
            <Link href="/login" style={styles.link}>
              Sign in
            </Link>
          </Text>
        </View>
      </SafeAreaView>
    </GalacticBackground>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { flex: 1, padding: 24, gap: 16 },
  hero: { width: "100%", height: 200, marginTop: 4 },
  row: { flexDirection: "row", gap: 12 },
  half: { flex: 1 },
  cardCopy: { fontFamily: fonts.sans, fontSize: 14, color: colors.text2, lineHeight: 22 },
  footer: { marginTop: "auto", textAlign: "center", fontSize: 12, fontFamily: fonts.sansMedium, color: colors.text2 },
  link: { fontFamily: fonts.sansSemiBold, color: colors.purple },
});
