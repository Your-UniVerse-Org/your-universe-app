import { Link, useRouter } from "expo-router";
import { useCallback } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import GalacticBackground from "@/components/GalacticBackground";
import { useSession } from "@/components/SessionContext";
import { useTheme } from "@/components/ThemeContext";
import { AuthField, BackButton, FormError, PrimaryButton, ScreenTitle, SegmentedField } from "@/components/ui";
import { GENDER_OPTIONS } from "@/lib/api/types";
import { useLearnerRegistration } from "@/lib/hooks/useLearnerRegistration";
import { FIGMA_ASSETS } from "@/lib/figma-assets";
import { fonts } from "@/lib/theme";

export default function SignUpScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { login } = useSession();

  const handleSuccess = useCallback(
    async (learner: { email: string }, input: { password: string }) => {
      // Registration itself issues no tokens (see docs/learner-auth.md in
      // your-universe-backend), but the onboarding flow right after this needs a session to
      // save its answers (docs/onboarding.md) — so sign the learner in with the credentials
      // they just submitted. Best-effort: if it fails, onboarding still works locally and
      // just skips its final save (see lib/hooks/useOnboardingFlow.ts).
      await login(learner.email, input.password);
      router.push("/intro");
    },
    [login, router],
  );

  const { values, setField, fieldErrors, formError, submitting, handleSubmit } =
    useLearnerRegistration(handleSuccess);

  return (
    <GalacticBackground>
      <SafeAreaView style={styles.fill}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <BackButton />
          <View style={styles.header}>
            <ScreenTitle title="Sign up" subtitle="Create an account to continue!" />
          </View>
          <View style={styles.form}>
            <FormError message={formError} />
            <AuthField
              label="Full Name"
              leadingIcon={FIGMA_ASSETS.auth.user}
              value={values.full_name}
              onChangeText={(v) => setField("full_name", v)}
              error={fieldErrors.full_name}
              autoCapitalize="words"
              testID="signup-full-name"
            />
            <AuthField
              label="Email"
              value={values.email}
              onChangeText={(v) => setField("email", v)}
              error={fieldErrors.email}
              keyboardType="email-address"
              testID="signup-email"
            />
            <AuthField
              label="School"
              value={values.school}
              onChangeText={(v) => setField("school", v)}
              error={fieldErrors.school}
              autoCapitalize="words"
              testID="signup-school"
            />
            <SegmentedField
              label="Gender"
              value={values.gender}
              options={GENDER_OPTIONS}
              onChange={(v) => setField("gender", v)}
              error={fieldErrors.gender}
            />
            <AuthField
              label="Guardian Email"
              value={values.guardian_email}
              onChangeText={(v) => setField("guardian_email", v)}
              error={fieldErrors.guardian_email}
              keyboardType="email-address"
              testID="signup-guardian-email"
            />
            <AuthField
              label="Birth date"
              placeholder="YYYY-MM-DD"
              trailingIcon={FIGMA_ASSETS.auth.calendar}
              value={values.date_of_birth}
              onChangeText={(v) => setField("date_of_birth", v)}
              error={fieldErrors.date_of_birth}
              testID="signup-date-of-birth"
            />
            <AuthField
              label="Phone Number"
              placeholder="+27821234567"
              trailingIcon={FIGMA_ASSETS.auth.arrowDown}
              value={values.phone_number}
              onChangeText={(v) => setField("phone_number", v)}
              error={fieldErrors.phone_number}
              keyboardType="phone-pad"
              testID="signup-phone-number"
            />
            <AuthField
              label="Set Password"
              secure
              trailingIcon={FIGMA_ASSETS.auth.eyeOff}
              value={values.password}
              onChangeText={(v) => setField("password", v)}
              error={fieldErrors.password}
              testID="signup-password"
            />
            <View style={styles.registerWrap}>
              <PrimaryButton
                label="Register"
                onPress={handleSubmit}
                loading={submitting}
                variant="primary"
              />
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
