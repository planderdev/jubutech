-- 앱 모델 칼럼 (2026-11-10 초안, 미적용). 0001 은 이전 웹 데모 모델이라 PHP 사양 앱(`fixtures.ts` DEMO_*)이 쓰는 칼럼이 빠져 있다.
-- 행 ↔ 앱 객체 변환은 packages/shared/src/db-map.ts, 시드는 supabase/seed.sql (scripts/gen-seed.ts 로 생성).

-- 체험단 — PHP campaigns 칼럼
alter table public.campaigns
  add column if not exists benefit text,                       -- "밀키트 3종 제공" (reward_desc 와 같은 값으로 채운다)
  add column if not exists channel_label text,                 -- PHP 채널 이름 그대로(인스타그램·블로그·유튜브·설문)
  add column if not exists description text,
  add column if not exists conditions text,
  add column if not exists questions text[] not null default '{}',
  add column if not exists image text,                          -- 앱 번들 이미지 키(PHP campaign-<image>.webp)
  add column if not exists shipping boolean not null default true,
  add column if not exists recruitment_start_at timestamptz,    -- 0001 의 date 칼럼보다 정확한 시각
  add column if not exists recruitment_end_at timestamptz,
  add column if not exists announcement_at timestamptz,
  add column if not exists exposure_start_at timestamptz,
  add column if not exists exposure_end_at timestamptz,
  add column if not exists publication_status text not null default 'published' check (publication_status in ('draft','published','hidden'));

-- 응모 — 답변·동의 기록·배송지
alter table public.applications
  add column if not exists answers jsonb not null default '{}'::jsonb,     -- {nickname, contact, channelUrl, reason, extra[]}
  add column if not exists consent jsonb not null default '{}'::jsonb,     -- {required, optional, version}
  add column if not exists shipping jsonb;                                 -- {recipient, address} (선정 후)
-- 앱 상태 ↔ DB 상태: applied=pending, selected=selected, not_selected=rejected, cancelled=cancelled

-- 정보 글 — PHP articles
alter table public.info_articles
  add column if not exists icon text,
  add column if not exists thumbnail text,
  add column if not exists body_blocks jsonb not null default '[]'::jsonb, -- [{type: paragraph|heading, text}]
  add column if not exists source_url text,
  add column if not exists published_at timestamptz,
  add column if not exists status text not null default 'published' check (status in ('published','hidden')),
  add column if not exists placement text not null default 'list' check (placement in ('featured','list'));

create table if not exists public.info_categories (
  id info_category primary key,
  name text not null,
  icon text not null,
  sort int not null,
  enabled boolean not null default true
);
alter table public.info_categories enable row level security;
create policy "info_categories: public read" on public.info_categories for select using (true);
create policy "info_categories: admin all" on public.info_categories for all using (public.is_admin()) with check (public.is_admin());

-- 회원 — 연락처 마스킹·상태
alter table public.profiles
  add column if not exists masked_contact text,
  add column if not exists account_status text not null default 'active' check (account_status in ('active','suspended'));
