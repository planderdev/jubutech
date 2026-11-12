/**
 * DB 왕복 검증 — `npm run db:check`. 임베디드 Postgres(PGlite)에 0001~0004 + seed.sql 을 적용하고,
 * 행을 db-map.ts 로 다시 앱 객체로 바꿔 DEMO_* 와 같은지 본다. Supabase 없이 스키마·시드·변환을 함께 확인하는 용도.
 * auth 스키마는 흉내만 낸다(RLS 정책은 만들어지기만 하고 검사하지 않는다).
 */
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import * as shm from "../packages/shared/src/index";
const sh: any = (shm as any).default ?? shm;
const base = new URL("../supabase/", import.meta.url).pathname;
const db = new PGlite();
await db.exec(`create schema auth; create table auth.users(id uuid primary key default gen_random_uuid(), email text, raw_user_meta_data jsonb); create function auth.uid() returns uuid language sql as 'select null::uuid'; create role anon; create role authenticated;`);
for (const f of ["migrations/0001_init.sql", "migrations/0002_stage1.sql", "migrations/0003_stage2.sql", "migrations/0004_app_model.sql", "seed.sql"]) {
  try { await db.exec(readFileSync(base + f, "utf8").replace(/create extension[^;]*;/g, "")); console.log("ok", f); }
  catch (e: any) { console.log("FAIL", f, e.message); process.exit(1); }
}
// pglite 는 jsonb·배열을 JS 값으로, timestamptz 를 Date 로 준다 → 문자열로 맞춰 변환 함수에 넣는다
const norm = (row: any) => Object.fromEntries(Object.entries(row).map(([k, v]) => [k, v instanceof Date ? v.toISOString() : v]));
const q = async (sql: string) => (await db.query(sql)).rows.map(norm) as any[];
let fails = 0;
const canon = (o: any): any => Array.isArray(o) ? o.map(canon) : o && typeof o === "object" ? Object.fromEntries(Object.keys(o).filter((k) => o[k] !== undefined).sort().map((k) => [k, canon(o[k])])) : o;
const strip = (o: any) => canon(JSON.parse(JSON.stringify(o)));
const same = (name: string, got: any[], want: any[], key = "id") => {
  const g = [...got].sort((a, b) => String(a[key]).localeCompare(String(b[key])));
  const w = [...want].sort((a, b) => String(a[key]).localeCompare(String(b[key])));
  const bad = w.filter((x, i) => JSON.stringify(strip(x)) !== JSON.stringify(strip(g[i])));
  if (g.length !== w.length || bad.length) { fails++; console.log("FAIL", name, g.length, w.length); if (bad[0]) { const i = w.indexOf(bad[0]); for (const k of Object.keys(bad[0])) if (JSON.stringify(canon(bad[0][k])) !== JSON.stringify(canon(g[i]?.[k]))) console.log("   ", k, JSON.stringify(bad[0][k])?.slice(0, 120), "≠", JSON.stringify(g[i]?.[k])?.slice(0, 120)); } }
  else console.log("ok", name, g.length);
};
const date10 = (s: string) => (s.length === 10 ? `${s}T00:00:00+09:00` : s);
same("members", (await q("select * from profiles where role = 'member'")).map(sh.rowToMember), sh.DEMO_MEMBERS);
same("campaigns", (await q("select * from campaigns")).map(sh.rowToCampaign), sh.DEMO_CAMPAIGNS);
same("applications", (await q("select * from applications")).map(sh.rowToApplication), sh.DEMO_APPLICATIONS);
same("reviews", (await q("select * from reviews")).map(sh.rowToReview), sh.DEMO_REVIEWS);
same("articles", (await q("select * from info_articles")).map(sh.rowToArticle), sh.DEMO_ARTICLES);
const likes = await q("select post_id, profile_id from post_likes");
same("posts", (await q("select * from posts")).map((r) => sh.rowToPost(r, likes.filter((l) => l.post_id === r.id).map((l) => l.profile_id))), sh.DEMO_POSTS.map((p) => ({ ...p, likes: [...p.likes].sort() })).map((p) => p), "id");
const clikes = await q("select comment_id, profile_id from comment_likes");
same("comments", (await q("select * from comments")).map((r) => sh.rowToComment(r, clikes.filter((l) => l.comment_id === r.id).map((l) => l.profile_id))), sh.DEMO_COMMENTS);
same("points", (await q("select * from point_logs")).map(sh.rowToPoint), sh.DEMO_POINTS.map((p) => ({ ...p, createdAt: date10(p.createdAt) })));
same("trust", (await q("select * from trust_events")).map(sh.rowToTrustEvent), sh.DEMO_TRUST_EVENTS.map((e) => ({ ...e, createdAt: date10(e.createdAt) })));
same("journals", (await q("select * from journal_entries")).map(sh.rowToJournal), sh.DEMO_JOURNALS);
const ts = await q("select nickname, trust_score, points from profiles where role = 'member' order by nickname");
console.log("trust_score", JSON.stringify(ts));
const scores = sh.trustScores(sh.DEMO_TRUST_EVENTS);
for (const m of sh.DEMO_MEMBERS) { const row = ts.find((r) => r.nickname === m.nickname); if ((row?.trust_score ?? 0) !== (scores[m.id] ?? 0)) { fails++; console.log("FAIL trust_score", m.id); } }
console.log("signup bonus logs left:", (await q("select count(*)::int n from point_logs where reason = '가입 축하 포인트'"))[0].n);
console.log("uuid roundtrip:", ["cp1", "a7", "i12", "JUBU"].map((x) => sh.fromDemoUuid(sh.demoUuid(x)) === x).every(Boolean));
console.log("fails:", fails);
process.exit(fails ? 1 : 0);
