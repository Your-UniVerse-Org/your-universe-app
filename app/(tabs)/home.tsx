import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BrandLogo from "@/components/BrandLogo";
import GalacticBackground from "@/components/GalacticBackground";
import GameCard, { Pill } from "@/components/GameCard";
import MyJourneyStrip from "@/components/MyJourneyStrip";
import NextBestAction from "@/components/NextBestAction";
import ScreenEntrance from "@/components/ScreenEntrance";
import ThemeToggle from "@/components/ThemeToggle";
import { useTheme } from "@/components/ThemeContext";
import XpBar from "@/components/XpBar";
import { FIGMA_ASSETS } from "@/lib/figma-assets";
import { fonts } from "@/lib/theme";

const EXPLORE_CARDS = [
  {
    image: FIGMA_ASSETS.home.card1,
    tag: "EVENT",
    accentKey: "orangeText" as const,
    tagBgKey: "orangeDim" as const,
    title: "UCT Open Day",
    desc: "Explore the campus this Saturday.",
  },
  {
    image: FIGMA_ASSETS.home.card2,
    tag: "COURSE",
    accentKey: "purple" as const,
    tagBgKey: "purpleDim" as const,
    title: "Intro to Data Science",
    desc: "Trending skill in your interest area.",
  },
  {
    image: FIGMA_ASSETS.home.card3,
    tag: "FINANCE",
    accentKey: "orangeText" as const,
    tagBgKey: "orangeDim" as const,
    title: "Bursary Opportunities",
    desc: "Deadlines approaching for 2025.",
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <GalacticBackground>
      <SafeAreaView style={styles.fill} edges={["top"]}>
        <ScreenEntrance>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.headerRow}>
              <BrandLogo height={30} color={colors.text1} />
              <View style={styles.headerRight}>
                <ThemeToggle compact />
                <View style={[styles.avatarWrap, { borderColor: colors.borderPurple }]}>
                  <Image source={{ uri: FIGMA_ASSETS.home.avatar }} style={styles.avatar} contentFit="cover" />
                </View>
              </View>
            </View>

            <View style={styles.heroBlock}>
              <Pill label="Level 3 · Explorer" />
              <Text style={[styles.greeting, { color: colors.text1 }]}>
                Hi, <Text style={{ color: colors.text2 }}>User</Text> 👋
              </Text>
              <Text style={[styles.subline, { color: colors.text2 }]}>
                Your personal education command centre.
              </Text>
            </View>

            <XpBar level={3} xp={240} maxXp={500} title="Explorer" />

            <NextBestAction
              title="Complete your academic profile"
              subtitle="Better recommendations unlock as your profile grows."
              cta="Continue"
              onPress={() => router.push("/onboarding")}
            />

            <MyJourneyStrip />

            <GameCard title="Your Progress" accent="purple">
              <View style={styles.progressRow}>
                <View style={styles.ringWrap}>
                  <Image source={{ uri: FIGMA_ASSETS.home.ringTrack }} style={styles.ring} contentFit="contain" />
                  <Image source={{ uri: FIGMA_ASSETS.home.ringFill }} style={styles.ring} contentFit="contain" />
                  <Text style={[styles.ringText, { color: colors.text1 }]}>75%</Text>
                </View>
                <View style={styles.progressMeta}>
                  <Text style={[styles.progressLabel, { color: colors.text2 }]}>Profile Completion</Text>
                  <Text style={[styles.streak, { color: colors.text1 }]}>
                    5 <Text style={{ color: colors.text2, fontFamily: fonts.sans }}>Day Streak</Text>
                  </Text>
                </View>
              </View>
            </GameCard>

            <Text style={[styles.sectionTitle, { color: colors.text1 }]}>Explore</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardsRow}>
              {EXPLORE_CARDS.map((card) => (
                <GameCard key={card.title} accent="purple" style={styles.exploreCard}>
                  <Image source={{ uri: card.image }} style={styles.exploreImage} contentFit="cover" />
                  <View style={[styles.tag, { backgroundColor: colors[card.tagBgKey] }]}>
                    <Text style={[styles.tagText, { color: colors[card.accentKey] }]}>{card.tag}</Text>
                  </View>
                  <Text style={[styles.exploreTitle, { color: colors.text1 }]}>{card.title}</Text>
                  <Text style={[styles.exploreDesc, { color: colors.text2 }]}>{card.desc}</Text>
                </GameCard>
              ))}
            </ScrollView>
          </ScrollView>
        </ScreenEntrance>
      </SafeAreaView>
    </GalacticBackground>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 120, paddingTop: 8, gap: 18 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  avatarWrap: {
    width: 44,
    height: 44,
    borderRadius: 999,
    overflow: "hidden",
    borderWidth: 1,
  },
  avatar: { width: "100%", height: "100%" },
  heroBlock: { gap: 8 },
  greeting: { fontFamily: fonts.uiBold, fontSize: 26, letterSpacing: -0.3 },
  subline: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 21 },
  progressRow: { flexDirection: "row", alignItems: "center", gap: 20, marginTop: 4 },
  ringWrap: { width: 72, height: 72, alignItems: "center", justifyContent: "center" },
  ring: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  ringText: { fontFamily: fonts.uiBold, fontSize: 18 },
  progressMeta: { flex: 1, gap: 4 },
  progressLabel: { fontFamily: fonts.sansSemiBold, fontSize: 13 },
  streak: { fontFamily: fonts.uiBold, fontSize: 18 },
  sectionTitle: { fontFamily: fonts.uiBold, fontSize: 22, marginTop: 4 },
  cardsRow: { gap: 16, paddingBottom: 8 },
  exploreCard: { width: 260 },
  exploreImage: { width: "100%", height: 120, borderRadius: 10, marginBottom: 10 },
  tag: { alignSelf: "flex-start", borderRadius: 4, paddingHorizontal: 8, paddingVertical: 4, marginBottom: 6 },
  tagText: { fontFamily: fonts.ui, fontSize: 11, letterSpacing: 0.6 },
  exploreTitle: { fontFamily: fonts.sansSemiBold, fontSize: 14 },
  exploreDesc: { fontFamily: fonts.sans, fontSize: 13, marginTop: 4 },
});
