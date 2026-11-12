import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { COMMUNITY_TOPICS, postComments, visiblePosts } from "@jubutech/shared";
import { ChipRow, EmptyState, PageTitle, Pagination } from "@/components/campaign";
import { Icon } from "@/components/icon";
import { AppScreen, ContentSection } from "@/components/screen";
import { PostRow } from "@/components/community";
import { useDemo } from "@/lib/demo-store";
import { ELEV, CTRL, RAD, SHELL, SP, T, typo } from "@/theme";

const PER_PAGE = 5;
const TOPICS = [{ key: "", label: "전체" }, ...COMMUNITY_TOPICS.map((t) => ({ key: t as string, label: t as string }))];

/** 커뮤니티 — PHP `communityList()`: 제목 → 주제 칩 → 글 목록(페이지) → 떠 있는 글쓰기 버튼 */
export default function Community() {
  const router = useRouter();
  const { posts, comments } = useDemo();
  const [topic, setTopic] = useState("");
  const [page, setPage] = useState(1);
  const rows = useMemo(() => visiblePosts(posts, topic), [posts, topic]);
  const pages = Math.max(1, Math.ceil(rows.length / PER_PAGE));
  const current = Math.min(page, pages);
  const items = rows.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  return (
    <View style={{ flex: 1 }}>
      <AppScreen heading="커뮤니티">
        <ContentSection><PageTitle title="함께 나누는 이야기" /></ContentSection>
        <ChipRow items={TOPICS} value={topic} onChange={(k) => { setTopic(k); setPage(1); }} />
        <ContentSection>
          {items.map((p) => <PostRow key={p.id} post={p} commentCount={postComments(comments, p.id).length} onPress={() => router.push(`/community/${p.id}` as Href)} />)}
          {items.length === 0 ? <EmptyState icon="messages-square" title="첫 이야기를 기다리고 있어요" text="나의 작은 경험을 나눠보세요." /> : null}
          <Pagination page={current} pages={pages} onChange={setPage} />
          <View style={{ height: CTRL.xl + SP[16] }} />
        </ContentSection>
      </AppScreen>
      <Pressable onPress={() => router.push("/community/new" as Href)} accessibilityRole="link" style={({ pressed }) => [s.write, pressed && { opacity: 0.85 }]}>
        <Icon name="pencil" size={20} color={T.alias.staticWhite} />
        <Text style={typo("headline2", "semibold", T.alias.staticWhite)}>글쓰기</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  write: { position: "absolute", alignSelf: "center", bottom: SP[80] + SP[32], flexDirection: "row", alignItems: "center", gap: SP[8], minHeight: CTRL.xl, paddingHorizontal: SP[24], borderRadius: RAD.full, backgroundColor: T.primary.normal, ...ELEV.large, marginHorizontal: SHELL.gutter },
});
