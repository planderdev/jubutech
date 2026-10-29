import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions, type NativeScrollEvent, type NativeSyntheticEvent } from "react-native";
import { Image, type ImageSource } from "expo-image";
import type { DemoBanner } from "@jubutech/shared";
import { P, RAD, SHELL, SP, T, typo } from "@/theme";

/** PHP `public/assets/images/banners/*` 중 앱에 번들한 이미지 */
const BANNER_IMAGES: Record<string, ImageSource> = {
  "support-envelope": require("../../assets/images/banners/support-envelope.webp"),
  "benefit-coupons": require("../../assets/images/banners/benefit-coupons.webp"),
  "discovery-gift": require("../../assets/images/banners/discovery-gift.svg"),
};

/** `.banner-card[data-banner-background=…]` — 그라데이션 대신 시작 색으로 근사 */
const BACKGROUNDS: Record<DemoBanner["background"], string> = {
  white: T.background.normalNormal,
  sky: P.blue[50],
  mint: P.green[50],
  sand: P.yellow[50],
  rose: T.primary.soft,
};

/**
 * `.banner-slider` — 가로 페이징 슬라이더. 슬라이드 너비는 화면 - 48(양옆 카드가 살짝 보임),
 * 카드 비율 1.55, 오른쪽 아래 "1 | 2" 페이지 표시.
 */
export function BannerSlider({ banners, onPress }: { banners: DemoBanner[]; onPress?: (b: DemoBanner) => void }) {
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  if (!banners.length) return null;
  const slideWidth = width - SP[48];
  const gap = SP[8];
  const sidePad = (width - slideWidth) / 2;
  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / (slideWidth + gap));
    setIndex(Math.max(0, Math.min(banners.length - 1, i)));
  };
  return (
    <View accessibilityRole="summary" accessibilityLabel="생활에 도움이 되는 정보">
      <ScrollView
        horizontal
        pagingEnabled={false}
        snapToInterval={slideWidth + gap}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: sidePad, gap }}
        onMomentumScrollEnd={onMomentumEnd}
        scrollEnabled={banners.length > 1}
      >
        {banners.map((b) => (
          <Pressable key={b.id} onPress={() => onPress?.(b)} accessibilityRole="link" accessibilityLabel={`${b.title.replace("\n", " ")}. ${b.description.replace("\n", " ")}`} style={({ pressed }) => [s.card, { width: slideWidth, backgroundColor: BACKGROUNDS[b.background] }, pressed && { opacity: 0.92 }]}>
            <View style={s.copy}>
              <Text style={typo("title3", "bold")}>{b.title}</Text>
              {b.benefit ? <Text style={typo("heading2", "bold", T.primary.normal)}>{b.benefit}</Text> : null}
              {b.description ? <Text style={typo("label1", "regular", T.label.neutral)}>{b.description}</Text> : null}
            </View>
            {BANNER_IMAGES[b.image] ? <Image source={BANNER_IMAGES[b.image]} style={s.media} contentFit="contain" accessibilityIgnoresInvertColors /> : null}
          </Pressable>
        ))}
      </ScrollView>
      {banners.length > 1 ? (
        <View pointerEvents="none" style={[s.pagination, { right: sidePad + SP[8] }]} accessibilityLiveRegion="polite">
          <Text style={typo("caption1", "semibold", T.alias.staticWhite)}>{index + 1}</Text>
          <Text style={typo("caption1", "regular", "rgba(255,255,255,0.6)")}>|</Text>
          <Text style={typo("caption1", "regular", T.alias.staticWhite)}>{banners.length}</Text>
        </View>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  card: { aspectRatio: 1.55, borderRadius: RAD.xl, padding: SP[24], overflow: "hidden" },
  copy: { gap: SP[8], zIndex: 1, maxWidth: "70%" },
  // `.banner-card--promotion .banner-card__media` — 오른쪽 4% · 아래 6% · 너비 52% · 높이 64%
  media: { position: "absolute", right: "4%", bottom: "6%", width: "52%", height: "64%" },
  pagination: { position: "absolute", bottom: SP[8], flexDirection: "row", alignItems: "center", gap: SP[8], paddingHorizontal: SP[8], paddingVertical: 2, borderRadius: RAD.full, backgroundColor: "rgba(0,0,0,0.62)", marginRight: SHELL.gutter },
});
