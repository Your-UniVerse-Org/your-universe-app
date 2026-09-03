import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BackButton, PrimaryButton, ProgressBar } from "@/components/ui";
import GalacticBackground from "@/components/GalacticBackground";
import { Pill } from "@/components/GameCard";
import { FIGMA_ASSETS } from "@/lib/figma-assets";
import {
  CAREER_OPTIONS,
  GRADE_OPTIONS,
  ONBOARDING_STEPS,
  PATHWAY_OPTIONS,
  PRIORITY_OPTIONS,
  STRENGTH_OPTIONS,
} from "@/lib/onboarding-steps";
import { colors } from "@/lib/theme";

const STEP_COPY: Record<string, { title: string; subtitle: string }> = {
  grade: {
    title: "What grade are you in?",
    subtitle: "This helps us give you advice that's relevant to where you are now.",
  },
  strengths: {
    title: "What are you good at?",
    subtitle: "Choose 3-5 strengths that sound most like you.",
  },
  priorities: {
    title: "What matters when choosing where to study?",
    subtitle: "Choose the things that are important to you. Select as many as you like.",
  },
  careers: {
    title: "Which career fields interest you?",
    subtitle: "Pick the area that excites you most.",
  },
  pathway: {
    title: "What path are you considering after school?",
    subtitle: "Choose the option that fits your plans best.",
  },
};

export default function OnboardingFlow() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [selections, setSelections] = useState<Record<number, string[]>>({});

  const step = ONBOARDING_STEPS[stepIndex];
  const selected = selections[stepIndex] ?? [];

  function toggle(id: string, multi?: boolean) {
    setSelections((prev) => {
      const cur = prev[stepIndex] ?? [];
      if (multi) {
        const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
        return { ...prev, [stepIndex]: next };
      }
      return { ...prev, [stepIndex]: [id] };
    });
  }

  function next() {
    if (stepIndex < ONBOARDING_STEPS.length - 1) setStepIndex((s) => s + 1);
    else router.replace("/home");
  }

  function skip() {
    router.replace("/home");
  }

  function back() {
    if (stepIndex > 0) setStepIndex((s) => s - 1);
  }

  if (step.kind === "intro") {
    return (
      <GalacticBackground>
        <SafeAreaView style={styles.fill}>
          <ScrollView contentContainerStyle={styles.introContent}>
            <Pill label="Quest · Onboarding" />
            <Image
            source={{ uri: FIGMA_ASSETS.onboarding.introIllustration }}
            style={styles.introImage}
            contentFit="cover"
          />
          <View style={styles.introBadge}>
            <Image source={{ uri: FIGMA_ASSETS.onboarding.clock }} style={styles.clock} contentFit="contain" />
            <Text style={styles.introBadgeText}>About 3 minutes</Text>
          </View>
          <Text style={styles.title}>Let&apos;s get to know you.</Text>
          <Text style={styles.subtitle}>
            Answer a few quick questions so we can personalise your Your Uni-Verse experience.
          </Text>
          <View style={styles.actions}>
            <PrimaryButton label="Continue" onPress={next} variant="primary" />
            <PrimaryButton label="Skip For Now" onPress={skip} variant="ghost" />
          </View>
        </ScrollView>
      </SafeAreaView>
      </GalacticBackground>
    );
  }

  if (step.kind === "summary") {
    return (
      <GalacticBackground>
        <SafeAreaView style={styles.fill}>
        <ScrollView contentContainerStyle={styles.stepContent}>
          <ProgressBar step={step.progress} />
          <Text style={[styles.title, styles.centered]}>You&apos;re all set!</Text>
          <Text style={[styles.subtitle, styles.centered]}>
            Your profile is ready. Let&apos;s explore Your-UniVerse.
          </Text>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Your Profile</Text>
            <Text style={styles.summaryLabel}>Focus</Text>
            <Text style={styles.summaryValue}>Science & Technology</Text>
          </View>
          <View style={styles.actions}>
            <PrimaryButton label="Go to Home" onPress={next} variant="primary" />
          </View>
        </ScrollView>
      </SafeAreaView>
      </GalacticBackground>
    );
  }

  const meta = STEP_COPY[step.kind];

  return (
    <GalacticBackground>
      <SafeAreaView style={styles.fill}>
      <ScrollView contentContainerStyle={styles.stepContent}>
        <BackButton onPress={back} />
        <View style={styles.progressWrap}>
          <ProgressBar step={step.progress} />
        </View>
        <Text style={[styles.title, styles.centered]}>{meta.title}</Text>
        <Text style={[styles.subtitle, styles.centered]}>{meta.subtitle}</Text>

        {step.kind === "grade" && (
          <View style={styles.gradeGrid}>
            {GRADE_OPTIONS.map(({ id, num, label }) => {
              const active = selected.includes(id);
              return (
                <Pressable
                  key={id}
                  onPress={() => toggle(id)}
                  style={[styles.gradeCard, active && styles.cardActive]}
                >
                  <View style={styles.gradeCircle}>
                    <Text style={styles.gradeNum}>{num}</Text>
                  </View>
                  <Text style={styles.gradeLabel}>{label}</Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {step.kind === "strengths" && (
          <View style={styles.chipGrid}>
            {STRENGTH_OPTIONS.map((label) => {
              const active = selected.includes(label);
              return (
                <Pressable
                  key={label}
                  onPress={() => toggle(label, true)}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {step.kind === "priorities" && (
          <View style={styles.chipGrid}>
            {PRIORITY_OPTIONS.map((label) => {
              const active = selected.includes(label);
              return (
                <Pressable
                  key={label}
                  onPress={() => toggle(label, true)}
                  style={[styles.priorityChip, active && styles.cardActive]}
                >
                  <Text style={styles.chipText}>{label}</Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {step.kind === "careers" && (
          <View style={styles.list}>
            {CAREER_OPTIONS.map(({ id, title, desc }) => {
              const active = selected.includes(id);
              return (
                <Pressable
                  key={id}
                  onPress={() => toggle(id)}
                  style={[styles.listCard, active && styles.cardActive]}
                >
                  <Text style={styles.listTitle}>{title}</Text>
                  <Text style={styles.listDesc}>{desc}</Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {step.kind === "pathway" && (
          <View style={styles.list}>
            {PATHWAY_OPTIONS.map(({ id, title, desc }) => {
              const active = selected.includes(id);
              return (
                <Pressable
                  key={id}
                  onPress={() => toggle(id)}
                  style={[styles.pathCard, active && styles.cardActive]}
                >
                  <Text style={styles.listTitle}>{title}</Text>
                  <Text style={styles.listDesc}>{desc}</Text>
                </Pressable>
              );
            })}
          </View>
        )}

        <View style={styles.actions}>
          <PrimaryButton label="Continue" onPress={next} variant="primary" />
        </View>
      </ScrollView>
    </SafeAreaView>
    </GalacticBackground>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  introContent: { padding: 24, paddingTop: 32, alignItems: "center" },
  stepContent: { padding: 20, paddingTop: 44, paddingBottom: 40 },
  introImage: { width: 238, height: 238, borderRadius: 12 },
  introBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 32,
    backgroundColor: colors.purpleDim,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.purpleBorder,
  },
  clock: { width: 14, height: 14 },
  introBadgeText: { fontSize: 14, fontWeight: "600", color: colors.text2, letterSpacing: 0.7 },
  title: { marginTop: 16, fontSize: 32, fontWeight: "700", color: colors.text1, lineHeight: 40 },
  subtitle: { marginTop: 12, fontSize: 18, color: colors.text2, lineHeight: 28 },
  centered: { textAlign: "center" },
  actions: { marginTop: 32, gap: 12, width: "100%", maxWidth: 287, alignSelf: "center" },
  progressWrap: { marginTop: 16 },
  gradeGrid: { marginTop: 32, flexDirection: "row", flexWrap: "wrap", gap: 24, justifyContent: "center" },
  gradeCard: {
    width: "44%",
    alignItems: "center",
    gap: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface2,
    padding: 24,
  },
  cardActive: { borderColor: colors.purple, backgroundColor: colors.purpleDim },
  gradeCircle: {
    width: 64,
    height: 64,
    borderRadius: 999,
    backgroundColor: "rgba(124,58,237,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  gradeNum: { fontSize: 20, fontWeight: "700", color: colors.purple },
  gradeLabel: { fontSize: 24, fontWeight: "600", color: colors.text1 },
  chipGrid: { marginTop: 24, flexDirection: "row", flexWrap: "wrap", gap: 16 },
  chip: {
    width: "47%",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface2,
    padding: 20,
    alignItems: "center",
  },
  chipActive: { borderColor: colors.purple, backgroundColor: colors.purpleDim },
  chipText: { fontSize: 14, fontWeight: "600", color: colors.text1, letterSpacing: 0.7, textAlign: "center" },
  chipTextActive: { color: colors.purple },
  priorityChip: {
    width: "47%",
    minHeight: 120,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface2,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  list: { marginTop: 24, gap: 16 },
  listCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface2,
    padding: 20,
  },
  pathCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface2,
    padding: 24,
    alignItems: "center",
  },
  listTitle: { fontSize: 24, fontWeight: "700", color: colors.text1 },
  listDesc: { marginTop: 8, fontSize: 14, color: colors.text2 },
  summaryCard: {
    marginTop: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderPurple,
    backgroundColor: colors.surface2,
    padding: 24,
  },
  summaryTitle: { fontSize: 24, fontWeight: "700", color: colors.text1 },
  summaryLabel: {
    marginTop: 16,
    fontSize: 14,
    fontWeight: "600",
    color: colors.text2,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  summaryValue: { marginTop: 4, fontSize: 16, fontWeight: "700", color: colors.text1 },
});
