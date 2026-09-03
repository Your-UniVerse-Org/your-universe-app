import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle, Defs, Line, LinearGradient, Polyline, Stop } from "react-native-svg";
import { useTheme } from "@/components/ThemeContext";

const AnimatedView = Animated.createAnimatedComponent(View);

function BeamLine({
  x1,
  y1,
  x2,
  y2,
  stroke,
  strokeWidth,
  delay = 0,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  stroke: string;
  strokeWidth: number;
  delay?: number;
}) {
  const opacity = useSharedValue(0.15);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.55, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.15, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      ),
    );
  }, [delay, opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <AnimatedView style={[StyleSheet.absoluteFill, style]} pointerEvents="none">
      <Svg width="100%" height="100%" viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice">
        <Line x1={x1} y1={y1} x2={x2} y2={y2} stroke={stroke} strokeWidth={strokeWidth} />
      </Svg>
    </AnimatedView>
  );
}

function PulseOrb({ cx, cy, r, color, delay = 0 }: { cx: number; cy: number; r: number; color: string; delay?: number }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1.18, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      ),
    );
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.4, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      ),
    );
  }, [delay, opacity, scale]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedView
      style={[
        {
          position: "absolute",
          left: `${(cx / 390) * 100}%`,
          top: `${(cy / 844) * 100}%`,
          width: r * 2,
          height: r * 2,
          marginLeft: -r,
          marginTop: -r,
          borderRadius: 999,
          backgroundColor: color,
        },
        style,
      ]}
      pointerEvents="none"
    />
  );
}

/** Animated galactic energy layer — theme-aware for light + dark */
export default function ElectricBeams() {
  const { colors } = useTheme();
  const arcOpacity = useSharedValue(0.2);

  useEffect(() => {
    arcOpacity.value = withRepeat(
      withSequence(
        withTiming(0.45, { duration: 400 }),
        withTiming(0.15, { duration: 400 }),
        withTiming(0.35, { duration: 300 }),
        withTiming(0.2, { duration: 600 }),
      ),
      -1,
      false,
    );
  }, [arcOpacity]);

  const arcStyle = useAnimatedStyle(() => ({ opacity: arcOpacity.value }));

  return (
    <View style={styles.wrap} pointerEvents="none">
      <BeamLine x1={-40} y1={160} x2={430} y2={620} stroke={colors.beamPrimary} strokeWidth={1.5} />
      <BeamLine x1={430} y1={80} x2={-40} y2={520} stroke={colors.beamSecondary} strokeWidth={1} delay={600} />
      <BeamLine x1={60} y1={820} x2={340} y2={40} stroke={colors.beamOrange} strokeWidth={0.8} delay={1200} />

      <AnimatedView style={[StyleSheet.absoluteFill, arcStyle]} pointerEvents="none">
        <Svg width="100%" height="100%" viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice">
          <Defs>
            <LinearGradient id="beamPurple" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="rgba(119,77,255,0)" />
              <Stop offset="50%" stopColor={colors.beamPrimary} />
              <Stop offset="100%" stopColor="rgba(119,77,255,0)" />
            </LinearGradient>
          </Defs>
          <Polyline
            points="0,140 36,158 24,190 58,208 42,238 88,252 72,282 128,298"
            stroke={colors.beamArc}
            strokeWidth={1.2}
            fill="none"
            strokeLinejoin="round"
          />
          <Polyline
            points="390,280 348,300 362,332 318,348 334,378 288,392"
            stroke={colors.beamSecondary}
            strokeWidth={1}
            fill="none"
            strokeLinejoin="round"
          />
          <Line x1={0} y1={420} x2={390} y2={360} stroke="url(#beamPurple)" strokeWidth={0.6} />
          <Circle cx={180} cy={420} r={2.5} fill={colors.beamPrimary} />
          <Circle cx={280} cy={240} r={2} fill={colors.beamOrange} />
        </Svg>
      </AnimatedView>

      <PulseOrb cx={0} cy={180} r={36} color={colors.orbPurple} />
      <PulseOrb cx={390} cy={90} r={42} color={colors.orbPurple} delay={500} />
      <PulseOrb cx={70} cy={780} r={38} color={colors.orbOrange} delay={1000} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { ...StyleSheet.absoluteFill, overflow: "hidden" },
});
