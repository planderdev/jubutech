import { useState } from "react";
import { StyleSheet, Text } from "react-native";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { journalSharePreview } from "@jubutech/shared";
import { EmptyState, PageTitle } from "@/components/campaign";
import { Accordion, BottomCta, Checkbox, Field } from "@/components/form";
import { AppScreen, ContentSection } from "@/components/screen";
import { Button } from "@/components/ui";
import { useDemo } from "@/lib/demo-store";
import { SP, T, typo } from "@/theme";

/** 복기 공유 — PHP `shareJournal()`: 제목·이야기 + 공개할 항목(종목명·매매 이유·복기 메모) 고르기 + 미리보기. 금액은 공개하지 않는다 */
export default function ShareJournal() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { journals, member, savePost } = useDemo();
  const j = journals.find((x) => x.id === id && x.memberId === member.id);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [opts, setOpts] = useState({ includeStock: false, includeReason: false, includeReflection: false });
  const [error, setError] = useState("");
  const back = () => (router.canGoBack() ? router.back() : router.replace("/journal/entries" as Href));
  if (!j) return <AppScreen title="복기 공유" onBack={back} tabBar={false}><ContentSection><EmptyState icon="lock-keyhole" title="접근할 수 없는 기록이에요" text="이 기록은 작성자만 볼 수 있어요." /></ContentSection></AppScreen>;
  const preview = journalSharePreview(j, opts, body);
  const submit = () => {
    if (!body.trim()) return setError("함께 나눌 이야기를 적어 주세요.");
    const r = savePost({ topic: "주식·재테크", title, body: preview, sourceJournalId: j.id });
    if (!r.ok) return setError(r.message);
    router.replace(`/community/${r.id}` as Href);
  };
  return (
    <AppScreen title="복기 공유" onBack={back} tabBar={false} grouped={false} bottom={<BottomCta status={error || undefined} tone="error"><Button label="선택한 내용으로 게시" full onPress={submit} style={{ flex: 1 }} /></BottomCta>}>
      <ContentSection style={s.form}>
        <PageTitle title="공유할 이야기만 골라요" sub="원본 일지와 거래금액은 비공개로 유지돼요." />
        <Field label="게시글 제목" value={title} onChangeText={setTitle} autoCapitalize="sentences" />
        <Field label="함께 나눌 이야기" value={body} onChangeText={setBody} multiline autoCapitalize="sentences" />
        <Checkbox checked={opts.includeStock} onChange={(v) => setOpts((o) => ({ ...o, includeStock: v }))} label="종목명 포함" sub={j.stockName || "작성한 내용 없음"} />
        <Checkbox checked={opts.includeReason} onChange={(v) => setOpts((o) => ({ ...o, includeReason: v }))} label="매매 이유 포함" sub={j.reason || "작성한 내용 없음"} />
        <Checkbox checked={opts.includeReflection} onChange={(v) => setOpts((o) => ({ ...o, includeReflection: v }))} label="복기 메모 포함" sub={j.reflection || "작성한 내용 없음"} />
        <Accordion title="공개 내용 미리보기" defaultOpen>
          <Text style={typo("body2", "regular", T.label.neutral)}>{preview || "선택한 항목과 직접 작성한 이야기만 공개됩니다."}</Text>
        </Accordion>
      </ContentSection>
    </AppScreen>
  );
}

const s = StyleSheet.create({ form: { gap: SP[16] } });
