import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BrandLogo, { BrandMark } from "@/components/BrandLogo";
import GalacticBackground from "@/components/GalacticBackground";
import { Pill } from "@/components/GameCard";
import ScreenEntrance from "@/components/ScreenEntrance";
import { useTheme } from "@/components/ThemeContext";
import { PrimaryButton } from "@/components/ui";
import { fonts } from "@/lib/theme";

export default function WelcomeScreen() {
  const { colors } = useTheme();

  return (
    <GalacticBackground variant="splash">
      <SafeAreaView style={styles.fill}>
        <ScreenEntrance>
          <View style={styles.center}>
            <Pill label="Your academic universe" />
            <View style={styles.logoWrap}>
              <BrandMark height={120} color={colors.purple} />
            </View>
            <BrandLogo height={36} color={colors.text1} />
            <Text style={[styles.tagline, { color: colors.text2 }]}>
              Understand yourself. Build your identity. Discover your future — from Grade 9 onward.
            </Text>
          </View>
          <View style={styles.footer}>
            <PrimaryButton label="Continue" href="/login" variant="primary" />
            <Text style={[styles.footerText, { color: colors.text2 }]}>
              A Product of <Text style={{ color: colors.text1 }}>Lynxio Tech</Text>
            </Text>
          </View>
        </ScreenEntrance>
      </SafeAreaView>
    </GalacticBackground>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 28, gap: 16 },
  logoWrap: { marginTop: 8, marginBottom: 4 },
  tagline: {
    marginTop: 8,
    textAlign: "center",
    fontFamily: fonts.sans,
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 300,
  },
  footer: { paddingHorizontal: 32, paddingBottom: 24, gap: 16, alignItems: "center" },
  footerText: { fontSize: 10, fontFamily: fonts.sans, letterSpacing: 1.2, textAlign: "center" },
});
