/**
 * 2-3 초대 코드·대기자 — 순수 함수. 코드 생성·검증·사용 기록, 보너스 문구, 공유 메시지, 대기자 연락처 정규화, 다운로드 구간.
 */

import type { AppRules } from "./rules";
import type { InviteCode } from "./types";

/** 헷갈리는 글자(0·O·1·I) 뺀 알파벳 */
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const INVITE_PREFIX = "JUBU-";

/** 입력을 "JUBU-XXXXXX" 꼴로 — 공백·하이픈·소문자 허용 */
export function normalizeInviteCode(input: string): string {
  const raw = input.toUpperCase().replace(/[\s-]/g, "");
  const body = raw.startsWith("JUBU") ? raw.slice(4) : raw;
  return body ? `${INVITE_PREFIX}${body}` : "";
}

export function isInviteCodeFormat(code: string): boolean {
  return /^JUBU-[A-Z0-9]{4,12}$/.test(code);
}

/** 결정적 코드 — 같은 회원은 항상 같은 코드 (서버에서는 invite_codes.owner_id unique 로 1인 1코드) */
export function generateInviteCode(seed: string, length = 6): string {
  let h = 2166136261;
  for (const ch of seed) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619) >>> 0;
  }
  let out = "";
  for (let i = 0; i < length; i++) {
    h = (Math.imul(h, 1103515245) + 12345) >>> 0;
    out += ALPHABET[h % ALPHABET.length];
  }
  return `${INVITE_PREFIX}${out}`;
}

/** 내 코드 — 있으면 그대로, 없으면 만들어서 목록에 넣은 결과를 돌려준다 */
export function ensureInviteCode(codes: InviteCode[], ownerId: string, now: string): { code: InviteCode; codes: InviteCode[]; created: boolean } {
  const existing = codes.find((c) => c.ownerId === ownerId);
  if (existing) return { code: existing, codes, created: false };
  const code: InviteCode = { code: generateInviteCode(ownerId), ownerId, createdAt: now, uses: [] };
  return { code, codes: [...codes, code], created: true };
}

export type RedeemResult = { ok: true; codes: InviteCode[]; code: InviteCode } | { ok: false; reason: "format" | "not_found" | "own" | "already" };

/** 코드 사용 — 내 코드는 안 되고, 한 사람은 코드 하나만 쓸 수 있다 (invite_uses.profile_id pk 와 같은 규칙) */
export function redeemInviteCode(codes: InviteCode[], input: string, userId: string, now: string): RedeemResult {
  const code = normalizeInviteCode(input);
  if (!isInviteCodeFormat(code)) return { ok: false, reason: "format" };
  const target = codes.find((c) => c.code === code);
  if (!target) return { ok: false, reason: "not_found" };
  if (target.ownerId === userId) return { ok: false, reason: "own" };
  if (codes.some((c) => c.uses.some((u) => u.userId === userId))) return { ok: false, reason: "already" };
  const updated = { ...target, uses: [...target.uses, { userId, usedAt: now }] };
  return { ok: true, code: updated, codes: codes.map((c) => (c.code === code ? updated : c)) };
}

export const REDEEM_MESSAGE: Record<Exclude<RedeemResult, { ok: true }>["reason"], string> = {
  format: "코드 형식이 맞지 않아요. 예: JUBU-ABC234",
  not_found: "없는 초대 코드예요. 다시 확인해 주세요.",
  own: "내 초대 코드는 쓸 수 없어요.",
  already: "초대 코드는 한 번만 쓸 수 있어요.",
};

/** 보너스 문구 — `invite.bonus` 설정에 따라. 생활력은 사용자에게 점수를 보여 주지 않으므로 숫자를 숨긴다 */
export function inviteBonusLabel(rules: AppRules): { short: string; detail: string } {
  if (rules.invite.bonus === "trust") return { short: "활동 점수 가산", detail: "초대한 사람과 초대받은 사람 모두 체험단 선정에 쓰이는 활동 점수를 더 받아요." };
  return { short: "첫 체험단 우선 선정권", detail: "초대한 사람과 초대받은 사람 모두 첫 체험단 응모에서 우선 선정돼요." };
}

/** 공유 시트(카톡 등)에 넣을 글 — `webUrl` 이 있으면 랜딩 링크(?code=)를 붙인다 */
export function inviteShareMessage(code: string, rules: AppRules, webUrl?: string): string {
  const bonus = inviteBonusLabel(rules).short;
  const link = webUrl ? `\n${webUrl.replace(/\/$/, "")}/landing?code=${encodeURIComponent(code)}` : "";
  return `주부테크에서 체험단 후기 쓰고 용돈 벌어요 🙂\n초대 코드 ${code} 를 넣으면 둘 다 ${bonus}!${link}`;
}

/* ───────── 대기자 (랜딩 「출시 알림 받기」) ───────── */

export function normalizeContact(input: string): { channel: "email" | "phone"; contact: string } | null {
  const v = input.trim();
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return { channel: "email", contact: v.toLowerCase() };
  const digits = v.replace(/[^\d]/g, "");
  if (/^01[016789]\d{7,8}$/.test(digits)) return { channel: "phone", contact: `${digits.slice(0, 3)}-${digits.slice(3, digits.length - 4)}-${digits.slice(-4)}` };
  return null;
}

/** 다운로드·대기자 카운터 구간 — 품앗이 50건부터 */
export const DOWNLOAD_MILESTONES = [50, 100, 300, 1000, 3000];
export function downloadMilestone(count: number): { next: number | null; prev: number; progress: number; label: string } {
  const next = DOWNLOAD_MILESTONES.find((m) => count < m) ?? null;
  const prev = [...DOWNLOAD_MILESTONES].reverse().find((m) => count >= m) ?? 0;
  const progress = next ? Math.min(1, (count - prev) / (next - prev)) : 1;
  return { next, prev, progress, label: next ? `다음 구간 ${next.toLocaleString()}까지 ${(next - count).toLocaleString()}` : "최고 구간 달성" };
}
