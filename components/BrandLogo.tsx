import Svg, { Path } from "react-native-svg";
import { StyleSheet, Text, View, type ViewStyle } from "react-native";
import {
  BRAND_MARK_ASPECT,
  BRAND_MARK_COLOR,
  BRAND_MARK_PATH,
  BRAND_MARK_VIEWBOX,
} from "@/lib/brand-mark";
import { colors, fonts } from "@/lib/theme";

type Props = {
  height?: number;
  showText?: boolean;
  color?: string;
  style?: ViewStyle;
};

export function BrandMark({ height = 48, color = BRAND_MARK_COLOR }: { height?: number; color?: string }) {
  const width = Math.round(height * BRAND_MARK_ASPECT);
  return (
    <Svg viewBox={BRAND_MARK_VIEWBOX} width={width} height={height} fill="none">
      <Path d={BRAND_MARK_PATH} fill={color} fillRule="evenodd" clipRule="evenodd" />
    </Svg>
  );
}

export default function BrandLogo({ height = 40, showText = true, color = colors.white, style }: Props) {
  const markH = height;
  const markW = Math.round(markH * BRAND_MARK_ASPECT);
  return (
    <View style={[styles.row, style]}>
      <Svg viewBox={BRAND_MARK_VIEWBOX} width={markW} height={markH} fill="none">
        <Path d={BRAND_MARK_PATH} fill={color} fillRule="evenodd" clipRule="evenodd" />
      </Svg>
      {showText ? (
        <Text style={[styles.wordmark, { color, fontSize: Math.round(height * 0.56) }]}>Your-UniVerse</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  wordmark: {
    fontFamily: fonts.uiBold,
    letterSpacing: -0.5,
  },
});
