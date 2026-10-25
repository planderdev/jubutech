import { useState } from "react";
import { ScrollView, StyleSheet, View, type NativeScrollEvent, type NativeSyntheticEvent, type ViewStyle, type StyleProp } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppHeader } from "@/components/app-header";
import { SHELL, T } from "@/theme";

/**
 * `.app-shell.app-shell--grouped` — 상단 헤더 + 스크롤 본문.
 * 홈 계열(grouped)은 회색 캔버스(`surface-alt`) 위에 흰 그룹 카드를 얹고, 플로팅 탭바 높이만큼 아래 여백을 둔다.
 */
export function AppScreen({ children, grouped = true, title, onBack, contentStyle, scroll = true }: { children: React.ReactNode; grouped?: boolean; title?: string; onBack?: () => void; contentStyle?: StyleProp<ViewStyle>; scroll?: boolean }) {
  const insets = useSafeAreaInsets();
  const [scrolled, setScrolled] = useState(false);
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => setScrolled(e.nativeEvent.contentOffset.y > 4);
  const bg = grouped ? T.background.normalAlternative : T.background.normalNormal;
  const bottom = SHELL.contentBottomSpace + insets.bottom;
  return (
    <View style={[s.shell, { backgroundColor: bg }]}>
      <AppHeader title={title} onBack={onBack} scrolled={scrolled} />
      {scroll ? (
        <ScrollView onScroll={onScroll} scrollEventThrottle={32} contentContainerStyle={[{ paddingBottom: bottom }, contentStyle]} showsVerticalScrollIndicator={false} contentInsetAdjustmentBehavior="never">
          {children}
        </ScrollView>
      ) : (
        <View style={[{ flex: 1, paddingBottom: bottom }, contentStyle]}>{children}</View>
      )}
    </View>
  );
}

/** `.content-section` — 거터(16) 안쪽에 두는 본문 블록 */
export function ContentSection({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[s.content, style]}>{children}</View>;
}

const s = StyleSheet.create({
  shell: { flex: 1 },
  content: { paddingHorizontal: SHELL.gutter },
});
