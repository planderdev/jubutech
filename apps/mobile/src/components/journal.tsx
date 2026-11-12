import { Pressable, StyleSheet, Text, View } from "react-native";
import { journalTotal, type DemoJournal } from "@jubutech/shared";
import { P, RAD, SP, T, typo } from "@/theme";

export const won = (n: number) => `${Math.round(n).toLocaleString("ko-KR")}원`;

/** PHP `journalTone()` — 매수·상승은 빨강, 매도·하락은 파랑 (국내 증권 관습) */
export function journalToneColor(direction: string): string {
  if (direction === "buy" || direction === "up") return P.red[500];
  if (direction === "sell" || direction === "down") return P.blue[500];
  return T.label.normal;
}

/** PHP `journalRow()` — `.list-row--record`: 아바타 · 국내주식·구분 · 종목 · 이유 / 거래금액 · 수량 */
export function JournalRow({ journal: j, onPress, last }: { journal: DemoJournal; onPress: () => void; last?: boolean }) {
  const draft = j.draftStatus === "draft";
  const color = draft ? T.label.normal : journalToneColor(j.side);
  return (
    <Pressable onPress={onPress} accessibilityRole="link" style={({ pressed }) => [s.row, !last && s.divider, pressed && { backgroundColor: T.fill.alternative }]}>
      <View style={s.avatar}><Text style={typo("label1", "bold", T.primary.normal)}>{(j.stockName || "기록").slice(0, 1)}</Text></View>
      <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
        <Text style={typo("caption1", "regular", T.label.alternative)}>국내주식 · <Text style={typo("caption1", "semibold", draft ? T.label.alternative : color)}>{draft ? "임시 저장" : j.side === "buy" ? "매수" : "매도"}</Text></Text>
        <Text style={typo("headline2", "semibold")} numberOfLines={1}>{j.stockName || "작성 중인 일지"}</Text>
        <Text style={typo("caption1", "regular", T.label.alternative)} numberOfLines={1}>{j.reason || "매매 이유를 기록해 보세요"}</Text>
      </View>
      <View style={{ alignItems: "flex-end", gap: 2 }}>
        <Text style={typo("body1", "semibold", color)}>{won(journalTotal(j))}</Text>
        <Text style={typo("caption1", "regular", T.label.alternative)}>{j.quantity.toLocaleString("ko-KR")}주 · 거래금액</Text>
      </View>
    </Pressable>
  );
}

/** PHP `.progress-bar` */
export function ProgressBar({ value, label, color = T.primary.normal }: { value: number; label: string; color?: string }) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <View style={s.track} accessibilityRole="progressbar" accessibilityLabel={label} accessibilityValue={{ min: 0, max: 100, now: Math.round(pct) }}>
      <View style={[s.fill, { width: `${pct}%`, backgroundColor: color }]} />
    </View>
  );
}

export function Metric({ label, value, unit }: { label: string; value: number | string; unit?: string }) {
  return (
    <View style={{ flex: 1, gap: 4 }}>
      <Text style={typo("label2", "regular", T.label.alternative)}>{label}</Text>
      <Text style={typo("title1", "bold")}>{value}{unit ? <Text style={typo("body2", "medium", T.label.alternative)}> {unit}</Text> : null}</Text>
    </View>
  );
}

/** 라디오 묶음 — PHP `.segmented` (미점검/충족/미충족 등) */
export function Segmented<K extends string>({ items, value, onChange, label }: { items: { key: K; label: string }[]; value: K; onChange: (k: K) => void; label: string }) {
  return (
    <View style={s.segmented} accessibilityRole="radiogroup" accessibilityLabel={label}>
      {items.map((it) => {
        const on = it.key === value;
        return (
          <Pressable key={it.key} onPress={() => onChange(it.key)} accessibilityRole="radio" accessibilityState={{ selected: on }} style={[s.segment, on && s.segmentOn]}>
            <Text style={typo("label2", on ? "semibold" : "regular", on ? T.primary.normal : T.label.neutral)}>{it.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: SP[16], paddingVertical: SP[16], paddingHorizontal: SP[16] },
  divider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: T.line.solidNormal },
  avatar: { width: SP[40], height: SP[40], borderRadius: RAD.full, backgroundColor: T.primary.soft, alignItems: "center", justifyContent: "center" },
  track: { height: SP[8], borderRadius: RAD.full, backgroundColor: T.fill.normal, overflow: "hidden" },
  fill: { height: "100%", borderRadius: RAD.full },
  segmented: { flexDirection: "row", gap: 4, padding: 4, borderRadius: RAD.md, backgroundColor: T.fill.alternative },
  segment: { flex: 1, minHeight: 36, alignItems: "center", justifyContent: "center", borderRadius: RAD.sm, paddingHorizontal: 4 },
  segmentOn: { backgroundColor: T.background.normalNormal },
});
