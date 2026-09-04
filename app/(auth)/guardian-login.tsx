import { Link } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BrandLogo from "@/components/BrandLogo";
import GalacticBackground from "@/components/GalacticBackground";
import { useTheme } from "@/components/ThemeContext";
import {
  AuthField,
  FormError,
  GoogleSignInButton,
  OrDivider,
  PrimaryButton,
  ScreenTitle,
} from "@/components/ui";
import { OAUTH_LOGIN_ENABLED } from "@/lib/auth/featureFlags";
import { FIGMA_ASSETS } from "@/lib/figma-assets";
import { fonts } from "@/lib/theme";

const NOT_AVAILABLE_MESSAGE =
  "Guardian sign-in isn't available yet — guardians will authenticate via Supabase Auth in a later phase. Check back soon.";

/** Guardian sign-in — UI only for now. your-universe-backend authenticates guardians through
 * Supabase Auth directly from the client (see docs/learner-auth.md there, section 3), which
 * this app doesn't integrate yet; submitting shows a "coming soon" message instead of a real
 * request. Learner sign-in (the wired one) is at /login. */
export default function GuardianLoginScreen() {
  const { colors } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | undefined>(undefined);

  return (
    <GalacticBackground>
      <SafeAreaView style={styles.fill}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <BrandLogo height={32} color={colors.text1} />
          <View style={styles.header}>
            <ScreenTitle title="Guardian Sign In" subtitle="Enter your email and password to log in" />
          </View>
          <View style={styles.form}>
            <FormError message={formError} />
            <AuthField
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              testID="guardian-login-email"
            />
            <AuthField
              label="Password"
              secure
              trailingIcon={FIGMA_ASSETS.auth.eyeOff}
              value={password}
              onChangeText={setPassword}
              testID="guardian-login-password"
            />
            <Text style={[styles.forgot, { color: colors.text2 }]}>Forgot Password ?</Text>
            <PrimaryButton label="Log In" onPress={() => setFormError(NOT_AVAILABLE_MESSAGE)} variant="primary" />
            {OAUTH_LOGIN_ENABLED ? (
              <View style={styles.socialBlock}>
                <OrDivider />
                <GoogleSignInButton />
              </View>
            ) : null}
          </View>
          <Text style={[styles.footer, { color: colors.text2 }]}>
            Signing in as a learner?{" "}
            <Link href="/login" style={{ color: colors.purple, fontFamily: fonts.sansSemiBold }}>
              Learner sign in
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
    letterSpacing: -0.12,
  },
  footer: {
    marginTop: 32,
    textAlign: "center",
    fontSize: 12,
    fontFamily: fonts.sansMedium,
  },
});
