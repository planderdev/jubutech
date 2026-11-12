import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { BRAND, CTRL, RAD, SP, typo } from "@/theme";

/** 카카오 로그인 버튼 — 카카오 디자인 가이드(노랑 #FEE500 · 글자 #191600 · 말풍선 심볼). 웹 `/login` 의 버튼과 같은 모양 */
export function KakaoButton({ label = "카카오로 3초 만에 시작", onPress, disabled, busy }: { label?: string; onPress?: () => void; disabled?: boolean; busy?: boolean }) {
  return (
    <Pressable onPress={onPress} disabled={disabled || busy} accessibilityRole="button" accessibilityState={{ disabled: !!disabled || !!busy }} style={({ pressed }) => [s.button, pressed && { opacity: 0.85 }, (disabled || busy) && { opacity: 0.5 }]}>
      <View style={s.icon}>
        <Svg viewBox="0 0 24 24" width={20} height={20} fill={BRAND.kakaoLabel}>
          <Path d="M12 3C6.5 3 2 6.6 2 11c0 2.8 1.8 5.2 4.6 6.6L5.5 21l4.4-2.9c.7.1 1.4.2 2.1.2 5.5 0 10-3.6 10-8.1S17.5 3 12 3z" />
        </Svg>
      </View>
      <Text style={typo("body1", "semibold", BRAND.kakaoLabel)}>{busy ? "카카오로 이동 중…" : label}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  button: { height: CTRL.xl, borderRadius: RAD.lg, backgroundColor: BRAND.kakao, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: SP[8], alignSelf: "stretch", paddingHorizontal: SP[24] },
  icon: { width: 20, height: 20 },
});
