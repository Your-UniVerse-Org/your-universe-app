import { Image } from "expo-image";
import { useRouter, type Href } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
  type TextInputProps,
} from "react-native";
import { useTheme } from "@/components/ThemeContext";
import { FIGMA_ASSETS } from "@/lib/figma-assets";
import { fonts, radii } from "@/lib/theme";

export function PrimaryButton({
  label,
  href,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
}: {
  label: string;
  href?: Href;
  onPress?: () => void;
  variant?: "primary" | "orange" | "ghost" | "outline";
  disabled?: boolean;
  loading?: boolean;
}) {
  const router = useRouter();
  const { colors, shadow } = useTheme();

  const handlePress = () => {
    if (disabled || loading) return;
    if (href) router.push(href);
    else onPress?.();
  };

  const variantStyle =
    variant === "orange"
      ? { backgroundColor: colors.orange }
      : variant === "ghost"
        ? { backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border }
        : variant === "outline"
          ? { backgroundColor: "transparent", borderWidth: 1, borderColor: colors.borderPurple }
          : { backgroundColor: colors.purple, ...shadow.purple };

  const textStyle = { color: variant === "ghost" || variant === "outline" ? colors.text1 : colors.white };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      style={[styles.btn, variantStyle, (disabled || loading) && styles.btnDisabled]}
    >
      {loading ? (
        <ActivityIndicator color={textStyle.color} />
      ) : (
        <Text style={[styles.btnText, textStyle]}>{label}</Text>
      )}
    </Pressable>
  );
}

export function AuthField({
  label,
  value,
  onChangeText,
  error,
  secure,
  leadingIcon,
  trailingIcon,
  keyboardType,
  autoCapitalize,
  placeholder,
  testID,
}: {
  label: string;
  value?: string;
  onChangeText?: (value: string) => void;
  error?: string;
  secure?: boolean;
  leadingIcon?: string;
  trailingIcon?: string;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: TextInputProps["autoCapitalize"];
  placeholder?: string;
  testID?: string;
}) {
  const { colors } = useTheme();
  const borderColor = error ? colors.danger : colors.border;
  return (
    <View style={styles.fieldWrap}>
      <Text style={[styles.fieldLabel, { color: colors.text2 }]}>{label}</Text>
      <View style={[styles.inputRow, { borderColor, backgroundColor: colors.surface2 }]}>
        {leadingIcon ? (
          <Image source={{ uri: leadingIcon }} style={styles.fieldIcon} contentFit="contain" />
        ) : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secure}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize ?? "none"}
          placeholder={placeholder}
          placeholderTextColor={colors.text3}
          style={[styles.input, { color: colors.text1 }]}
          selectionColor={colors.purple}
          testID={testID}
        />
        {trailingIcon ? (
          <Image source={{ uri: trailingIcon }} style={styles.fieldIcon} contentFit="contain" />
        ) : null}
      </View>
      {error ? <Text style={[styles.fieldError, { color: colors.danger }]}>{error}</Text> : null}
    </View>
  );
}

export function SegmentedField<T extends string>({
  label,
  value,
  options,
  onChange,
  error,
}: {
  label: string;
  value: T | null;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  error?: string;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.fieldWrap}>
      <Text style={[styles.fieldLabel, { color: colors.text2 }]}>{label}</Text>
      <View style={styles.segmentRow}>
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(option.value)}
              style={[
                styles.segmentPill,
                {
                  backgroundColor: selected ? colors.purpleDim : colors.surface2,
                  borderColor: selected ? colors.purple : error ? colors.danger : colors.border,
                },
              ]}
            >
              <Text style={[styles.segmentText, { color: selected ? colors.purple : colors.text2 }]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {error ? <Text style={[styles.fieldError, { color: colors.danger }]}>{error}</Text> : null}
    </View>
  );
}

export function FormError({ message }: { message?: string }) {
  const { colors } = useTheme();
  if (!message) return null;
  return (
    <View style={[styles.formError, { backgroundColor: colors.dangerDim, borderColor: colors.danger }]}>
      <Text style={[styles.formErrorText, { color: colors.danger }]}>{message}</Text>
    </View>
  );
}

export function OrDivider() {
  const { colors } = useTheme();
  return (
    <View style={styles.orRow}>
      <View style={[styles.orLine, { backgroundColor: colors.border }]} />
      <Text style={[styles.orText, { color: colors.text2 }]}>Or</Text>
      <View style={[styles.orLine, { backgroundColor: colors.border }]} />
    </View>
  );
}

export function GoogleSignInButton({ onPress }: { onPress?: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable style={[styles.googleBtn, { borderColor: colors.border, backgroundColor: colors.surface2 }]} onPress={onPress}>
      <Image source={{ uri: FIGMA_ASSETS.auth.google }} style={styles.googleIcon} contentFit="contain" />
      <Text style={[styles.googleText, { color: colors.text1 }]}>Continue with Google</Text>
    </Pressable>
  );
}

export function BackButton({ onPress }: { onPress?: () => void }) {
  const router = useRouter();
  return (
    <Pressable onPress={onPress ?? (() => router.back())} hitSlop={8} style={styles.backBtn}>
      <Image source={{ uri: FIGMA_ASSETS.logo.backLeft }} style={{ width: 24, height: 24 }} contentFit="contain" />
    </Pressable>
  );
}

export function ProgressBar({ step, total = 6 }: { step: number; total?: number }) {
  const { colors } = useTheme();
  return (
    <View>
      <View style={styles.progressHeader}>
        <Text style={[styles.progressLabel, { color: colors.text2 }]}>PROGRESS</Text>
        <Text style={[styles.progressCount, { color: colors.purple }]}>
          {String(step).padStart(2, "0")}/{String(total).padStart(2, "0")}
        </Text>
      </View>
      <View style={styles.progressRow}>
        {Array.from({ length: total }, (_, i) => (
          <View
            key={i}
            style={[styles.progressSeg, { backgroundColor: i < step ? colors.purple : "rgba(148,163,184,0.2)" }]}
          />
        ))}
      </View>
    </View>
  );
}

export function ScreenTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.titleBlock}>
      <Text style={[styles.screenTitle, { color: colors.text1 }]}>{title}</Text>
      {subtitle ? <Text style={[styles.screenSub, { color: colors.text2 }]}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  btn: {
    height: 48,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    overflow: "hidden",
  },
  btnText: { fontSize: 14, fontFamily: fonts.sansMedium, letterSpacing: -0.14 },
  btnDisabled: { opacity: 0.6 },
  backBtn: { alignSelf: "flex-start" },
  fieldWrap: { gap: 4 },
  fieldError: { fontSize: 12, fontFamily: fonts.sansMedium, marginTop: 2 },
  segmentRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  segmentPill: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  segmentText: { fontSize: 13, fontFamily: fonts.sansMedium },
  formError: {
    borderRadius: radii.md,
    borderWidth: 1,
    padding: 12,
  },
  formErrorText: { fontSize: 13, fontFamily: fonts.sansMedium, lineHeight: 18 },
  fieldLabel: {
    fontSize: 12,
    fontFamily: fonts.sansMedium,
    letterSpacing: -0.24,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 46,
    borderRadius: radii.md,
    borderWidth: 1,
    paddingHorizontal: 14,
  },
  fieldIcon: { width: 16, height: 16 },
  input: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.sansMedium,
    paddingVertical: 0,
  },
  orRow: { flexDirection: "row", alignItems: "center", gap: 16, width: "100%" },
  orLine: { flex: 1, height: 1 },
  orText: { fontSize: 12, fontFamily: fonts.sans },
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: 48,
    borderRadius: radii.md,
    borderWidth: 1,
    width: "100%",
  },
  googleIcon: { width: 18, height: 18 },
  googleText: { fontSize: 14, fontFamily: fonts.sansSemiBold, letterSpacing: -0.14 },
  progressHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  progressLabel: {
    fontSize: 12,
    fontFamily: fonts.ui,
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  progressCount: { fontSize: 20, fontFamily: fonts.uiBold },
  progressRow: { flexDirection: "row", gap: 4 },
  progressSeg: { flex: 1, height: 8, borderRadius: 999 },
  titleBlock: { gap: 8 },
  screenTitle: {
    fontFamily: fonts.display,
    fontSize: 32,
    letterSpacing: -0.5,
    lineHeight: 38,
  },
  screenSub: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    lineHeight: 20,
  },
});
