import { LinearGradient } from "expo-linear-gradient";

import { StyleSheet, View, type ViewProps } from "react-native";

import Svg, { Defs, Line, Pattern, Rect } from "react-native-svg";

import ElectricBeams from "@/components/ElectricBeams";

import { useTheme } from "@/components/ThemeContext";



type Props = ViewProps & {

  children: React.ReactNode;

  variant?: "default" | "splash";

};



export default function GalacticBackground({ children, variant = "default", style, ...rest }: Props) {
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }, style]} {...rest}>
      <LinearGradient colors={colors.gradient} style={StyleSheet.absoluteFill} />

      <View style={[styles.gridWrap, { opacity: isDark ? 0.55 : 0.72 }]} pointerEvents="none">

        <Svg width="100%" height="100%">

          <Defs>

            <Pattern id="grid" width={72} height={72} patternUnits="userSpaceOnUse">

              <Line x1={0} y1={0} x2={72} y2={0} stroke={colors.gridLine} strokeWidth={1} />

              <Line x1={0} y1={0} x2={0} y2={72} stroke={colors.gridLine} strokeWidth={1} />

            </Pattern>

          </Defs>

          <Rect width="100%" height="100%" fill="url(#grid)" opacity={0.85} />

        </Svg>

      </View>



      <LinearGradient colors={colors.topGlow} style={styles.topGlow} pointerEvents="none" />



      {variant === "splash" ? (

        <View style={[styles.orangeOrb, { backgroundColor: colors.orangeDim }]} pointerEvents="none" />

      ) : null}



      <View style={[styles.purpleOrb, { backgroundColor: colors.purpleDim }]} pointerEvents="none" />



      {colors.beamsVisible ? <ElectricBeams /> : null}



      <View style={styles.content}>{children}</View>

    </View>

  );

}



const styles = StyleSheet.create({

  root: { flex: 1 },

  gridWrap: { ...StyleSheet.absoluteFill, opacity: 0.55 },

  topGlow: {

    position: "absolute",

    top: 0,

    left: 0,

    right: 0,

    height: 320,

  },

  purpleOrb: {

    position: "absolute",

    top: "8%",

    right: "-10%",

    width: 220,

    height: 220,

    borderRadius: 999,

  },

  orangeOrb: {

    position: "absolute",

    bottom: "18%",

    left: "-8%",

    width: 180,

    height: 180,

    borderRadius: 999,

  },

  content: { flex: 1 },

});


