import { Pressable, StyleSheet, Text, View } from "react-native";
import { Image, type ImageSource } from "expo-image";
import { demoCategoryName, type DemoArticle, type DemoCategory } from "@jubutech/shared";
import { Icon } from "@/components/icon";
import { Badge, IconButton } from "@/components/ui";
import { P, RAD, SP, T, TOUCH, typo } from "@/theme";

/** PHP `financeHome()` 의 `$categoryImages` — 카테고리 일러스트(`public/assets/images/category/*.svg`) */
const CATEGORY_ART: Record<string, ImageSource> = {
  subsidy: require("../../assets/images/category/support.svg"),
  policy: require("../../assets/images/category/policy.svg"),
  saving: require("../../assets/images/category/saving.svg"),
  card: require("../../assets/images/category/card-benefits.svg"),
  parenting: require("../../assets/images/category/baby.svg"),
  pet: require("../../assets/images/category/pet.svg"),
};

/** `.home-context` — "서연맘님 · 오늘의 발견이 내일의 여유로" */
export function HomeContext({ name, message }: { name: string; message: string }) {
  return (
    <View style={s.context} accessibilityRole="header">
      <Text style={typo("body1", "bold")}>{name}님</Text>
      <Text style={typo("label1", "regular", T.label.assistive)}>·</Text>
      <Text style={[typo("label1", "regular", T.label.alternative), { flex: 1 }]}>{message}</Text>
    </View>
  );
}

/** `.category-shortcuts` — 5열 그리드, 56px 일러스트 타일 + label-2 */
export function CategoryShortcuts({ categories, onPress, onAll }: { categories: DemoCategory[]; onPress?: (c: DemoCategory) => void; onAll?: () => void }) {
  return (
    <View style={s.shortcuts} accessibilityRole="menu" accessibilityLabel="정보 카테고리">
      {categories.map((c) => (
        <Pressable key={c.id} onPress={() => onPress?.(c)} accessibilityRole="button" style={({ pressed }) => [s.shortcut, pressed && { backgroundColor: T.fill.alternative }]}>
          <View style={s.art}>
            {CATEGORY_ART[c.id] ? <Image source={CATEGORY_ART[c.id]} style={s.artImage} contentFit="contain" /> : <Icon name={c.icon} size={24} color={T.label.neutral} />}
          </View>
          <Text style={typo("label2", "semibold", T.label.neutral)} numberOfLines={1}>{c.name}</Text>
        </Pressable>
      ))}
      <Pressable onPress={onAll} accessibilityRole="button" style={({ pressed }) => [s.shortcut, pressed && { backgroundColor: T.fill.alternative }]}>
        <View style={s.art}><Icon name="list" size={24} color={T.label.neutral} /></View>
        <Text style={typo("label2", "semibold", T.label.neutral)}>전체</Text>
      </Pressable>
    </View>
  );
}

/** 날짜 "10.20" */
function md(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

/** PHP `articleRow()` — `.content-list-item` (본문 + 북마크 버튼), 하단 구분선 */
export function ArticleRow({ article, saved, onPress, onToggleSave, last }: { article: DemoArticle; saved?: boolean; onPress?: () => void; onToggleSave?: () => void; last?: boolean }) {
  return (
    <View style={[s.item, !last && s.itemDivider]}>
      <Pressable onPress={onPress} accessibilityRole="link" style={({ pressed }) => [s.itemBody, pressed && { opacity: 0.7 }]}>
        <Badge label={demoCategoryName(article.categoryId)} />
        <Text style={typo("headline2", "medium", P.grey[800])} numberOfLines={2}>{article.title}</Text>
        <Text style={typo("body2", "regular", P.grey[600])}>{md(article.publishedAt)} · 3분 읽기</Text>
      </Pressable>
      <View style={s.itemAction}>
        <IconButton name="bookmark" label={saved ? "저장 해제" : "글 저장"} onPress={onToggleSave} color={saved ? T.primary.normal : P.grey[700]} accessibilityState={{ selected: !!saved }} fill={saved ? T.primary.normal : "transparent"} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  context: { flexDirection: "row", alignItems: "baseline", gap: SP[8], paddingTop: SP[24], paddingBottom: SP[16] },
  shortcuts: { flexDirection: "row", gap: SP[8], padding: SP[8] },
  shortcut: { flex: 1, minWidth: 0, alignItems: "center", gap: SP[8], paddingVertical: SP[8], borderRadius: RAD.md },
  art: { width: SP[56], height: SP[56], borderRadius: RAD.lg, backgroundColor: T.background.normalAlternative, alignItems: "center", justifyContent: "center" },
  artImage: { width: "60%", height: "60%" },
  item: { flexDirection: "row", gap: SP[8], paddingHorizontal: SP[16] },
  itemDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: T.line.solidNeutral },
  itemBody: { flex: 1, minWidth: 0, gap: SP[8], paddingVertical: SP[16], minHeight: TOUCH },
  itemAction: { alignSelf: "flex-start", paddingTop: SP[8] },
});
