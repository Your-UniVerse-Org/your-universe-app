import { Link } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BrandLogo from "@/components/BrandLogo";
import GalacticBackground from "@/components/GalacticBackground";
import {
  AuthField,
  GoogleSignInButton,
  OrDivider,
  PrimaryButton,
  ScreenTitle,
} from "@/components/ui";
import { FIGMA_ASSETS } from "@/lib/figma-assets";
import { colors, fonts } from "@/lib/theme";

export default function LoginScreen() {
  return (
    <GalacticBackground>
      <SafeAreaView style={styles.fill}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <BrandLogo height={32} />
          <View style={styles.header}>
            <ScreenTitle title="Sign in to your Account" subtitle="Enter your email and password to log in" />
          </View>
          <View style={styles.form}>
            <AuthField label="Email" />
            <AuthField label="Password" secure trailingIcon={FIGMA_ASSETS.auth.eyeOff} />
            <Text style={styles.forgot}>Forgot Password ?</Text>
            <PrimaryButton label="Log In" href="/onboarding" variant="primary" />
            <View style={styles.socialBlock}>
              <OrDivider />
              <GoogleSignInButton />
            </View>
          </View>
          <Text style={styles.footer}>
            Don&apos;t have an account?{" "}
            <Link href="/role" style={styles.link}>
              Sign Up
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
  header: { marginTop: 28 },
  form: { marginTop: 28, gap: 16 },
  socialBlock: { marginTop: 8, gap: 16 },
  forgot: {
    textAlign: "right",
    fontSize: 12,
    fontFamily: fonts.sansSemiBold,
    color: colors.text2,
    letterSpacing: -0.12,
  },
  footer: {
    marginTop: 32,
    textAlign: "center",
    fontSize: 12,
    fontFamily: fonts.sansMedium,
    color: colors.text2,
  },
  link: { fontFamily: fonts.sansSemiBold, color: colors.purple },
});
