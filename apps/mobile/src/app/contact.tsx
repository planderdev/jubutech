import { useState } from "react";
import { Text, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { INQUIRY_CATEGORIES, LEGAL_PLACEHOLDER, demoDateLabel, type InquiryCategory } from "@jubutech/shared";
import { ChipRow, PageTitle } from "@/components/campaign";
import { BottomCta, Field } from "@/components/form";
import { AppScreen, ContentSection } from "@/components/screen";
import { Badge, Button, ListHeader } from "@/components/ui";
import { useDemo } from "@/lib/demo-store";
import { SP, T, typo } from "@/theme";

/** 문의하기 — 분류·내용을 남기면 내 문의 목록에 쌓인다. 1단계 W8(Supabase) 뒤 `inquiries` 로 운영자에게 간다. 지금은 기기 안에만 저장 */
export default function Contact() {
  const router = useRouter();
  const { inquiries, member, addInquiry } = useDemo();
  const [category, setCategory] = useState<InquiryCategory>("campaign");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState("");
  const [isError, setIsError] = useState(false);
  const back = () => (router.canGoBack() ? router.back() : router.replace("/my" as Href));
  const mine = inquiries.filter((q) => q.memberId === member.id);
  const submit = () => {
    const r = addInquiry(category, body);
    setStatus(r.message);
    setIsError(!r.ok);
    if (r.ok) setBody("");
  };
  return (
    <AppScreen title="문의하기" onBack={back} tabBar={false} grouped={false} bottom={<BottomCta status={status || undefined} tone={isError ? "error" : "neutral"}><Button label="문의 남기기" full onPress={submit} style={{ flex: 1 }} /></BottomCta>}>
      <ContentSection><PageTitle title="무엇을 도와드릴까요?" sub={`급하면 ${LEGAL_PLACEHOLDER.contact} 로 보내 주세요.`} /></ContentSection>
      <ChipRow items={INQUIRY_CATEGORIES} value={category} onChange={setCategory} />
      <ContentSection style={{ gap: SP[8] }}>
        <Field label="내용" value={body} onChangeText={setBody} multiline autoCapitalize="sentences" placeholder="자녀 이름이나 주민등록번호 같은 정보는 적지 말아 주세요." />
        <Text style={typo("caption1", "regular", T.label.alternative)}>검토용 빌드에서는 이 기기에만 저장되고 운영팀에게 전달되지 않아요.</Text>
      </ContentSection>
      {mine.length ? <ListHeader title="내 문의" action="" /> : null}
      <ContentSection style={{ gap: SP[16] }}>
        {mine.map((q) => (
          <View key={q.id} style={{ gap: 4 }}>
            <View style={{ flexDirection: "row", gap: SP[8], alignItems: "center" }}>
              <Badge label={INQUIRY_CATEGORIES.find((c) => c.key === q.category)?.label ?? "기타"} tone="neutral" />
              <Text style={typo("caption1", "regular", T.label.alternative)}>{demoDateLabel(q.createdAt, "m.d")} · {q.status === "answered" ? "답변 완료" : "접수"}</Text>
            </View>
            <Text style={typo("body2", "regular")}>{q.body}</Text>
          </View>
        ))}
      </ContentSection>
    </AppScreen>
  );
}
