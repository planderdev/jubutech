import { useEffect, useMemo, useRef, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { DEFAULT_RULES, DEMO_CAMPAIGNS, checkReview, demoReview, isSafeUrl, missionWithDefaults, reviewCharCount, reviewCheckSummary, type LinkStatus, type ReviewCheck } from "@jubutech/shared";
import { ChipRow, EmptyState } from "@/components/campaign";
import { BottomCta, Field, InfoBox } from "@/components/form";
import { Icon } from "@/components/icon";
import { CheckResultList, MissionChecklist, PhotoStepper } from "@/components/review";
import { AppScreen, ContentSection } from "@/components/screen";
import { Button, GroupCard, GroupSection, IconButton } from "@/components/ui";
import { useDemo } from "@/lib/demo-store";
import { ELEV, RAD, SP, T, typo } from "@/theme";

type Mode = "link" | "write";
const MODES: { key: Mode; label: string }[] = [
  { key: "link", label: "링크 붙여넣기" },
  { key: "write", label: "앱에서 작성" },
];

/**
 * 후기 제출 — PHP `reviewForm()` (`/applications/{id}/review`) + 1-1 미션 카드·자동 검수:
 * 제목 → (보완 요청 사유) → 미션 체크리스트(입력에 따라 실시간) → 링크/직접 작성 → 사진 장수 → 고정 CTA "자동 검사 후 제출".
 * 검사 미통과면 결과 시트에서 고치거나 그대로 제출(운영팀 확인)할 수 있다 — PHP 와 같이 제출 자체는 막지 않는다.
 */
export default function ReviewForm() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const store = useDemo();
  const a = store.applications.find((x) => x.id === id && x.memberId === store.member.id);
  const c = a ? DEMO_CAMPAIGNS.find((x) => x.id === a.campaignId) : undefined;
  const r = a ? demoReview(a.id, store.reviews) : undefined;
  const mission = useMemo(() => missionWithDefaults(DEFAULT_RULES, c?.mission), [c]);
  const isSurvey = c?.channel === "설문";

  const [mode, setMode] = useState<Mode>(() => (r?.content && !r.url) || isSurvey ? "write" : "link");
  const [url, setUrl] = useState(r?.url ?? "");
  const [content, setContent] = useState(r?.content ?? "");
  const [photoCount, setPhotoCount] = useState(r?.photoCount ?? 0);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [linkStatus, setLinkStatus] = useState<LinkStatus>("unknown");
  const [result, setResult] = useState<ReviewCheck | null>(null);

  // 저장소 복원(hydrate)이 화면보다 늦으면(새로고침·딥링크) 기존 후기를 한 번만 폼에 채운다
  const seeded = useRef(false);
  useEffect(() => {
    if (!store.hydrated || seeded.current || !r) return;
    seeded.current = true;
    if (!url && !content) {
      setUrl(r.url ?? "");
      setContent(r.content ?? "");
      setPhotoCount(r.photoCount ?? 0);
      if (r.content && !r.url) setMode("write");
    }
  }, [store.hydrated, r, url, content]);

  const submission = { url: mode === "link" ? url : "", content, photoCount, linkStatus };
  const live = useMemo(() => (url.trim() || content.trim() ? checkReview(mission, submission, store.now) : undefined), [mission, url, content, photoCount, linkStatus, mode, store.now]); // eslint-disable-line react-hooks/exhaustive-deps

  const back = () => (router.canGoBack() ? router.back() : router.replace(`/application/${id}` as Href));
  if (!a || !c || a.selectionStatus !== "selected") return <AppScreen title="후기 제출" onBack={back} tabBar={false}><EmptyState title="후기 제출 대상이 아니에요" text="선정된 체험에서만 후기를 제출할 수 있어요." actionLabel="내 응모 목록" actionVariant="weak" onAction={() => router.replace("/campaigns/applications" as Href)} /></AppScreen>;
  if (r && (r.status === "approved" || r.status === "rejected"))
    return (
      <AppScreen title="후기 제출" onBack={back} tabBar={false}>
        <EmptyState icon="circle-check" title={r.status === "approved" ? "승인된 후기예요" : "반려된 후기예요"} text={r.status === "rejected" ? r.feedback || "문의에서 검토 사유를 확인해 주세요." : "제출한 후기는 내 응모에서 확인해 주세요."} actionLabel="내 응모 확인" actionVariant="weak" onAction={() => router.replace(`/application/${a.id}` as Href)} />
      </AppScreen>
    );

  const finish = (check: ReviewCheck) => {
    const res = store.submitReview(a.id, { url: submission.url, content, photoCount, check });
    setResult(null);
    if (!res.ok) {
      setError(res.message);
      return;
    }
    router.replace(`/application/${a.id}?submitted=1` as Href);
  };

  const submit = async () => {
    const u = submission.url.trim();
    if (!u && !content.trim()) {
      setError(mode === "link" ? "후기 링크를 붙여넣거나 '앱에서 작성'으로 내용을 입력해 주세요." : "후기 내용을 입력해 주세요.");
      return;
    }
    if (u && !isSafeUrl(u)) {
      setError("올바른 후기 URL(https://…)을 입력해 주세요.");
      return;
    }
    setError("");
    setBusy(true);
    const status = u ? await probeLink(u) : "unknown";
    setLinkStatus(status);
    const check = checkReview(mission, { ...submission, linkStatus: status }, new Date().toISOString());
    setBusy(false);
    if (check.passed) finish(check);
    else setResult(check);
  };

  const chars = reviewCharCount(content);
  const onUrl = (v: string) => { setUrl(v); setError(""); };
  const onContent = (v: string) => { setContent(v); setError(""); };
  return (
    <AppScreen
      title="후기 제출"
      onBack={back}
      tabBar={false}
      bottom={
        <BottomCta tone={error ? "error" : "neutral"} status={error ? error : busy ? "링크를 확인하고 있어요…" : live ? reviewCheckSummary(live).text : "제출 전에 미션 기준을 자동으로 검사해요"}>
          <Button label={busy ? "검사 중…" : r ? "보완 후기 제출" : "자동 검사 후 제출"} full disabled={busy} onPress={submit} style={{ flex: 1 }} />
        </BottomCta>
      }
    >
      <ContentSection>
        <View style={s.title}>
          <Text style={typo("title2", "bold")}>솔직한 경험을 나눠주세요</Text>
          <Text style={typo("body2", "regular", T.label.neutral)}>{c.brand} · {c.title}</Text>
        </View>
        {r?.status === "revision" && r.feedback ? (
          <InfoBox style={{ borderColor: T.primary.normal, marginBottom: SP[16] }}>
            <Text style={typo("label1", "semibold", T.primary.normal)}>운영팀 보완 요청</Text>
            <Text style={typo("body2", "regular")}>{r.feedback}</Text>
          </InfoBox>
        ) : null}
      </ContentSection>

      <GroupSection style={{ marginTop: 0 }}>
        <GroupCard style={s.card}>
          <Text style={typo("headline2", "bold")}>미션 체크리스트</Text>
          <MissionChecklist mission={mission} check={live} dueAt={c.reviewDueAt} now={store.now} includeLink={!isSurvey} />
        </GroupCard>
      </GroupSection>

      {!isSurvey ? <ChipRow items={MODES} value={mode} onChange={setMode} /> : null}

      <ContentSection style={s.form}>
        {mode === "link" ? (
          <>
            <Field label="후기 URL" value={url} onChangeText={onUrl} placeholder="https://blog.naver.com/…" keyboardType="url" help="블로그·인스타그램 게시물 주소. 제출할 때 열리는지 확인해요." />
            <Field label="후기 내용 (선택)" value={content} onChangeText={onContent} multiline autoCapitalize="sentences" placeholder="게시물 본문을 붙여넣으면 글자 수·키워드·해시태그를 미리 검사해요." help={content ? `${chars}자` : "비워 두면 본문 항목은 운영팀이 직접 확인해요."} />
          </>
        ) : (
          <>
            <Field label="후기 내용" value={content} onChangeText={onContent} multiline autoCapitalize="sentences" placeholder={mission.minChars ? `${mission.minChars}자 이상, 직접 써 본 느낌을 솔직하게` : "직접 써 본 느낌을 솔직하게"} help={mission.minChars ? `${chars} / ${mission.minChars}자` : `${chars}자`} />
            <Pressable disabled accessibilityRole="button" accessibilityState={{ disabled: true }} style={s.aiButton}>
              <Icon name="sparkles" size={20} color={T.label.assistive} />
              <Text style={[typo("label1", "semibold", T.label.assistive), { flex: 1 }]}>AI 교정·이어쓰기</Text>
              <Text style={typo("caption1", "regular", T.label.assistive)}>{DEFAULT_RULES.assist.aiReviewEdit ? "" : "준비 중"}</Text>
            </Pressable>
          </>
        )}
        {mission.photoCount > 0 ? (
          <View style={{ gap: SP[8] }}>
            <PhotoStepper value={photoCount} onChange={setPhotoCount} label={mode === "link" ? "게시물에 올린 사진" : "첨부할 사진"} />
            <Text style={typo("caption1", "regular", T.label.alternative)}>사진 업로드는 데이터 연결 뒤에 들어와요. 지금은 장수만 세요.</Text>
          </View>
        ) : null}
      </ContentSection>

      <ResultSheet check={result} onClose={() => setResult(null)} onSubmitAnyway={() => result && finish(result)} />
    </AppScreen>
  );
}

/** 링크 HEAD 확인 — 6초 안에 응답하면 상태 코드로, 네트워크 오류(웹 CORS 포함)면 `unknown` */
async function probeLink(url: string): Promise<LinkStatus> {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 6000);
  try {
    const res = await fetch(url, { method: "HEAD", signal: ctl.signal, redirect: "follow" });
    if (res.type === "opaque") return "unknown";
    return res.status >= 400 ? "unreachable" : "ok";
  } catch {
    return "unknown";
  } finally {
    clearTimeout(timer);
  }
}

/** 자동 검사 결과 바텀시트 — "사진 2장 더 필요해요" 식 안내, 수정 / 그대로 제출 */
function ResultSheet({ check, onClose, onSubmitAnyway }: { check: ReviewCheck | null; onClose: () => void; onSubmitAnyway: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={!!check} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={s.backdrop} onPress={onClose} accessibilityLabel="닫기" />
      <View style={[s.sheet, { paddingBottom: SP[16] + insets.bottom }]}>
        <View style={s.sheetHeader}>
          <Text style={typo("heading2", "bold")}>아직 미션 기준에 못 미쳐요</Text>
          <IconButton name="x" label="닫기" onPress={onClose} />
        </View>
        <View style={{ paddingHorizontal: SP[24], gap: SP[16] }}>
          {check ? <CheckResultList check={check} /> : null}
          <Text style={typo("label2", "regular", T.label.alternative)}>그대로 제출하면 운영팀이 직접 확인한 뒤 보완을 요청할 수 있어요.</Text>
        </View>
        <View style={s.sheetButtons}>
          <Button label="그대로 제출" variant="neutral" onPress={onSubmitAnyway} style={{ flex: 1 }} />
          <Button label="수정하기" onPress={onClose} style={{ flex: 1.4 }} />
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  title: { marginVertical: SP[16], gap: SP[8] },
  card: { padding: SP[16], gap: SP[16] },
  form: { gap: SP[16], marginTop: SP[8] },
  aiButton: { flexDirection: "row", alignItems: "center", gap: SP[8], minHeight: SP[48], paddingHorizontal: SP[16], borderRadius: RAD.md, borderWidth: 1, borderStyle: "dashed", borderColor: T.line.normalNormal },
  backdrop: { flex: 1, backgroundColor: T.material.dimmer },
  sheet: { backgroundColor: T.background.normalNormal, borderTopLeftRadius: RAD.xl, borderTopRightRadius: RAD.xl, paddingTop: SP[8], ...ELEV.large },
  sheetHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingLeft: SP[24], paddingRight: SP[8], minHeight: SP[56], marginBottom: SP[8] },
  sheetButtons: { flexDirection: "row", gap: SP[8], paddingHorizontal: SP[16], paddingTop: SP[24] },
});
