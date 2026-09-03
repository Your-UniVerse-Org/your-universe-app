import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import GalacticBackground from "@/components/GalacticBackground";
import { Pill } from "@/components/GameCard";
import { useTheme } from "@/components/ThemeContext";
import { PrimaryButton } from "@/components/ui";
import { INTRO_CAROUSEL } from "@/lib/onboarding-steps";
import { fonts } from "@/lib/theme";

export default function IntroScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [index, setIndex] = useState(0);
  const slide = INTRO_CAROUSEL[index];

  function next() {
    if (index < INTRO_CAROUSEL.length - 1) setIndex((i) => i + 1);
    else router.push("/onboarding");
  }

  return (
    <GalacticBackground>
      <SafeAreaView style={styles.fill}>
        <View style={styles.content}>
          <Pill label={`Chapter ${index + 1}`} accent="orange" />
          <Text style={[styles.title, { color: colors.text1 }]}>{slide.title}</Text>
          <Image
            source={{ uri: slide.image }}
            style={[styles.image, { borderColor: colors.borderPurple }]}
            contentFit="cover"
          />
          <View style={styles.footer}>
            <PrimaryButton label="Continue" onPress={next} variant="primary" />
            <View style={styles.dots}>
              {INTRO_CAROUSEL.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    { borderColor: colors.borderPurple },
                    i === index && { backgroundColor: colors.purple, borderColor: colors.purple },
                  ]}
                />
              ))}
            </View>
          </View>
        </View>
      </SafeAreaView>
    </GalacticBackground>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { flex: 1, padding: 24, paddingTop: 48, gap: 16 },
  title: {
    fontSize: 22,
    fontFamily: fonts.display,
    textAlign: "center",
    lineHeight: 30,
  },
  image: {
    marginTop: 8,
    width: "100%",
    aspectRatio: 1,
    maxHeight: 300,
    alignSelf: "center",
    borderRadius: 16,
    borderWidth: 1,
  },
  footer: { marginTop: "auto", gap: 24, paddingBottom: 16 },
  dots: { flexDirection: "row", justifyContent: "center", gap: 8 },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: "transparent",
  },
});
