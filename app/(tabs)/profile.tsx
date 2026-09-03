import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import GalacticBackground from "@/components/GalacticBackground";
import GameCard from "@/components/GameCard";
import ThemeToggle from "@/components/ThemeToggle";
import { useTheme } from "@/components/ThemeContext";
import YourUniverseScore from "@/components/YourUniverseScore";
import { FIGMA_ASSETS } from "@/lib/figma-assets";
import { fonts } from "@/lib/theme";

function DetailRow({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.row, { borderColor: colors.border, backgroundColor: colors.surface2 }]}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowLabel, { color: colors.text2 }]}>{label}</Text>
        <Text style={[styles.rowValue, { color: colors.text1 }]}>{value}</Text>
      </View>
      <Image source={{ uri: FIGMA_ASSETS.profile.chevron }} style={styles.chevron} contentFit="contain" />
    </View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <GalacticBackground>
      <SafeAreaView style={styles.fill} edges={["top"]}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={[styles.screenTitle, { color: colors.text1 }]}>Profile</Text>

          <View style={styles.avatarSection}>
            <View style={[styles.avatarWrap, { borderColor: colors.borderPurple }]}>
              <Image source={{ uri: FIGMA_ASSETS.profile.avatar }} style={styles.avatar} contentFit="cover" />
              <View style={styles.badgePos}>
                <YourUniverseScore variant="badge" />
              </View>
            </View>
            <Text style={[styles.name, { color: colors.text1 }]}>User EG</Text>
            <Text style={[styles.grade, { color: colors.text2 }]}>Grade 11 · Willowridge Highschool</Text>
          </View>

          <YourUniverseScore variant="compact" />

          <GameCard title="Appearance">
            <Text style={[styles.appearanceHint, { color: colors.text2 }]}>
              Switch between light and dark mode
            </Text>
            <ThemeToggle />
          </GameCard>

          <GameCard title="Personal Details">
            <DetailRow label="Full Name" value="User EG" />
            <DetailRow label="Email Address" value="User.eg@example.com" />
          </GameCard>

          <GameCard title="School Details">
            <DetailRow label="School Name" value="Willowridge Highschool, Pretoria" />
            <DetailRow label="School Code" value="WLD-2026" />
            <DetailRow label="Current Grade" value="Grade 11" />
          </GameCard>

          <Pressable style={[styles.signOut, { backgroundColor: colors.purple }]} onPress={() => router.replace("/welcome")}>
            <Image source={{ uri: FIGMA_ASSETS.profile.signOut }} style={[styles.signOutIcon, { tintColor: colors.white }]} contentFit="contain" />
            <Text style={[styles.signOutText, { color: colors.white }]}>Sign-out</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </GalacticBackground>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { paddingBottom: 120, paddingTop: 24, paddingHorizontal: 20, gap: 16 },
  screenTitle: { fontFamily: fonts.uiBold, fontSize: 28, marginBottom: 4 },
  avatarSection: { alignItems: "center", gap: 8, marginBottom: 4 },
  avatarWrap: {
    width: 120,
    height: 120,
    borderRadius: 999,
    overflow: "visible",
    borderWidth: 2,
    position: "relative",
  },
  avatar: { width: "100%", height: "100%", borderRadius: 999 },
  badgePos: {
    position: "absolute",
    right: -6,
    bottom: -4,
  },
  name: { fontFamily: fonts.uiBold, fontSize: 22, marginTop: 8 },
  grade: { fontFamily: fonts.sans, fontSize: 13, textAlign: "center" },
  appearanceHint: { fontFamily: fonts.sans, fontSize: 13, marginBottom: 10 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  rowLabel: { fontSize: 11, fontFamily: fonts.sans, textTransform: "uppercase" },
  rowValue: { marginTop: 4, fontSize: 15, fontFamily: fonts.sansSemiBold },
  chevron: { width: 8, height: 12, opacity: 0.6 },
  signOut: {
    marginTop: 8,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  signOutIcon: { width: 14, height: 14 },
  signOutText: { fontSize: 14, fontFamily: fonts.sansSemiBold },
});
