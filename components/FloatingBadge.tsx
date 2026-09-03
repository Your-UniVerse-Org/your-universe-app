import { useEffect, type ReactNode } from "react";
import { StyleSheet, Text, View, type ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
} from "react-native-reanimated";
import { colors, fonts } from "@/lib/theme";

type Props = {
  label: string;
  accent?: string;
  style?: ViewStyle;
  delay?: number;
  icon?: ReactNode;
};

/** Orbit-style badge — mirrors website HeroVisual floating pills */
export default function FloatingBadge({ label, accent = colors.purple, style, delay = 0, icon }: Props) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.7);
  const translateY = useSharedValue(8);

  useEffect(() => {
    opacity.value = withDelay(delay, withSpring(1, { damping: 14, stiffness: 120 }));
    scale.value = withDelay(delay, withSpring(1, { damping: 12, stiffness: 140 }));
    translateY.value = withDelay(delay, withSpring(0, { damping: 14, stiffness: 120 }));
  }, [delay, opacity, scale, translateY]);

  const anim = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.badge,
        {
          borderColor: `${accent}44`,
          shadowColor: accent,
        },
        style,
        anim,
      ]}
    >
      {icon ? <View style={styles.iconWrap}>{icon}</View> : null}
      <Text style={styles.label}>{label}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(15,24,40,0.92)",
    borderWidth: 1,
    borderRadius: 99,
    paddingHorizontal: 14,
    paddingVertical: 8,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
    zIndex: 10,
  },
  iconWrap: { flexShrink: 0 },
  label: {
    fontFamily: fonts.ui,
    fontSize: 11,
    color: "rgba(241,245,249,0.82)",
    letterSpacing: 0.4,
  },
});
