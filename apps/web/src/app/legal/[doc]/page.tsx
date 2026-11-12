import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DEFAULT_RULES, LEGAL_DOC_KEYS, LEGAL_DOC_TITLE, LEGAL_STATUS, legalDoc, type LegalDocKey } from "@jubutech/shared";
import { PageHeader } from "@/components/feature/page-header";

/**
 * 약관·개인정보처리방침·리워드 안내·응모 동의 — 스토어 등록의 "개인정보처리방침 URL"이 이 주소(`/legal/privacy`)다.
 * 본문은 shared `legalDoc()` 하나를 앱(`/legal/[doc]`)과 같이 쓴다. 정적 생성.
 */
export const dynamicParams = false;
export function generateStaticParams() {
  return LEGAL_DOC_KEYS.map((doc) => ({ doc }));
}
export async function generateMetadata({ params }: { params: Promise<{ doc: string }> }): Promise<Metadata> {
  const { doc } = await params;
  const title = LEGAL_DOC_TITLE[doc as LegalDocKey] ?? "안내";
  return { title, robots: { index: true } };
}

export default async function LegalPage({ params }: { params: Promise<{ doc: string }> }) {
  const { doc } = await params;
  if (!LEGAL_DOC_KEYS.includes(doc as LegalDocKey)) notFound();
  const d = legalDoc(doc as LegalDocKey, DEFAULT_RULES);
  const updated = LEGAL_STATUS.updatedAt.replace(/-/g, ".");
  return (
    <div className="px-4 md:px-5 pb-16">
      <PageHeader eyebrow="Legal" title={d.title} description={d.summary} />
      <nav aria-label="문서 목록" className="flex flex-wrap gap-2 mb-6">
        {LEGAL_DOC_KEYS.map((k) => (
          <Link key={k} href={`/legal/${k}`} className={`label rounded-full px-3 py-1.5 border ${k === doc ? "bg-red text-paper border-red" : "border-hairline text-ink-2 hover:text-red"}`}>{LEGAL_DOC_TITLE[k]}</Link>
        ))}
      </nav>
      {LEGAL_STATUS.stage === "draft" && <p className="rounded-xl bg-canvas border border-hairline px-4 py-3 text-[13px] text-ink-2 mb-6">{LEGAL_STATUS.note} · {updated} 기준</p>}
      <article className="bg-paper rounded-xl shadow-soft p-5 md:p-8 space-y-7 max-w-3xl">
        {d.sections.map((sec) => (
          <section key={sec.heading}>
            <h2 className="text-[17px] font-bold mb-2 break-keep">{sec.heading}</h2>
            {sec.paragraphs?.map((p, i) => <p key={i} className="text-[14px] text-ink-2 leading-relaxed break-keep mb-2">{p}</p>)}
            {sec.bullets && <ul className="list-disc pl-5 space-y-1.5 text-[14px] text-ink-2 leading-relaxed break-keep">{sec.bullets.map((b, i) => <li key={i}>{b}</li>)}</ul>}
          </section>
        ))}
        <p className="text-[12px] text-ink-3">시행일 {updated} · 앱과 웹에서 같은 내용으로 보여요.</p>
      </article>
    </div>
  );
}
