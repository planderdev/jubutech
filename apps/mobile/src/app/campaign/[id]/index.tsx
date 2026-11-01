import { useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions, type NativeScrollEvent, type NativeSyntheticEvent } from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { DEFAULT_RULES, DEMO_CAMPAIGNS, DEMO_EXAMPLE_REVIEWS, demoApplication, demoCampaignDeadline, demoCampaignState, demoDateLabel, demoRecommendedCampaigns, missionWithDefaults, type DemoCampaign } from "@jubutech/shared";
import { CAMPAIGN_GALLERY, CampaignGrid, CampaignVisual, DateRow, EmptyState, MissionRow, Stars } from "@/components/campaign";
import { Accordion, BottomCta } from "@/components/form";
import { Icon } from "@/components/icon";
import { AppScreen } from "@/components/screen";
import { Badge, Button, IconButton } from "@/components/ui";
import { useDemo } from "@/lib/demo-store";
import { CTRL, RAD, SHELL, SP, T, typo } from "@/theme";

const SECTIONS = [
  { key: "overview", label: "체험 소개" },
  { key: "schedule", label: "일정·미션" },
  { key: "guide", label: "참여 안내" },
] as const;
type SectionKey = (typeof SECTIONS)[number]["key"];

/**
 * 체험단 상세 — PHP `campaignDetail()` (`/campaigns/{id}`):
 * 히어로(정사각 갤러리) → 요약(배지·브랜드·제목·혜택·인원/채널) → 앵커 탭 → 체험 소개(설명·리뷰·상품정보) → 체험 일정·미션 → 참여 안내 → 추천 → 고정 CTA.
 */
export default function CampaignDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { applications, member, now } = useDemo();
  const scrollRef = useRef<ScrollView>(null);
  const offsets = useRef<Partial<Record<SectionKey, number>>>({});
  const [active, setActive] = useState<SectionKey>("overview");
  const [moreCount, setMoreCount] = useState(2);

  const c = DEMO_CAMPAIGNS.find((x) => x.id === id);
  if (!c) {
    return (
      <AppScreen title="체험단 상세" onBack={() => router.back()} tabBar={false}>
        <EmptyState title="체험단을 찾을 수 없어요" text="목록에서 다른 체험을 골라 주세요." actionLabel="체험 둘러보기" actionVariant="weak" onAction={() => router.replace("/campaigns/explore" as Href)} />
      </AppScreen>
    );
  }

  const state = demoCampaignState(c, now);
  const a = demoApplication(member.id, c.id, applications);
  const stateLabel = state === "open" ? `모집 중 · ${demoCampaignDeadline(c, now)}` : demoCampaignDeadline(c, now);
  const mission = missionWithDefaults(DEFAULT_RULES, c.mission);
  const recommended = demoRecommendedCampaigns(c, DEMO_CAMPAIGNS, now);
  const shown = recommended.slice(0, moreCount);

  const jump = (key: SectionKey) => {
    setActive(key);
    const y = offsets.current[key];
    if (y !== undefined) scrollRef.current?.scrollTo({ y: y - SP[8], animated: true });
  };
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y + SP[64];
    let cur: SectionKey = "overview";
    for (const sec of SECTIONS) if ((offsets.current[sec.key] ?? Infinity) <= y) cur = sec.key;
    if (cur !== active) setActive(cur);
  };

  const cta = a ? (
    <Button label="내 응모 확인" full onPress={() => router.push(`/application/${a.id}` as Href)} style={{ flex: 1 }} />
  ) : state === "open" ? (
    <Button label="응모하기" full onPress={() => router.push(`/campaign/${c.id}/apply` as Href)} style={{ flex: 1 }} />
  ) : (
    <Button label={state === "closed" ? "모집 종료" : "모집 예정"} full disabled style={{ flex: 1 }} />
  );

  return (
    <AppScreen title="체험단 상세" onBack={() => router.back()} right={<IconButton name="share-2" label="공유" />} tabBar={false} bottom={<BottomCta>{cta}</BottomCta>} scrollRef={scrollRef} onScroll={onScroll} contentStyle={{ gap: SP[8] }}>
      <Hero campaign={c} />

      <View style={s.summary}>
        <View style={s.row}>
          <Badge label={stateLabel} tone={state === "closed" ? "neutral" : "rose"} />
          <Badge label={c.categoryId} tone="neutral" />
        </View>
        <View style={{ gap: SP[8] }}>
          <Text style={typo("label2", "regular", T.label.alternative)}>{c.brand}</Text>
          <Text style={typo("heading1", "bold")}>{c.title}</Text>
        </View>
        <View style={s.offer}>
          <Text style={typo("label2", "regular", T.label.alternative)}>이런 체험을 제공해요</Text>
          <Text style={typo("title3", "bold")}>{c.benefit}</Text>
        </View>
        <View style={s.facts}>
          <View style={s.fact}><Text style={typo("label2", "regular", T.label.alternative)}>모집 인원</Text><Text style={typo("body1", "semibold")}>{c.capacity}명</Text></View>
          <View style={s.fact}><Text style={typo("label2", "regular", T.label.alternative)}>후기 채널</Text><Text style={typo("body1", "semibold")}>{c.channel}</Text></View>
        </View>
      </View>

      <View style={s.anchorWrap}>
        <View style={s.anchors} accessibilityRole="tablist">
          {SECTIONS.map((sec) => (
            <Pressable key={sec.key} onPress={() => jump(sec.key)} accessibilityRole="tab" accessibilityState={{ selected: active === sec.key }} style={[s.anchor, active === sec.key && s.anchorActive]}>
              <Text style={typo("body2", "semibold", active === sec.key ? T.label.normal : T.label.alternative)}>{sec.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={s.section} onLayout={(e) => (offsets.current.overview = e.nativeEvent.layout.y)}>
        <Text style={[typo("headline1", "bold"), s.sectionTitle]}>체험 소개</Text>
        <Text style={typo("body1", "regular")}>{c.description}</Text>
        <Reviews campaignId={c.id} />
        <View style={s.block}>
          {(CAMPAIGN_GALLERY[c.id] ?? []).length ? (
            CAMPAIGN_GALLERY[c.id].map((src, i) => <Image key={i} source={src} style={s.productImage} contentFit="cover" accessibilityLabel={`${c.title} 상품정보 참고 이미지 ${i + 1}`} />)
          ) : (
            <CampaignVisual campaign={c} />
          )}
        </View>
      </View>

      <View style={s.section} onLayout={(e) => (offsets.current.schedule = e.nativeEvent.layout.y)}>
        <Text style={[typo("headline1", "bold"), s.sectionTitle]}>체험 일정</Text>
        <DateRow label="모집 기간" value={`${demoDateLabel(c.recruitmentStartAt, "m.d")} ~ ${demoDateLabel(c.recruitmentEndAt, "m.d")} 23:59`} compact />
        <DateRow label="선정 발표" value={demoDateLabel(c.announcementAt)} />
        <DateRow label="후기 마감" value={demoDateLabel(c.reviewDueAt)} last />
        <View style={s.missions}>
          <Text style={[typo("headline1", "bold"), s.sectionTitle]}>함께 해주실 미션</Text>
          {c.missions.map((m) => <MissionRow key={m} text={m} />)}
          <Text style={typo("label2", "regular", T.label.alternative)}>
            후기 기준 · {c.channel === "설문" ? "설문 응답" : [mission.photoCount ? `사진 ${mission.photoCount}장` : null, mission.minChars ? `${mission.minChars}자 이상` : null, mission.hashtags.length ? mission.hashtags.map((h) => `#${h}`).join(" ") : null].filter(Boolean).join(" · ")} · 선정 후 {mission.dueDays}일 안에 제출
          </Text>
        </View>
      </View>

      <View style={[s.section, { paddingVertical: 0 }]} onLayout={(e) => (offsets.current.guide = e.nativeEvent.layout.y)}>
        <Accordion title="신청 조건과 유의사항" defaultOpen>
          <Text style={typo("body1", "regular")}>{c.conditions}</Text>
          <Text style={typo("label2", "regular", T.label.alternative)}>제품을 제공받는 체험 활동은 후기에서 제공 사실을 표시해 주세요. 보상과 일정은 검토용 예시이며 실제 지급·배송은 연결되어 있지 않습니다.</Text>
        </Accordion>
      </View>

      <View style={[s.section, { gap: SP[24] }]}>
        <Text style={typo("headline1", "bold")}>관심 있을 만한 상품</Text>
        <CampaignGrid campaigns={shown} onPress={(x) => router.push(`/campaign/${x.id}` as Href)} inset={SHELL.gutter * 2} now={now} />
        <View style={{ gap: SP[16], alignItems: "center" }}>
          <Text style={typo("label2", "regular", T.label.alternative)}>{shown.length ? (shown.length < recommended.length ? "아래로 내리면 다른 상품을 더 보여드려요." : "추천 상품을 모두 확인했어요.") : "지금은 추천할 상품이 없어요."}</Text>
          {shown.length < recommended.length ? <Button label="상품 더 보기" variant="neutral" full onPress={() => setMoreCount((n) => n + 2)} /> : null}
        </View>
      </View>
    </AppScreen>
  );
}

/** `.campaign-hero` — 정사각 갤러리 (가로 페이징) + "1 / 5" 컨트롤 */
function Hero({ campaign }: { campaign: DemoCampaign }) {
  const { width } = useWindowDimensions();
  const gallery = CAMPAIGN_GALLERY[campaign.id] ?? [];
  const count = Math.max(1, gallery.length);
  const [index, setIndex] = useState(0);
  const ref = useRef<ScrollView>(null);
  const go = (i: number) => {
    const next = Math.max(0, Math.min(count - 1, i));
    setIndex(next);
    ref.current?.scrollTo({ x: next * width, animated: true });
  };
  return (
    <View style={{ backgroundColor: T.background.normalNormal }}>
      <ScrollView ref={ref} horizontal pagingEnabled showsHorizontalScrollIndicator={false} onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))} accessibilityLabel="체험단 이미지">
        {Array.from({ length: count }, (_, i) => (
          <CampaignVisual key={i} campaign={campaign} photo={i} style={{ width, height: width, borderRadius: 0 }} />
        ))}
      </ScrollView>
      {count > 1 ? (
        <View style={s.carouselControl}>
          <Pressable onPress={() => go(index - 1)} disabled={index === 0} accessibilityRole="button" accessibilityLabel="이전 이미지" style={s.carouselButton}><Icon name="chevron-left" size={20} color={index === 0 ? T.label.disable : T.label.normal} /></Pressable>
          <Text style={typo("label1", "regular")}>{index + 1} / {count}</Text>
          <Pressable onPress={() => go(index + 1)} disabled={index === count - 1} accessibilityRole="button" accessibilityLabel="다음 이미지" style={s.carouselButton}><Icon name="chevron-right" size={20} color={index === count - 1 ? T.label.disable : T.label.normal} /></Pressable>
        </View>
      ) : null}
    </View>
  );
}

/** PHP `campaignReviews()` — "리뷰 N" + 평균 별점 + 예시 리뷰 3개(+더 보기) */
function Reviews({ campaignId }: { campaignId: string }) {
  const [all, setAll] = useState(false);
  const reviews = DEMO_EXAMPLE_REVIEWS[campaignId] ?? [];
  const rated = reviews.filter((r) => r.rating > 0);
  const average = rated.length ? rated.reduce((n, r) => n + r.rating, 0) / rated.length : null;
  const list = all ? reviews : reviews.slice(0, 3);
  const gallery = CAMPAIGN_GALLERY[campaignId] ?? [];
  return (
    <View style={s.block}>
      <View style={s.blockHeading}>
        <Text style={typo("headline1", "bold")}>리뷰 <Text style={{ color: T.primary.normal }}>{reviews.length}</Text></Text>
        {reviews.length ? <Text style={typo("caption1", "regular", T.label.alternative)}>예시 리뷰 포함</Text> : null}
      </View>
      {reviews.length ? (
        <>
          <View style={s.reviewOverview}>
            {average !== null ? (
              <View style={s.reviewScore}><Stars rating={Math.round(average * 10) / 10} /><Text style={typo("title1", "bold")}>{average.toFixed(1)}</Text><Text style={typo("label2", "regular", T.label.alternative)}>/ 5</Text></View>
            ) : null}
            <Text style={typo("label2", "regular", T.label.alternative)}>{reviews.length}개의 이야기를 만나보세요</Text>
          </View>
          {list.map((r, i) => (
            <View key={r.id} style={[s.reviewCard, i === list.length - 1 && !(!all && reviews.length > 3) && { borderBottomWidth: 0 }]}>
              <View style={s.reviewMeta}>
                {r.rating ? <Stars rating={r.rating} /> : null}
                <Text style={typo("label1", "semibold")}>{r.nickname}</Text>
                <Text style={typo("caption1", "regular", T.label.alternative)}>{demoDateLabel(r.date)}</Text>
                <Text style={typo("caption1", "regular", T.label.alternative)}>예시</Text>
              </View>
              <View style={s.reviewContent}>
                {r.photo && gallery[r.photo - 1] ? <Image source={gallery[r.photo - 1]} style={s.reviewPhoto} contentFit="cover" accessibilityLabel="음식 체험을 표현한 리뷰 참고 사진" /> : null}
                <Text style={[typo("body2", "regular"), { flex: 1 }]}>{r.content}</Text>
              </View>
            </View>
          ))}
          {reviews.length > 3 ? (
            <Pressable onPress={() => setAll((v) => !v)} accessibilityRole="button" style={s.expand}>
              <Text style={typo("label1", "semibold")}>{all ? "리뷰 접기" : `리뷰 ${reviews.length}개 모두 보기`}</Text>
              <Icon name={all ? "chevron-up" : "chevron-down"} size={20} color={T.label.normal} />
            </Pressable>
          ) : null}
        </>
      ) : (
        <Text style={[typo("body2", "regular", T.label.alternative), { textAlign: "center", paddingVertical: SP[16] }]}>아직 등록된 리뷰가 없어요.{"\n"}체험을 마친 분들의 이야기가 이곳에 모여요.</Text>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  summary: { gap: SP[16], paddingTop: SP[16], paddingBottom: SP[24], paddingHorizontal: SHELL.gutter, backgroundColor: T.background.normalNormal },
  row: { flexDirection: "row", gap: SP[8], flexWrap: "wrap" },
  offer: { gap: SP[8], paddingVertical: SP[16], borderTopWidth: 1, borderBottomWidth: 1, borderColor: T.line.normalNeutral },
  facts: { flexDirection: "row", gap: SP[16] },
  fact: { flex: 1, gap: SP[8] },
  anchorWrap: { paddingTop: SP[8], backgroundColor: T.background.normalAlternative },
  anchors: { flexDirection: "row", backgroundColor: T.background.normalNormal },
  anchor: { flex: 1, minHeight: CTRL.xl, alignItems: "center", justifyContent: "center", paddingVertical: SP[16], paddingHorizontal: SP[8], borderBottomWidth: 2, borderBottomColor: "transparent" },
  anchorActive: { borderBottomColor: T.label.normal },
  section: { paddingVertical: SP[24], paddingHorizontal: SHELL.gutter, backgroundColor: T.background.normalNormal },
  sectionTitle: { marginBottom: SP[16] },
  block: { marginTop: SP[32], paddingTop: SP[32], borderTopWidth: 1, borderTopColor: T.line.normalNeutral, gap: SP[16] },
  blockHeading: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: SP[8] },
  productImage: { width: "100%", aspectRatio: 1.25, borderRadius: RAD.md, backgroundColor: T.background.normalAlternative },
  missions: { marginTop: SP[24], gap: SP[16] },
  reviewOverview: { gap: SP[8] },
  reviewScore: { flexDirection: "row", alignItems: "baseline", gap: SP[8] },
  reviewCard: { gap: SP[16], paddingVertical: SP[24], borderBottomWidth: 1, borderBottomColor: T.line.normalNeutral },
  reviewMeta: { flexDirection: "row", alignItems: "center", gap: SP[8], flexWrap: "wrap" },
  reviewContent: { flexDirection: "row", gap: SP[16], alignItems: "flex-start" },
  reviewPhoto: { width: SP[80], height: SP[80], borderRadius: RAD.md },
  expand: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: SP[8], minHeight: CTRL.lg },
  carouselControl: { position: "absolute", right: SP[16], bottom: SP[16], flexDirection: "row", alignItems: "center", gap: SP[8], paddingHorizontal: SP[8], height: CTRL.md, borderRadius: RAD.full, backgroundColor: T.background.transparentNormal },
  carouselButton: { width: CTRL.sm, height: CTRL.sm, alignItems: "center", justifyContent: "center" },
});
