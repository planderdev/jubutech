import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions, type StyleProp, type ViewStyle } from "react-native";
import { Image, type ImageSource } from "expo-image";
import { DEMO_NOW, demoCampaignDeadline, demoCampaignState, type DemoCampaign, type DemoCampaignCategory } from "@jubutech/shared";
import { Icon } from "@/components/icon";
import { Badge, Button } from "@/components/ui";
import { CTRL, P, RAD, SHELL, SP, T, TOUCH, typo } from "@/theme";

/** PHP `campaign-galleries.php` — 검토된 참고 사진이 있는 캠페인(cp1)만 사진, 나머지는 일러스트 */
export const CAMPAIGN_GALLERY: Record<string, ImageSource[]> = {
  cp1: [
    require("../../assets/images/campaigns/campaign-cp1-01.webp"),
    require("../../assets/images/campaigns/campaign-cp1-02.webp"),
    require("../../assets/images/campaigns/campaign-cp1-03.webp"),
    require("../../assets/images/campaigns/campaign-cp1-04.webp"),
    require("../../assets/images/campaigns/campaign-cp1-05.webp"),
  ],
};

/** PHP `campaignShortcuts()` 의 분류 일러스트 (`/assets/images/category/*.svg`) */
export const CAMPAIGN_CATEGORY_ART: Record<DemoCampaignCategory, ImageSource | null> = {
  식품: require("../../assets/images/category/food.svg"),
  육아: require("../../assets/images/category/baby.svg"),
  생활: require("../../assets/images/category/living.svg"),
  반려생활: require("../../assets/images/category/pet.svg"),
  방문: require("../../assets/images/category/visit.svg"),
  설문: null,
};

/** `.campaign-visual[data-product]` 배경 — PHP objectArt 대신 분류 일러스트를 얹는다 */
const VISUAL_BG: Record<string, string> = {
  food: T.background.statusPositive,
  lotion: T.background.statusCautionary,
  survey: P.blue[50],
  pet: T.background.statusCautionary,
  home: T.background.statusPositive,
  cup: T.background.statusCautionary,
  bread: T.background.statusCautionary,
  soap: T.background.statusPositive,
};

/** `.campaign-visual` — 정사각 썸네일. 사진이 있으면 사진, 없으면 소프트 배경 위 일러스트 */
export function CampaignVisual({ campaign, style, photo = 0 }: { campaign: DemoCampaign; style?: StyleProp<ViewStyle>; photo?: number }) {
  const gallery = CAMPAIGN_GALLERY[campaign.id];
  const art = CAMPAIGN_CATEGORY_ART[campaign.categoryId];
  return (
    <View style={[s.visual, { backgroundColor: VISUAL_BG[campaign.image] ?? T.background.statusPositive }, style]} accessibilityRole="image" accessibilityLabel={`${campaign.brand} 캠페인 분위기 이미지 · 실제 제품 사진 아님`}>
      {gallery ? <Image source={gallery[photo] ?? gallery[0]} style={s.photo} contentFit="cover" transition={150} /> : art ? <Image source={art} style={s.art} contentFit="contain" /> : <Icon name="clipboard-check" size={48} color={T.label.assistive} />}
    </View>
  );
}

/** PHP `campaignCard()` — `.card--product`: 썸네일 + 마감 배지 + 제목(3줄) + 혜택 + 채널·인원 */
export function CampaignCard({ campaign, onPress, width, now = DEMO_NOW }: { campaign: DemoCampaign; onPress?: () => void; width: number; now?: string }) {
  const state = demoCampaignState(campaign, now);
  return (
    <Pressable onPress={onPress} accessibilityRole="link" style={({ pressed }) => [s.card, { width }, pressed && { opacity: 0.7 }]}>
      <CampaignVisual campaign={campaign} style={{ width, height: width }} />
      <View style={s.cardBody}>
        <Badge label={demoCampaignDeadline(campaign, now)} tone={state === "closed" ? "neutral" : "rose"} />
        <Text style={typo("body1", "medium")} numberOfLines={3}>{campaign.title}</Text>
        <Text style={typo("label1", "bold")}>{campaign.benefit}</Text>
        <Text style={typo("label2", "regular", T.label.alternative)}>
          {campaign.channel} · <Text style={typo("label2", "bold", T.primary.normal)}>{campaign.capacity}</Text>명 모집
        </Text>
      </View>
    </Pressable>
  );
}

/** `.campaign-grid` — 2열, 간격 16. 그룹 카드 안(`.group-content` 패딩 16)에서 쓴다 */
export function CampaignGrid({ campaigns, onPress, inset = SHELL.gutter * 2 + SP[16] * 2, now }: { campaigns: DemoCampaign[]; onPress: (c: DemoCampaign) => void; inset?: number; now?: string }) {
  const { width } = useWindowDimensions();
  const cardWidth = Math.floor((width - inset - SP[16]) / 2);
  return (
    <View style={s.grid}>
      {campaigns.map((c) => (
        <CampaignCard key={c.id} campaign={c} width={cardWidth} onPress={() => onPress(c)} now={now} />
      ))}
    </View>
  );
}

/** PHP `campaignShortcuts()` — `.category-shortcuts` 5열 (식품·육아·생활·반려생활·방문) */
export const CAMPAIGN_SHORTCUTS: DemoCampaignCategory[] = ["식품", "육아", "생활", "반려생활", "방문"];
export function CampaignShortcuts({ onPress }: { onPress: (category: DemoCampaignCategory) => void }) {
  return (
    <View style={s.shortcuts} accessibilityRole="menu" accessibilityLabel="체험 카테고리">
      {CAMPAIGN_SHORTCUTS.map((label) => (
        <Pressable key={label} onPress={() => onPress(label)} accessibilityRole="button" style={({ pressed }) => [s.shortcut, pressed && { backgroundColor: T.fill.alternative }]}>
          <View style={s.shortcutArt}>
            <Image source={CAMPAIGN_CATEGORY_ART[label] ?? undefined} style={s.shortcutImage} contentFit="contain" />
          </View>
          <Text style={typo("label2", "semibold", T.label.neutral)} numberOfLines={1}>{label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

/** `.chip-slider` + `.chip[aria-pressed]` — 가로 스크롤 필터 칩 (활성 = primary 테두리·글자) */
export function ChipRow<K extends string>({ items, value, onChange }: { items: { key: K; label: string }[]; value: K; onChange: (k: K) => void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chips} accessibilityRole="radiogroup">
      {items.map((it) => {
        const active = it.key === value;
        return (
          <Pressable key={it.key} onPress={() => onChange(it.key)} accessibilityRole="radio" accessibilityState={{ selected: active }} style={({ pressed }) => [s.chip, active && s.chipActive, pressed && { backgroundColor: T.fill.normal }]}>
            <Text style={typo("label1", active ? "semibold" : "regular", active ? T.primary.normal : T.label.normal)}>{it.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

/** PHP `emptyState()` — `.result`: 아이콘 타일 + 제목 + 설명 + (버튼) */
export function EmptyState({ icon = "inbox", title, text, actionLabel, onAction, actionVariant = "primary" }: { icon?: string; title: string; text: string; actionLabel?: string; onAction?: () => void; actionVariant?: "primary" | "weak" }) {
  return (
    <View style={s.result}>
      <View style={s.resultIcon}><Icon name={icon} size={24} color={T.label.alternative} /></View>
      <Text style={[typo("headline2", "semibold", P.grey[900]), { textAlign: "center" }]}>{title}</Text>
      <Text style={[typo("body2", "regular", P.grey[700]), { textAlign: "center", marginTop: SP[8] }]}>{text}</Text>
      {actionLabel ? <Button label={actionLabel} variant={actionVariant} size="lg" onPress={onAction} style={{ marginTop: SP[16] }} /> : null}
    </View>
  );
}

/** PHP `pagination()` — 숫자 버튼, 현재 = primary soft */
export function Pagination({ page, pages, onChange }: { page: number; pages: number; onChange: (p: number) => void }) {
  if (pages <= 1) return null;
  return (
    <View style={s.pagination} accessibilityRole="tablist" accessibilityLabel="페이지 선택">
      {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
        <Pressable key={p} onPress={() => onChange(p)} accessibilityRole="button" accessibilityState={{ selected: p === page }} style={[s.pageButton, p === page && s.pageCurrent]}>
          <Text style={typo("label1", p === page ? "semibold" : "regular", p === page ? T.primary.normal : T.label.alternative)}>{p}</Text>
        </Pressable>
      ))}
    </View>
  );
}

/** PHP `pageTitle()` — `.page-title`: title-2 + 보조 문장 */
export function PageTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <View style={s.pageTitle}>
      <Text style={typo("title2", "bold")}>{title}</Text>
      {sub ? <Text style={typo("body2", "regular", T.label.neutral)}>{sub}</Text> : null}
    </View>
  );
}

/** `.campaign-mission` — 32px 둥근 마커(primary soft + check) + 문장 */
export function MissionRow({ text }: { text: string }) {
  return (
    <View style={s.mission}>
      <View style={s.missionMarker}><Icon name="check" size={16} color={T.primary.normal} strokeWidth={2.25} /></View>
      <Text style={[typo("body2", "regular"), { flex: 1 }]}>{text}</Text>
    </View>
  );
}

/** `.campaign-schedule-item` / `.application-detail-date` — 라벨 · 값 행 */
export function DateRow({ label, value, accent, last, compact }: { label: string; value: string; accent?: boolean; last?: boolean; compact?: boolean }) {
  return (
    <View style={[s.dateRow, !last && s.dateRowDivider, compact && { paddingTop: 0 }]}>
      <Text style={[typo("label1", "regular", T.label.alternative), { flex: 1 }]}>{label}</Text>
      <Text style={[typo("body2", "semibold", accent ? T.primary.normal : T.label.normal), { flex: 1.8 }]}>{value}</Text>
    </View>
  );
}

/** PHP `campaignReviewStars()` — 별 5개, 소수점은 채움 비율 대신 반올림 */
export function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <View style={{ flexDirection: "row", gap: 2 }} accessibilityRole="image" accessibilityLabel={`5점 만점에 ${rating}점`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Icon key={i} name="star" size={size} color={i < Math.round(rating) ? P.yellow[400] : P.grey[200]} fill={i < Math.round(rating) ? P.yellow[400] : P.grey[200]} strokeWidth={1} />
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  visual: { aspectRatio: 1, borderRadius: RAD.lg, overflow: "hidden", alignItems: "center", justifyContent: "center" },
  photo: { width: "100%", height: "100%" },
  art: { width: "72%", height: "72%" },
  card: { borderRadius: RAD.lg },
  cardBody: { paddingVertical: SP[8], gap: SP[8] },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: SP[16] },
  shortcuts: { flexDirection: "row", gap: SP[8], padding: SP[8] },
  shortcut: { flex: 1, minWidth: 0, alignItems: "center", gap: SP[8], paddingVertical: SP[8], borderRadius: RAD.md },
  shortcutArt: { width: SP[56], height: SP[56], borderRadius: RAD.lg, backgroundColor: T.background.normalAlternative, alignItems: "center", justifyContent: "center" },
  shortcutImage: { width: "60%", height: "60%" },
  chips: { flexDirection: "row", gap: SP[8], paddingHorizontal: SHELL.gutter, paddingVertical: SP[8] },
  chip: { minHeight: 36, paddingHorizontal: SP[16], paddingVertical: SP[8], borderRadius: RAD.full, borderWidth: 1, borderColor: T.line.normalNormal, backgroundColor: T.background.normalNormal, alignItems: "center", justifyContent: "center" },
  chipActive: { borderColor: T.primary.normal },
  result: { alignItems: "center", justifyContent: "center", padding: SP[24] },
  resultIcon: { width: SP[48], height: SP[48], borderRadius: RAD.lg, backgroundColor: T.fill.normal, alignItems: "center", justifyContent: "center", marginBottom: SP[16] },
  pagination: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: SP[8], flexWrap: "wrap", marginVertical: SP[24] },
  pageButton: { minWidth: CTRL.lg, minHeight: CTRL.lg, borderRadius: RAD.sm, alignItems: "center", justifyContent: "center" },
  pageCurrent: { backgroundColor: T.primary.soft },
  pageTitle: { marginVertical: SP[16], gap: SP[8] },
  mission: { flexDirection: "row", alignItems: "flex-start", gap: SP[16] },
  missionMarker: { width: SP[32], height: SP[32], borderRadius: RAD.full, backgroundColor: T.primary.soft, alignItems: "center", justifyContent: "center" },
  dateRow: { flexDirection: "row", alignItems: "baseline", gap: SP[16], paddingVertical: SP[16] },
  dateRowDivider: { borderBottomWidth: 1, borderBottomColor: T.line.normalNeutral },
});
