import { Pressable, StyleSheet, Text, View } from "react-native";
import { REVIEW_CHECK_LABEL, reviewDueLabel, type MissionCard, type ReviewCheck, type ReviewCheckItem, type ReviewCheckKey } from "@jubutech/shared";
import { Icon } from "@/components/icon";
import { CTRL, P, RAD, SP, T, TOUCH, typo } from "@/theme";

/** 미션 카드 → 체크리스트 행 (1-1 "미션 카드: 사진 3장 · 800자 · 키워드 · 해시태그") */
export function missionRequirements(mission: MissionCard, includeLink = true): { key: ReviewCheckKey; icon: string; text: string }[] {
  const rows: { key: ReviewCheckKey; icon: string; text: string }[] = [];
  if (mission.photoCount > 0) rows.push({ key: "photos", icon: "image", text: `사진 ${mission.photoCount}장 이상` });
  if (mission.minChars > 0) rows.push({ key: "chars", icon: "pencil", text: `${mission.minChars}자 이상 작성` });
  if (mission.requiredKeywords.length) rows.push({ key: "keywords", icon: "search", text: `'${mission.requiredKeywords.join("', '")}' 키워드 포함` });
  if (mission.hashtags.length) rows.push({ key: "hashtags", icon: "hash", text: `${mission.hashtags.map((h) => `#${h}`).join(" ")} 해시태그` });
  if (includeLink) rows.push({ key: "link", icon: "link", text: "게시물 링크 제출 또는 앱에서 직접 작성" });
  return rows;
}

type RowState = "idle" | "ok" | "fail" | "skipped";
function rowState(item?: ReviewCheckItem): RowState {
  if (!item) return "idle";
  if (item.skipped) return "skipped";
  return item.ok ? "ok" : "fail";
}

/**
 * 미션 체크리스트 — 선정 화면·제출 화면 공용. `check` 를 주면 항목마다 통과/미달/운영팀 확인 상태를 표시한다.
 * `.campaign-mission` 마커(32px 원)를 상태 색으로 바꾼다.
 */
export function MissionChecklist({ mission, check, dueAt, now, includeLink = true, compact }: { mission: MissionCard; check?: ReviewCheck; dueAt?: string; now?: string | Date; includeLink?: boolean; compact?: boolean }) {
  const rows = missionRequirements(mission, includeLink);
  const byKey = new Map(check?.items.map((i) => [i.key, i]));
  return (
    <View style={{ gap: compact ? SP[8] : SP[16] }}>
      {rows.map((r) => {
        const item = byKey.get(r.key);
        const state = rowState(item);
        const marker = { idle: { bg: T.primary.soft, icon: r.icon, color: T.primary.normal }, ok: { bg: T.background.statusPositive, icon: "check", color: P.green[600] }, fail: { bg: T.background.statusNegative, icon: "x", color: P.red[600] }, skipped: { bg: T.fill.normal, icon: "clock", color: T.label.alternative } }[state];
        return (
          <View key={r.key} style={s.row}>
            <View style={[s.marker, { backgroundColor: marker.bg }]}><Icon name={marker.icon} size={16} color={marker.color} strokeWidth={2.25} /></View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={typo("body2", state === "fail" ? "semibold" : "regular", state === "skipped" ? T.label.alternative : T.label.normal)}>{r.text}</Text>
              {item && state !== "idle" ? <Text style={typo("caption1", "regular", state === "fail" ? P.red[600] : state === "ok" ? P.green[600] : T.label.alternative)}>{item.message}</Text> : null}
            </View>
          </View>
        );
      })}
      {dueAt ? (
        <View style={s.row}>
          <View style={[s.marker, { backgroundColor: T.fill.normal }]}><Icon name="clock" size={16} color={T.label.neutral} strokeWidth={2.25} /></View>
          <View style={{ flex: 1 }}>
            <Text style={typo("body2", "regular")}>후기 기한 {formatDue(dueAt)}</Text>
            <Text style={typo("caption1", "semibold", T.primary.normal)}>{reviewDueLabel(dueAt, now)}</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

function formatDue(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

/** 자동 검사 결과 목록 — 항목 라벨 · 메시지 (응모 내역의 "후기 검토", 제출 전 결과 시트) */
export function CheckResultList({ check }: { check: ReviewCheck }) {
  return (
    <View style={{ gap: SP[8] }}>
      {check.items.map((i) => {
        const state = rowState(i);
        const color = state === "fail" ? P.red[600] : state === "ok" ? P.green[600] : T.label.alternative;
        return (
          <View key={i.key} style={s.resultRow}>
            <Icon name={state === "fail" ? "circle-x" : state === "ok" ? "circle-check" : "clock"} size={20} color={color} />
            <Text style={[typo("label1", "semibold", T.label.neutral), { width: SP[56] }]}>{REVIEW_CHECK_LABEL[i.key]}</Text>
            <Text style={[typo("body2", "regular", state === "fail" ? T.label.normal : T.label.alternative), { flex: 1 }]}>{i.message}</Text>
          </View>
        );
      })}
    </View>
  );
}

/** 사진 장수 스테퍼 — 업로드는 Supabase 연결(W8) 뒤, 지금은 장수만 */
export function PhotoStepper({ value, onChange, label, min = 0, max = 20 }: { value: number; onChange: (n: number) => void; label: string; min?: number; max?: number }) {
  return (
    <View style={s.stepper}>
      <Icon name="image" size={24} color={T.label.neutral} />
      <Text style={[typo("body2", "regular"), { flex: 1 }]}>{label}</Text>
      <Pressable onPress={() => onChange(Math.max(min, value - 1))} disabled={value <= min} accessibilityRole="button" accessibilityLabel="사진 1장 줄이기" style={({ pressed }) => [s.stepButton, pressed && { backgroundColor: T.fill.normal }, value <= min && { opacity: 0.4 }]}>
        <Icon name="minus" size={20} color={T.label.normal} />
      </Pressable>
      <Text style={[typo("headline2", "bold"), { minWidth: SP[40], textAlign: "center" }]} accessibilityLiveRegion="polite">{value}장</Text>
      <Pressable onPress={() => onChange(Math.min(max, value + 1))} disabled={value >= max} accessibilityRole="button" accessibilityLabel="사진 1장 늘리기" style={({ pressed }) => [s.stepButton, pressed && { backgroundColor: T.fill.normal }, value >= max && { opacity: 0.4 }]}>
        <Icon name="plus" size={20} color={T.label.normal} />
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-start", gap: SP[16] },
  marker: { width: SP[32], height: SP[32], borderRadius: RAD.full, alignItems: "center", justifyContent: "center" },
  resultRow: { flexDirection: "row", alignItems: "flex-start", gap: SP[8], minHeight: SP[24] },
  stepper: { flexDirection: "row", alignItems: "center", gap: SP[8], minHeight: TOUCH },
  stepButton: { width: CTRL.md, height: CTRL.md, borderRadius: RAD.md, borderWidth: 1, borderColor: T.line.normalNormal, alignItems: "center", justifyContent: "center" },
});
