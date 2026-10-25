#!/usr/bin/env node
// Supabase 연결 점검: apps/web/.env.local 의 URL·키로 notices 테이블을 읽어본다.  사용: node scripts/supabase-check.mjs
import fs from "node:fs"; import path from "node:path"; import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const env = Object.fromEntries(fs.readFileSync(path.join(root, "apps/web/.env.local"), "utf8").split("\n").filter((l) => l.includes("=") && !l.startsWith("#")).map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }));
const url = env.NEXT_PUBLIC_SUPABASE_URL, key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) { console.error("apps/web/.env.local 에 NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY 가 없습니다"); process.exit(1); }
const sb = createClient(url, key);
const { data, error, count } = await sb.from("notices").select("id", { count: "exact", head: true });
if (error) { console.error("연결 실패:", error.message); process.exit(1); }
console.log(`연결 OK — ${url} · notices ${count ?? 0}건 (anon 키, RLS 적용)`);
