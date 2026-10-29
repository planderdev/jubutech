-- 주부테크 1단계 (기획안 2026-10-30) 스키마 보강 — 2026-10-30 초안. 0001_init.sql 위에 적용한다.
-- 미션 카드 · 후기 검수(reviews) · 생활력(trust) · 지갑 내역 유형 · 초대 코드 · 대기자 · 운영 규칙(app_settings).
-- 데이터 시드(캠페인·회원 등)는 Supabase 프로젝트 연결 시 packages/shared/src/fixtures.ts 에서 생성한다 (W8).

-- ───────── 1-1 미션 카드 · 후기 검수 ─────────
alter table public.campaigns
  add column if not exists mission jsonb not null default '{}'::jsonb,          -- MissionCard {photoCount,minChars,requiredKeywords,hashtags,dueDays}
  add column if not exists benefit_value int not null default 0,                 -- 협찬 제품 가치(원) — 지갑 "받은 제품 가치"
  add column if not exists review_due_at timestamptz;                            -- 후기 제출 기한 (없으면 선정일 + mission.dueDays)

create type public.review_status as enum ('pending','revision','approved','rejected');

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null unique references public.applications(id) on delete cascade,
  url text, content text,
  photo_count int not null default 0,
  check_result jsonb,                                                            -- ReviewCheck {passed, items[], checkedAt}
  status review_status not null default 'pending',
  feedback text,
  rating smallint check (rating between 1 and 5),                                -- 광고주(또는 대행 관리자) 별점
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create index reviews_status_idx on public.reviews(status, submitted_at desc);

alter table public.reviews enable row level security;
-- 제출자: 자기 응모의 후기를 보고, 검토 대기·보완 요청 상태에서만 쓰고 고친다
create policy "reviews: owner read" on public.reviews for select
  using (auth.uid() = (select profile_id from public.applications a where a.id = application_id));
create policy "reviews: owner submit" on public.reviews for insert
  with check (auth.uid() = (select profile_id from public.applications a where a.id = application_id) and status = 'pending');
create policy "reviews: owner resubmit" on public.reviews for update
  using (auth.uid() = (select profile_id from public.applications a where a.id = application_id) and status in ('pending','revision'))
  with check (status = 'pending');
-- 캠페인 광고주: 읽기만 (검수 화면은 2단계 2-2 에서)
create policy "reviews: campaign owner read" on public.reviews for select
  using (auth.uid() = (select c.advertiser_id from public.applications a join public.campaigns c on c.id = a.campaign_id where a.id = application_id));
create policy "reviews: admin all" on public.reviews for all using (public.is_admin()) with check (public.is_admin());

-- ───────── 1-2 생활력 (신뢰도 지표) — 출시 초기엔 관리자만 본다 ─────────
alter table public.profiles add column if not exists trust_score int not null default 0;

create table public.trust_events (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('review_approved','review_rated','comment_liked','review_overdue','post_hidden','invite_bonus','manual')),
  delta int not null,
  ref_type text, ref_id uuid, note text,
  created_at timestamptz not null default now()
);
create index trust_events_profile_idx on public.trust_events(profile_id, created_at desc);

-- 이벤트가 쌓이면 프로필 점수에 반영
create or replace function public.apply_trust_event() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update public.profiles set trust_score = trust_score + new.delta where id = new.profile_id;
  return new;
end $$;
create trigger on_trust_event_insert after insert on public.trust_events for each row execute function public.apply_trust_event();

alter table public.trust_events enable row level security;
create policy "trust_events: admin all" on public.trust_events for all using (public.is_admin()) with check (public.is_admin());
-- 본인 열람은 app_settings 'trust.visibleToUsers' 가 true 일 때만 (앱에서 한 번 더 가린다)
create policy "trust_events: own read when visible" on public.trust_events for select
  using (auth.uid() = profile_id and coalesce((select (value)::boolean from public.app_settings where key = 'trust.visibleToUsers'), false));

-- ───────── 1-3 지갑 — 포인트 원장에 내역 유형 추가 (금액 단위: 원) ─────────
alter table public.point_logs
  add column if not exists kind text not null default 'event'
    check (kind in ('review','referral','event','product_value','withdraw','adjust'));
create index if not exists point_logs_profile_kind_idx on public.point_logs(profile_id, kind, created_at desc);

-- ───────── 2-3 초대 코드 · 랜딩 대기자 ─────────
create table public.invite_codes (
  code text primary key,
  owner_id uuid not null unique references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);
create table public.invite_uses (
  code text not null references public.invite_codes(code) on delete cascade,
  profile_id uuid primary key references public.profiles(id) on delete cascade,   -- 초대받은 사람은 코드 1개만
  created_at timestamptz not null default now()
);
alter table public.invite_codes enable row level security;
alter table public.invite_uses enable row level security;
create policy "invite_codes: owner read" on public.invite_codes for select using (auth.uid() = owner_id);
create policy "invite_codes: owner create" on public.invite_codes for insert with check (auth.uid() = owner_id);
create policy "invite_codes: admin all" on public.invite_codes for all using (public.is_admin()) with check (public.is_admin());
create policy "invite_uses: self use" on public.invite_uses for insert with check (auth.uid() = profile_id);
create policy "invite_uses: owner or self read" on public.invite_uses for select
  using (auth.uid() = profile_id or auth.uid() = (select owner_id from public.invite_codes i where i.code = invite_uses.code));
create policy "invite_uses: admin all" on public.invite_uses for all using (public.is_admin()) with check (public.is_admin());

create table public.waitlist (
  id uuid primary key default gen_random_uuid(),
  contact text not null,
  channel text not null check (channel in ('email','phone')),
  source text,
  created_at timestamptz not null default now(),
  unique (contact)
);
alter table public.waitlist enable row level security;
create policy "waitlist: anyone can join" on public.waitlist for insert with check (true);   -- 랜딩 폼(비로그인)
create policy "waitlist: admin all" on public.waitlist for all using (public.is_admin()) with check (public.is_admin());

-- ───────── 운영 규칙 (미정 숫자) — 코드 기본값(packages/shared/src/rules.ts) 을 덮어쓴다 ─────────
create table public.app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null
);
alter table public.app_settings enable row level security;
create policy "app_settings: public read" on public.app_settings for select using (true);
create policy "app_settings: admin write" on public.app_settings for all using (public.is_admin()) with check (public.is_admin());

-- 초안값 시드 = DEFAULT_RULES (rules.ts 와 같아야 한다). 확정되면 관리자 설정 화면에서만 바꾼다.
insert into public.app_settings (key, value) values
  ('reward.reviewAmount',        '1000'),
  ('reward.dailyGoal',           '5000'),
  ('wallet.withdrawMin',         '10000'),
  ('wallet.withdrawOpenAt',      '"2026-12-01"'),
  ('mission.defaultPhotoCount',  '3'),
  ('mission.defaultMinChars',    '800'),
  ('mission.defaultDueDays',     '14'),
  ('mission.reminderDaysBefore', '[3, 0]'),
  ('penalty.lateBlockDays',      '30'),
  ('trust.name',                 '"생활력"'),
  ('trust.visibleToUsers',       'false'),
  ('trust.delta.reviewApproved', '10'),
  ('trust.delta.ratingPerStar',  '3'),
  ('trust.delta.commentLiked',   '1'),
  ('trust.delta.reviewOverdue',  '-20'),
  ('trust.delta.postHidden',     '-10'),
  ('trust.delta.inviteBonus',    '5'),
  ('invite.bonus',               '"priority"'),
  ('report.autoHideCount',       '3')
on conflict (key) do nothing;
