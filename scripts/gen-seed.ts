/**
 * supabase/seed.sql 생성기 — `npx tsx scripts/gen-seed.ts`.
 * 원본은 packages/shared 의 DEMO_* (PHP 픽스처 모양). 변환은 db-map.ts 와 같은 함수를 쓴다.
 * 데모 회원은 비밀번호 없는 auth.users 행이라 로그인할 수 없다(화면 검토용 데이터). 실제 운영 DB 에는 넣지 않는다.
 */
import { writeFileSync } from "node:fs";
import {
  DEMO_APPLICATIONS, DEMO_ARTICLES, DEMO_CAMPAIGNS, DEMO_CAMPAIGN_OWNERS, DEMO_CATEGORIES, DEMO_COMMENTS, DEMO_INVITE_CODES, DEMO_JOURNALS, DEMO_JOURNAL_GOALS,
  DEMO_MEMBERS, DEMO_MODERATION_WORDS, DEMO_NOTICES, DEMO_POINTS, DEMO_POSTS, DEMO_REVIEWS, DEMO_TRUST_EVENTS,
  applicationToRow, articleToRow, campaignToRow, categoryToRow, commentToRow, demoUuid, journalToRow, memberToRow, pointToRow, postToRow, reviewToRow, trustEventToRow,
} from "../packages/shared/src/index";

type Val = string | number | boolean | null | undefined | object;
function lit(v: Val, cast?: string): string {
  if (v === null || v === undefined) return "null";
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (Array.isArray(v) && cast?.endsWith("[]")) return v.length ? `array[${v.map((x) => lit(x as Val)).join(", ")}]::${cast}` : `'{}'::${cast}`;
  if (typeof v === "object") return `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`;
  return `'${v.replace(/'/g, "''")}'${cast ? `::${cast}` : ""}`;
}
function insert(table: string, rows: Record<string, Val>[], casts: Record<string, string> = {}): string {
  if (!rows.length) return "";
  const cols = Object.keys(rows[0]);
  const values = rows.map((r) => `  (${cols.map((c) => lit(r[c], casts[c])).join(", ")})`).join(",\n");
  return `insert into public.${table} (${cols.join(", ")}) values\n${values};\n`;
}

const ADVERTISERS = [
  { id: "a1", nickname: "그린테이블 마케팅", brand: "그린테이블" },
  { id: "a2", nickname: "베베코튼", brand: "베베코튼" },
  { id: "ops", nickname: "주부테크 운영", brand: "주부테크" },
];
const users = [...DEMO_MEMBERS.map((m) => ({ id: m.id, nickname: m.nickname })), ...ADVERTISERS];
const ownerOf = (campaignId: string) => demoUuid(DEMO_CAMPAIGN_OWNERS[campaignId] ?? "ops");
const channelOf = (campaignId: string) => DEMO_CAMPAIGNS.find((c) => c.id === campaignId)?.channel ?? "블로그";

const out: string[] = [
  "-- 생성 파일: scripts/gen-seed.ts 로 다시 만든다. 손으로 고치지 않는다.",
  "-- 검토용 데모 데이터 (2026-10-21 기준, 모두 가상). 0001~0004 적용 뒤 실행.",
  "begin;",
  "",
  "-- 회원: auth.users 를 넣으면 가입 트리거가 profiles 를 만든다. 트리거의 가입 축하 포인트는 데모 원장과 겹치므로 지운다.",
  `insert into auth.users (id, email, raw_user_meta_data) values\n${users.map((u) => `  (${lit(demoUuid(u.id))}, ${lit(`demo+${u.id}@jubutech.invalid`)}, ${lit({ nickname: u.nickname })})`).join(",\n")};`,
  `delete from public.point_logs where reason = '가입 축하 포인트' and profile_id in (${users.map((u) => lit(demoUuid(u.id))).join(", ")});`,
  ...DEMO_MEMBERS.map((m) => { const r = memberToRow(m); return `update public.profiles set nickname = ${lit(r.nickname)}, region = ${lit(r.region)}, masked_contact = ${lit(r.masked_contact)}, account_status = ${lit(r.account_status)}, created_at = ${lit(r.created_at)}, points = 0, badges = '{}' where id = ${lit(r.id)};`; }),
  ...ADVERTISERS.map((a) => `update public.profiles set role = ${lit(a.id === "ops" ? "admin" : "advertiser", "user_role")}, brand = ${lit(a.brand)}, points = 0, badges = '{}' where id = ${lit(demoUuid(a.id))};`),
  "",
  insert("info_categories", DEMO_CATEGORIES.map(categoryToRow), { id: "info_category" }),
  insert("info_articles", DEMO_ARTICLES.map(articleToRow), { category: "info_category", body: "text[]", child_ages: "text[]" }),
  insert("campaigns", DEMO_CAMPAIGNS.map((c) => campaignToRow(c, ownerOf(c.id))), { channels: "channel_type[]", missions: "text[]", questions: "text[]", status: "campaign_status" }),
  insert("applications", DEMO_APPLICATIONS.map((a) => applicationToRow(a, channelOf(a.campaignId))), { channel: "channel_type", status: "application_status" }),
  insert("reviews", DEMO_REVIEWS.map(reviewToRow), { status: "review_status" }),
  insert("posts", DEMO_POSTS.map(postToRow), { board: "board_key" }),
  insert("post_likes", DEMO_POSTS.flatMap((p) => p.likes.map((m) => ({ post_id: demoUuid(p.id), profile_id: demoUuid(m) })))),
  insert("comments", DEMO_COMMENTS.map(commentToRow)),
  insert("comment_likes", DEMO_COMMENTS.flatMap((c) => c.likes.map((m) => ({ comment_id: demoUuid(c.id), profile_id: demoUuid(m) })))),
  insert("point_logs", DEMO_POINTS.map(pointToRow)),
  "-- 생활력: 트리거(apply_trust_event)가 profiles.trust_score 를 함께 올린다",
  insert("trust_events", DEMO_TRUST_EVENTS.map(trustEventToRow)),
  insert("journal_entries", DEMO_JOURNALS.map(journalToRow)),
  insert("journal_goals", Object.entries(DEMO_JOURNAL_GOALS).flatMap(([m, goals]) => Object.entries(goals).map(([month, days]) => ({ profile_id: demoUuid(m), month, target_days: days })))),
  insert("invite_codes", DEMO_INVITE_CODES.map((c) => ({ code: c.code, owner_id: demoUuid(c.ownerId), created_at: c.createdAt }))),
  insert("invite_uses", DEMO_INVITE_CODES.flatMap((c) => c.uses.map((u) => ({ code: c.code, profile_id: demoUuid(u.userId), created_at: u.usedAt })))),
  insert("notices", DEMO_NOTICES.map((n) => ({ id: demoUuid(n.id), title: n.title, body: n.body, pinned: n.pinned, created_at: n.createdAt }))),
  insert("moderation_words", DEMO_MODERATION_WORDS.map((w) => ({ id: demoUuid(w.id), word: w.word, action: w.action, created_at: w.createdAt }))),
  "-- 광고주 평가 시드(DEMO_BRAND_RATINGS)는 실제 응모가 없는 예시 행이라 넣지 않는다 (application_id FK)",
  "commit;",
  "",
];
writeFileSync(new URL("../supabase/seed.sql", import.meta.url), out.filter((x) => x !== "").join("\n") + "\n");
console.log("supabase/seed.sql", out.length, "블록");
