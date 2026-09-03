import { Link } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import GalacticBackground from "@/components/GalacticBackground";
import { useTheme } from "@/components/ThemeContext";
import { AuthField, BackButton, PrimaryButton, ScreenTitle } from "@/components/ui";
import { FIGMA_ASSETS } from "@/lib/figma-assets";
import { fonts } from "@/lib/theme";

export default function SignUpScreen() {
  const { colors } = useTheme();

  return (
    <GalacticBackground>
      <SafeAreaView style={styles.fill}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <BackButton />
          <View style={styles.header}>
            <ScreenTitle title="Sign up" subtitle="Create an account to continue!" />
          </View>
          <View style={styles.form}>
            <AuthField label="Full Name" leadingIcon={FIGMA_ASSETS.auth.user} />
            <AuthField label="Email" />
            <AuthField label="School" />
            <AuthField label="Gender" />
            <AuthField label="Guardian Email" />
            <AuthField label="Birth date" trailingIcon={FIGMA_ASSETS.auth.calendar} />
            <AuthField label="Phone Number" trailingIcon={FIGMA_ASSETS.auth.arrowDown} />
            <AuthField label="Set Password" secure trailingIcon={FIGMA_ASSETS.auth.eyeOff} />
            <View style={styles.registerWrap}>
              <PrimaryButton label="Register" href="/intro" variant="primary" />
            </View>
          </View>
          <Text style={[styles.footer, { color: colors.text2 }]}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: colors.purple, fontFamily: fonts.sansSemiBold }}>
              Login
            </Link>
          </Text>
        </ScrollView>
      </SafeAreaView>
    </GalacticBackground>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { padding: 24, paddingTop: 16, paddingBottom: 40 },
  header: { marginTop: 24 },
  form: { marginTop: 28, gap: 16 },
  registerWrap: { marginTop: 8 },
  footer: { marginTop: 24, textAlign: "center", fontSize: 12, fontFamily: fonts.sansMedium },
});
