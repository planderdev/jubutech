import { useState } from "react";
import { StyleSheet, Text } from "react-native";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { COMMUNITY_TOPICS, POST_FORM_NOTICE, type CommunityTopic } from "@jubutech/shared";
import { ChipRow, PageTitle } from "@/components/campaign";
import { BottomCta, Field, InfoBox } from "@/components/form";
import { AppScreen, ContentSection } from "@/components/screen";
import { Button } from "@/components/ui";
import { useDemo } from "@/lib/demo-store";
import { SP, T, typo } from "@/theme";

const TOPICS = COMMUNITY_TOPICS.map((t) => ({ key: t as CommunityTopic, label: t as string }));

/** 글쓰기·수정 — PHP `communityForm()`: 주제 → 제목(120자) → 내용 → 전체 공개 안내 → 고정 CTA */
export default function PostForm() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; topic?: string }>();
  const { posts, member, savePost } = useDemo();
  const existing = params.id ? posts.find((p) => p.id === params.id && p.memberId === member.id) : undefined;
  const [topic, setTopic] = useState<CommunityTopic>(existing?.topic ?? (COMMUNITY_TOPICS.includes(params.topic as CommunityTopic) ? (params.topic as CommunityTopic) : "자유"));
  const [title, setTitle] = useState(existing?.title ?? "");
  const [body, setBody] = useState(existing?.body ?? "");
  const [error, setError] = useState("");
  const back = () => (router.canGoBack() ? router.back() : router.replace("/community" as Href));
  const submit = () => {
    const r = savePost({ id: existing?.id, topic, title, body });
    if (!r.ok) return setError(r.message);
    router.replace(`/community/${r.id}` as Href);
  };

  return (
    <AppScreen title={existing ? "이야기 수정" : "글쓰기"} onBack={back} tabBar={false} grouped={false} bottom={<BottomCta status={error || undefined} tone="error"><Button label={existing ? "수정 저장" : "이야기 게시"} full onPress={submit} style={{ flex: 1 }} /></BottomCta>}>
      <ContentSection><PageTitle title={existing ? "이야기 수정" : "어떤 이야기를 나눌까요?"} /></ContentSection>
      <ChipRow items={TOPICS} value={topic} onChange={setTopic} />
      <ContentSection style={s.form}>
        <Field label="제목" value={title} onChangeText={(v) => setTitle(v.slice(0, 120))} autoCapitalize="sentences" />
        <Field label="내용" value={body} onChangeText={setBody} multiline autoCapitalize="sentences" />
        <InfoBox>
          <Text style={typo("label1", "semibold")}>{POST_FORM_NOTICE.title}</Text>
          <Text style={typo("label2", "regular", T.label.neutral)}>{POST_FORM_NOTICE.body}</Text>
        </InfoBox>
        <Text style={typo("caption1", "regular", T.label.alternative)}>{POST_FORM_NOTICE.income}</Text>
      </ContentSection>
    </AppScreen>
  );
}

const s = StyleSheet.create({ form: { gap: SP[16], paddingTop: SP[8] } });
