import { useEffect } from "react";
import { StyleSheet, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { BrandMark } from "@/components/BrandLogo";
import { brand, fonts } from "@/lib/theme";

type Props = {
  onComplete: () => void;
  durationMs?: number;
};

/** Website-aligned splash — purple mark, wordmark, gradient progress bar */
export default function LoadingScreen({ onComplete, durationMs = 2800 }: Props) {
  const opacity = useSharedValue(1);
  const markScale = useSharedValue(0.94);
  const markOpacity = useSharedValue(0);
  const labelOpacity = useSharedValue(0);
  const barOpacity = useSharedValue(0);
  const barWidth = useSharedValue(0);

  useEffect(() => {
    markOpacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) });
    markScale.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) });
    labelOpacity.value = withDelay(350, withTiming(1, { duration: 450 }));
    barOpacity.value = withDelay(400, withTiming(1, { duration: 400 }));
    barWidth.value = withDelay(400, withTiming(100, { duration: 2000, easing: Easing.out(Easing.cubic) }));

    const fadeTimer = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 550, easing: Easing.in(Easing.cubic) }, (done) => {
        if (done) runOnJS(onComplete)();
      });
    }, durationMs);

    return () => clearTimeout(fadeTimer);
  }, [barOpacity, barWidth, durationMs, labelOpacity, markOpacity, markScale, onComplete, opacity]);

  const containerStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const markStyle = useAnimatedStyle(() => ({
    opacity: markOpacity.value,
    transform: [{ scale: markScale.value }],
  }));
  const labelStyle = useAnimatedStyle(() => ({ opacity: labelOpacity.value }));
  const barWrapStyle = useAnimatedStyle(() => ({ opacity: barOpacity.value }));
  const barFillStyle = useAnimatedStyle(() => ({ width: `${barWidth.value}%` }));

  return (
    <Animated.View style={[styles.screen, containerStyle]} accessibilityRole="progressbar">
      <Animated.View style={markStyle}>
        <BrandMark height={140} color={brand.purple} />
      </Animated.View>

      <Animated.Text style={[styles.label, labelStyle]}>Your-UniVerse</Animated.Text>

      <Animated.View style={[styles.barTrack, barWrapStyle]}>
        <Animated.View style={[styles.barFillWrap, barFillStyle]}>
          <LinearGradient
            colors={["#334155", brand.purple, brand.orange]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.barFill}
          />
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    marginTop: 22,
    fontFamily: fonts.ui,
    fontSize: 13,
    letterSpacing: 4.2,
    textTransform: "uppercase",
    color: "#475569",
  },
  barTrack: {
    marginTop: 32,
    width: 100,
    height: 1,
    backgroundColor: "rgba(15,23,42,0.08)",
    borderRadius: 99,
    overflow: "hidden",
  },
  barFillWrap: {
    height: "100%",
    overflow: "hidden",
    borderRadius: 99,
  },
  barFill: {
    width: 100,
    height: "100%",
    borderRadius: 99,
  },
});
