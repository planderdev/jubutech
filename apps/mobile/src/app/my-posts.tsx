import { Text } from "react-native";
import { useRouter, type Href } from "expo-router";
import { myPosts, postComments } from "@jubutech/shared";
import { EmptyState, PageTitle } from "@/components/campaign";
import { AppScreen, ContentSection } from "@/components/screen";
import { Button } from "@/components/ui";
import { useDemo } from "@/lib/demo-store";
import { PostRow } from "@/components/community";
import { SP, T, typo } from "@/theme";

/** 내가 쓴 글 — PHP `/mypage/posts`. 검토 대기·숨김 글도 본인에게는 사유와 함께 보인다 */
export default function MyPosts() {
  const router = useRouter();
  const { posts, comments, member } = useDemo();
  const rows = myPosts(posts, member.id);
  const back = () => (router.canGoBack() ? router.back() : router.replace("/my" as Href));
  return (
    <AppScreen title="내가 쓴 글" onBack={back} tabBar={false} grouped={false}>
      <ContentSection>
        <PageTitle title="내가 쓴 글" sub="나눈 이야기를 모아 보고, 이어서 관리해요." />
        {rows.map((p) => <PostRow key={p.id} post={p} commentCount={postComments(comments, p.id).length} onPress={() => router.push(`/community/${p.id}` as Href)} note={p.status === "review" ? "운영팀 검토 중이에요" : p.status === "hidden" ? "운영 정책으로 가려졌어요" : undefined} />)}
        {rows.length === 0 ? <EmptyState icon="messages-square" title="아직 쓴 글이 없어요" text="나의 작은 경험을 들려주세요." actionLabel="첫 이야기 쓰기" actionVariant="weak" onAction={() => router.push("/community/new" as Href)} /> : <Button label="글쓰기" variant="weak" size="lg" onPress={() => router.push("/community/new" as Href)} style={{ marginTop: SP[16] }} />}
        <Text style={[typo("caption2", "regular", T.label.alternative), { marginVertical: SP[16] }]}>숨김·검토 대기 글은 나에게만 보여요.</Text>
      </ContentSection>
    </AppScreen>
  );
}
