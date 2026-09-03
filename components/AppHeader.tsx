import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";
import { FIGMA_ASSETS } from "@/lib/figma-assets";

export default function AppHeader() {
  return (
    <View style={styles.row}>
      <Image source={{ uri: FIGMA_ASSETS.logo.withText }} style={styles.logo} contentFit="contain" />
      <View style={styles.avatarWrap}>
        <Image source={{ uri: FIGMA_ASSETS.home.avatar }} style={styles.avatar} contentFit="cover" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  logo: { width: 140, height: 36 },
  avatarWrap: {
    width: 73,
    height: 73,
    borderRadius: 999,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#8b8686",
  },
  avatar: { width: "100%", height: "100%" },
});
