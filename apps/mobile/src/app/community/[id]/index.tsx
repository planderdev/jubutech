import { useState } from "react";
import { Share, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { demoDateLabel, demoMemberName, postComments, type DemoComment } from "@jubutech/shared";
import { EmptyState } from "@/components/campaign";
import { Accordion, Field } from "@/components/form";
import { AppScreen, ContentSection } from "@/components/screen";
import { ActionSheet } from "@/components/sheet";
import { Badge, Button, GroupSection, IconButton, ListHeader, TextButton } from "@/components/ui";
import { confirmDialog, noticeDialog } from "@/lib/dialog";
import { useDemo } from "@/lib/demo-store";
import { SP, T, typo } from "@/theme";

/**
 * 글 상세 — PHP `communityDetail()`: 주제·제목·작성자 → 본문 → 공감/공유 → 함께 나눈 이야기(댓글, 도움됐어요) → 댓글 입력 → 이 게시글 신고.
 * 내 글·내 댓글은 "…" 시트로 수정·삭제. 숨김·검토 대기 글은 작성자에게만 안내와 함께 보인다.
 */
export default function PostDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { posts, comments, member, togglePostLike, addComment, deleteComment, toggleCommentLike, deletePost, reportPost } = useDemo();
  const [sheet, setSheet] = useState(false);
  const [body, setBody] = useState("");
  const [bodyError, setBodyError] = useState("");
  const [reason, setReason] = useState("");
  const [reportMsg, setReportMsg] = useState("");
  const back = () => (router.canGoBack() ? router.back() : router.replace("/community" as Href));
  const p = posts.find((x) => x.id === id);
  const mine = p?.memberId === member.id;
  if (!p || p.status === "deleted" || (p.status !== "published" && !mine)) {
    return (
      <AppScreen title="이야기" onBack={back} tabBar={false}>
        <ContentSection><EmptyState icon="messages-square" title="볼 수 없는 글이에요" text="삭제되었거나 운영 정책으로 가려진 글이에요." actionLabel="목록으로" actionVariant="weak" onAction={back} /></ContentSection>
      </AppScreen>
    );
  }
  const liked = p.likes.includes(member.id);
  const rows = postComments(comments, p.id);
  const share = async () => {
    try {
      await Share.share({ message: `${p.title}\n\n주부테크 커뮤니티에서 읽기`, title: p.title });
    } catch {
      noticeDialog("공유", "이 기기에서는 공유 시트를 열 수 없어요.");
    }
  };
  const submitComment = () => {
    const r = addComment(p.id, body);
    if (!r.ok) return setBodyError(r.message);
    setBody("");
    setBodyError("");
  };
  const submitReport = () => setReportMsg(((r) => { if (r.ok) setReason(""); return r.message; })(reportPost(p.id, reason)));

  return (
    <AppScreen title="이야기" onBack={back} tabBar={false} grouped={false} right={mine ? <IconButton name="sliders-horizontal" label="글 더 보기" onPress={() => setSheet(true)} /> : undefined}>
      <ContentSection style={s.article}>
        <Badge label={p.topic} />
        <Text style={typo("title2", "bold")}>{p.title}</Text>
        <Text style={typo("label2", "regular", T.label.alternative)}>{demoMemberName(p.memberId)} · {demoDateLabel(p.createdAt, "Y.m.d")}</Text>
        {p.status !== "published" ? <Text style={typo("label2", "semibold", T.status.cautionary)}>{p.status === "review" ? "운영팀 검토가 끝나면 공개돼요" : "운영 정책으로 가려진 글이에요"}{p.moderationNote ? ` · ${p.moderationNote}` : ""}</Text> : null}
        <Text style={typo("body1", "regular")}>{p.body}</Text>
        <View style={s.actions}>
          <Button label={`공감 ${p.likes.length}`} variant={liked ? "weak" : "neutral"} size="lg" onPress={() => togglePostLike(p.id)} style={{ flex: 1 }} />
          <Button label="공유" variant="neutral" size="lg" onPress={share} style={{ flex: 1 }} />
        </View>
      </ContentSection>

      <GroupSection style={s.commentsWrap}>
        <ListHeader title="함께 나눈 이야기" action="" />
        <ContentSection>
          {rows.map((c) => <CommentRow key={c.id} comment={c} mine={c.memberId === member.id} liked={c.likes.includes(member.id)} onLike={() => toggleCommentLike(c.id)} onDelete={() => confirmDialog("댓글 삭제", "이 댓글을 삭제할까요?", () => deleteComment(c.id), { destructive: true, confirmLabel: "삭제" })} />)}
          {rows.length === 0 ? <Text style={[typo("body2", "regular", T.label.alternative), { paddingBottom: SP[16] }]}>아직 댓글이 없어요. 첫 이야기를 남겨 보세요.</Text> : null}
          <Field label="댓글" value={body} onChangeText={setBody} placeholder="서로를 존중하는 이야기를 남겨주세요." multiline error={bodyError} />
          <Button label="댓글 남기기" size="lg" onPress={submitComment} style={{ marginTop: SP[16] }} />
        </ContentSection>
      </GroupSection>

      {!mine ? (
        <ContentSection>
          <Accordion title="이 게시글 신고">
            <Field label="신고 사유" value={reason} onChangeText={setReason} multiline />
            {reportMsg ? <Text style={typo("label2", "regular", T.label.alternative)} accessibilityLiveRegion="polite">{reportMsg}</Text> : null}
            <Button label="신고 접수" variant="neutral" size="lg" onPress={submitReport} />
          </Accordion>
        </ContentSection>
      ) : null}

      <ActionSheet open={sheet} title="글 관리" onClose={() => setSheet(false)} actions={[
        { label: "글 수정", icon: "pencil", onPress: () => router.push(`/community/new?id=${p.id}` as Href) },
        { label: "글 삭제", icon: "x", danger: true, onPress: () => confirmDialog("글 삭제", "공개된 글을 삭제할까요?", () => { deletePost(p.id); back(); }, { destructive: true, confirmLabel: "삭제" }) },
      ]} />
    </AppScreen>
  );
}

function CommentRow({ comment: c, mine, liked, onLike, onDelete }: { comment: DemoComment; mine: boolean; liked: boolean; onLike: () => void; onDelete: () => void }) {
  return (
    <View style={s.comment}>
      <Text style={typo("label1", "semibold")}>{demoMemberName(c.memberId)}</Text>
      <Text style={typo("body2", "regular")}>{c.body}</Text>
      <View style={s.commentMeta}>
        <Text style={typo("caption1", "regular", T.label.alternative)}>{demoDateLabel(c.createdAt, "m.d")}</Text>
        {!mine ? <TextButton label={`도움됐어요 ${c.likes.length}`} icon={null} color={liked ? T.primary.normal : T.label.alternative} onPress={onLike} /> : <Text style={typo("caption1", "regular", T.label.alternative)}>도움됐어요 {c.likes.length}</Text>}
        {mine ? <TextButton label="삭제" icon={null} color={T.label.alternative} onPress={onDelete} /> : null}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  article: { gap: SP[16], paddingVertical: SP[16] },
  actions: { flexDirection: "row", gap: SP[8] },
  commentsWrap: { marginHorizontal: 0, marginTop: SP[8], borderTopWidth: SP[8], borderTopColor: T.background.normalAlternative },
  comment: { gap: SP[8], paddingBottom: SP[16], marginBottom: SP[16], borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: T.line.solidNormal },
  commentMeta: { flexDirection: "row", alignItems: "center", gap: SP[8] },
});
