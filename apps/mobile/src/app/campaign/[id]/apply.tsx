import { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { DEMO_CAMPAIGNS, demoApplication, demoCampaignState } from "@jubutech/shared";
import { EmptyState, PageTitle } from "@/components/campaign";
import { BottomCta, Checkbox, Field, InfoBox } from "@/components/form";
import { AppScreen, ContentSection } from "@/components/screen";
import { Button, TextButton } from "@/components/ui";
import { useDemo } from "@/lib/demo-store";
import { SP, T, typo } from "@/theme";

const CONTACT_RE = /^01[0-9][- ]?\d{3,4}[- ]?\d{4}$/;
const URL_RE = /^https?:\/\/\S+$/i;

/**
 * 체험단 응모 — PHP `campaignApply()` (`/campaigns/{id}/apply`), 3단계 마법사:
 * 기본 정보(닉네임·연락처·채널 URL) → 신청 사유·추가 질문 → 동의 → 응모하기. 검증 규칙은 actions.php `apply` 와 같다.
 */
export default function CampaignApply() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const store = useDemo();
  const c = DEMO_CAMPAIGNS.find((x) => x.id === id);
  const already = c ? demoApplication(store.member.id, c.id, store.applications) : undefined;

  const [step, setStep] = useState(0);
  const [nickname, setNickname] = useState(store.member.nickname);
  const [contact, setContact] = useState("010-0000-0000");
  const [channelUrl, setChannelUrl] = useState("");
  const [reason, setReason] = useState("");
  const [extra, setExtra] = useState<string[]>(() => (c?.questions ?? []).map(() => ""));
  const [required, setRequired] = useState(false);
  const [optional, setOptional] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [general, setGeneral] = useState("");

  const back = () => router.back();
  if (!c) return <AppScreen title="체험단 응모" onBack={back} tabBar={false}><EmptyState title="체험단을 찾을 수 없어요" text="목록에서 다른 체험을 골라 주세요." /></AppScreen>;
  if (already) {
    return (
      <AppScreen title="체험단 응모" onBack={back} tabBar={false} grouped={false}>
        <EmptyState icon="circle-check" title="이미 응모한 체험이에요" text="내 응모에서 진행 상태를 확인해 주세요." actionLabel="내 응모 확인" onAction={() => router.replace(`/application/${already.id}` as Href)} />
      </AppScreen>
    );
  }
  if (demoCampaignState(c, store.now) !== "open") {
    return <AppScreen title="체험단 응모" onBack={back} tabBar={false} grouped={false}><EmptyState icon="clock" title="지금은 응모할 수 없어요" text="모집 기간을 확인해 주세요." /></AppScreen>;
  }

  const needsChannel = c.channel !== "설문";
  const validate = (s: number): Record<string, string> => {
    const e: Record<string, string> = {};
    if (s === 0) {
      if (!nickname.trim()) e.nickname = "닉네임을 입력해 주세요.";
      if (!contact.trim()) e.contact = "연락처를 입력해 주세요.";
      else if (!CONTACT_RE.test(contact.trim())) e.contact = "연락처 형식을 확인해 주세요. 가상 번호를 사용하세요.";
      if (needsChannel && !URL_RE.test(channelUrl.trim())) e.channelUrl = "http 또는 https 채널 URL을 입력해 주세요.";
    }
    if (s === 1) {
      if (!reason.trim()) e.reason = "신청 사유를 입력해 주세요.";
      extra.forEach((v, i) => { if (!v.trim()) e[`extra${i}`] = "추가 질문에 답변해 주세요."; });
    }
    if (s === 2 && !required) e.requiredConsent = "응모 정보 처리에 대한 필수 동의가 필요해요.";
    return e;
  };
  const next = () => {
    const e = validate(step);
    setErrors(e);
    if (Object.keys(e).length) return;
    setStep((v) => v + 1);
  };
  const submit = () => {
    const e = { ...validate(0), ...validate(1), ...validate(2) };
    setErrors(e);
    if (Object.keys(e).length) {
      setStep(e.nickname || e.contact || e.channelUrl ? 0 : e.reason || Object.keys(e).some((k) => k.startsWith("extra")) ? 1 : 2);
      return;
    }
    const r = store.apply(c, { campaignId: c.id, nickname, contact, channelUrl: needsChannel ? channelUrl : "", reason, extra, optionalConsent: optional });
    if (!r.ok) {
      setGeneral(r.message);
      return;
    }
    router.replace(`/application/${r.id}?complete=1` as Href);
  };

  const cta =
    step < 2 ? (
      <BottomCta status={`${step + 1} / 3`}>
        {step > 0 ? <Button label="이전" variant="neutral" onPress={() => setStep((v) => v - 1)} style={{ flex: 1 }} /> : null}
        <Button label="다음" onPress={next} style={{ flex: 1.4 }} />
      </BottomCta>
    ) : (
      <BottomCta status="3 / 3">
        <Button label="이전" variant="neutral" onPress={() => setStep(1)} style={{ flex: 1 }} />
        <Button label="응모하기" onPress={submit} style={{ flex: 1.4 }} />
      </BottomCta>
    );

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <AppScreen title="체험단 응모" onBack={back} tabBar={false} grouped={false} bottom={cta}>
        <ContentSection style={s.stack}>
          <PageTitle title="나의 이야기를 들려주세요" sub={c.title} />
          <InfoBox>화면 확인용 데모입니다. 실제 연락처 대신 가상 정보를 입력해 주세요.</InfoBox>
          {general ? <Text style={typo("label2", "regular", T.status.negative)}>{general}</Text> : null}

          {step === 0 ? (
            <View style={s.stack}>
              <Text style={typo("headline1", "bold")}>기본 정보를 확인해 주세요</Text>
              <Field label="닉네임" value={nickname} onChangeText={setNickname} error={errors.nickname} autoCapitalize="sentences" />
              <Field label="연락처" value={contact} onChangeText={setContact} keyboardType="phone-pad" error={errors.contact} />
              {needsChannel ? <Field label="활동 채널 URL" value={channelUrl} onChangeText={setChannelUrl} placeholder="https://example.com/my-channel" keyboardType="url" error={errors.channelUrl} /> : null}
            </View>
          ) : step === 1 ? (
            <View style={s.stack}>
              <Text style={typo("headline1", "bold")}>체험하고 싶은 이유를 알려주세요</Text>
              <Field label="신청 사유" value={reason} onChangeText={setReason} placeholder="나만의 체험 이야기를 들려주세요." multiline error={errors.reason} autoCapitalize="sentences" />
              {c.questions.map((q, i) => (
                <Field key={q} label={q} value={extra[i] ?? ""} onChangeText={(v) => setExtra((arr) => arr.map((x, j) => (j === i ? v : x)))} multiline error={errors[`extra${i}`]} autoCapitalize="sentences" />
              ))}
            </View>
          ) : (
            <View style={s.stack}>
              <Text style={typo("headline1", "bold")}>동의 후 응모를 마무리해요</Text>
              <Checkbox checked={required} onChange={setRequired} label="[필수] 응모 정보 수집·이용 동의" sub="검토용 문안 · 닉네임, 연락처, 채널, 신청 사유" />
              <Checkbox checked={optional} onChange={setOptional} label="[선택] 새로운 체험 소식 수신" sub="선택하지 않아도 응모할 수 있어요." />
              <TextButton label="동의 내용 읽기" style={{ alignSelf: "flex-start", paddingHorizontal: 0 }} />
              {errors.requiredConsent ? <Text style={typo("label2", "regular", T.status.negative)}>{errors.requiredConsent}</Text> : null}
              <Text style={typo("label2", "regular", T.label.alternative)}>배송형 체험의 주소는 선정된 후 입력해요.</Text>
            </View>
          )}
        </ContentSection>
      </AppScreen>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({ stack: { gap: SP[16] } });
