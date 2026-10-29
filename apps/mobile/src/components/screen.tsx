import { useState, type ReactNode, type RefObject } from "react";
import { ScrollView, StyleSheet, View, type NativeScrollEvent, type NativeSyntheticEvent, type ViewStyle, type StyleProp } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppHeader } from "@/components/app-header";
import { BOTTOM_CTA_SPACE } from "@/components/form";
import { SHELL, SP, T } from "@/theme";

/**
 * `.app-shell.app-shell--grouped` — 상단 헤더 + 스크롤 본문.
 * 홈 계열(grouped)은 회색 캔버스(`surface-alt`) 위에 흰 그룹 카드를 얹고, 플로팅 탭바 높이만큼 아래 여백을 둔다.
 * 탭 밖 상세 화면은 `tabBar={false}`, 고정 CTA 는 `bottom` 으로 넘긴다(본문 아래 여백도 그만큼).
 */
export function AppScreen({ children, grouped = true, title, onBack, right, contentStyle, scroll = true, tabBar = true, bottom, scrollRef, onScroll: onScrollProp }: { children: ReactNode; grouped?: boolean; title?: string; onBack?: () => void; right?: ReactNode; contentStyle?: StyleProp<ViewStyle>; scroll?: boolean; tabBar?: boolean; bottom?: ReactNode; scrollRef?: RefObject<ScrollView | null>; onScroll?: (e: NativeSyntheticEvent<NativeScrollEvent>) => void }) {
  const insets = useSafeAreaInsets();
  const [scrolled, setScrolled] = useState(false);
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setScrolled(e.nativeEvent.contentOffset.y > 4);
    onScrollProp?.(e);
  };
  const bg = grouped ? T.background.normalAlternative : T.background.normalNormal;
  const space = tabBar ? SHELL.contentBottomSpace : bottom ? BOTTOM_CTA_SPACE + SP[16] : SP[24];
  const paddingBottom = space + insets.bottom;
  return (
    <View style={[s.shell, { backgroundColor: bg }]}>
      <AppHeader title={title} onBack={onBack} right={right} scrolled={scrolled} />
      {scroll ? (
        <ScrollView ref={scrollRef} onScroll={onScroll} scrollEventThrottle={32} contentContainerStyle={[{ paddingBottom }, contentStyle]} showsVerticalScrollIndicator={false} contentInsetAdjustmentBehavior="never" keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      ) : (
        <View style={[{ flex: 1, paddingBottom }, contentStyle]}>{children}</View>
      )}
      {bottom}
    </View>
  );
}

/** `.content-section` — 거터(16) 안쪽에 두는 본문 블록 */
export function ContentSection({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[s.content, style]}>{children}</View>;
}

const s = StyleSheet.create({
  shell: { flex: 1 },
  content: { paddingHorizontal: SHELL.gutter },
});
