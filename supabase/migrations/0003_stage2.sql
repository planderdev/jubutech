-- 주부테크 2단계 고도화 스키마 초안 (2026-11-05). 0001·0002 위에 적용한다. **아직 적용하지 않았다** — 1단계 W8(Supabase 연결) 때 함께 검토·적용.
-- 코드 쪽 대응: packages/shared/src/{community,moderation,journal,brand-rating,advertiser,notifications,notices}.ts

-- ───────── W1·W5 커뮤니티 · 운영 도구 ─────────
alter table public.posts
  add column if not exists topic text,                     -- PHP 주제(수익인증 등). board 와 함께 쓰다 정리
  add column if not exists moderation_note text,            -- 자동 판단 사유 (운영자·작성자만)
  add column if not exists source_journal_id uuid;          -- 복기 공유 원본 (금액은 공개하지 않는다)
-- posts.status 는 text: published | review | hidden | deleted

create table public.moderation_words (
  id uuid primary key default gen_random_uuid(),
  word text not null unique,
  action text not null check (action in ('hide','review')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.moderation_words enable row level security;
create policy "moderation_words: public read" on public.moderation_words for select using (true);  -- 앱이 글쓰기 때 먼저 판단
create policy "moderation_words: admin all" on public.moderation_words for all using (public.is_admin()) with check (public.is_admin());

-- 한 사람이 같은 대상을 두 번 신고하지 못하게 (자동 숨김은 서로 다른 신고자 수로 센다)
create unique index if not exists reports_once_per_reporter on public.reports(target_type, target_id, reporter_id);

alter table public.comments add column if not exists status text not null default 'published';
create table public.comment_likes (
  comment_id uuid not null references public.comments(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (comment_id, profile_id)
);
alter table public.comment_likes enable row level security;
create policy "comment_likes: public read" on public.comment_likes for select using (true);
create policy "comment_likes: own write" on public.comment_likes for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

-- ───────── W3 매매일지 (PHP journals 모양. 0001 trades 는 웹 데모용으로 남겨 두고 연결 때 하나로 정리) ─────────
create table public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  trade_date date not null,
  market text not null default 'KR',
  symbol text, stock_name text,
  side text not null check (side in ('buy','sell')),
  unit_price numeric not null default 0, quantity numeric not null default 0, fee numeric not null default 0, tax numeric not null default 0,
  reason text, reflection text, emotion text,
  checklist_template_version int not null default 1,
  checklist_answers jsonb not null default '{}'::jsonb,
  trend_checks jsonb not null default '{}'::jsonb,
  target_price numeric not null default 0, stop_loss_price numeric not null default 0,
  support_note text, resistance_note text, sell_review text, intraday text, volume_note text, index_note text,
  draft_status text not null default 'complete' check (draft_status in ('complete','draft')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index journal_entries_owner_idx on public.journal_entries(profile_id, trade_date desc);
alter table public.journal_entries enable row level security;
create policy "journal_entries: owner only" on public.journal_entries for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);  -- 나만 본다

create table public.journal_goals (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  month text not null,   -- YYYY-MM
  target_days int not null check (target_days between 1 and 31),
  primary key (profile_id, month)
);
alter table public.journal_goals enable row level security;
create policy "journal_goals: owner only" on public.journal_goals for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

-- ───────── W6 광고주 셀프 등록 ─────────
alter table public.campaigns add column if not exists selection_mode text not null default 'self' check (selection_mode in ('self','agency'));
-- 후기 검수: 0002 는 광고주 읽기만 — 2-2 에서 쓰기를 연다 (검토 대기·보완 요청 건을 결과로 바꾼다)
create policy "reviews: campaign owner decide" on public.reviews for update
  using (auth.uid() = (select c.advertiser_id from public.applications a join public.campaigns c on c.id = a.campaign_id where a.id = application_id))
  with check (status in ('pending','revision','approved','rejected'));
-- 주의: 위 정책은 컬럼 제한이 없다. 연결 때 후기 본문은 못 바꾸도록 RPC(decide_review)로 좁힌다. 승인 시 리워드·생활력 기록도 그 RPC 에서 한 번에 한다.

-- ───────── W7 상호 평가 ─────────
create table public.brand_ratings (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null unique references public.applications(id) on delete cascade,
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  stars smallint not null check (stars between 1 and 5),
  shipped_on_time text not null check (shipped_on_time in ('yes','no','na')),
  matched_guide text not null check (matched_guide in ('yes','no')),
  comment text,
  status text not null default 'visible' check (status in ('visible','hidden')),
  created_at timestamptz not null default now()
);
alter table public.brand_ratings enable row level security;
-- 개별 행은 작성자·운영자만. 광고주·다른 회원은 아래 뷰(건수 기준 넘은 통계)로만 본다
create policy "brand_ratings: owner read" on public.brand_ratings for select using (auth.uid() = profile_id);
create policy "brand_ratings: owner insert" on public.brand_ratings for insert with check (auth.uid() = profile_id and auth.uid() = (select a.profile_id from public.applications a where a.id = application_id));
create policy "brand_ratings: admin all" on public.brand_ratings for all using (public.is_admin()) with check (public.is_admin());

create view public.brand_rating_stats as
  select c.advertiser_id, c.brand, count(*) as rating_count,
    round(avg(r.stars)::numeric, 1) as average,
    round(100.0 * count(*) filter (where r.matched_guide = 'yes') / count(*)) as match_rate,
    round(100.0 * count(*) filter (where r.shipped_on_time = 'yes') / nullif(count(*) filter (where r.shipped_on_time <> 'na'), 0)) as on_time_rate
  from public.brand_ratings r join public.campaigns c on c.id = r.campaign_id
  where r.status = 'visible'
  group by c.advertiser_id, c.brand
  having count(*) >= coalesce((select (value)::int from public.app_settings where key = 'rating.minVisible'), 3);

-- ───────── W10 알림 ─────────
create table public.push_tokens (
  token text primary key,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  platform text not null,
  created_at timestamptz not null default now()
);
alter table public.push_tokens enable row level security;
create policy "push_tokens: owner only" on public.push_tokens for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

create table public.notify_prefs (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  selection boolean not null default true,
  review boolean not null default true,
  subsidy boolean not null default true
);
alter table public.notify_prefs enable row level security;
create policy "notify_prefs: owner only" on public.notify_prefs for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

-- ───────── W11 지원금 맞춤 알림 ─────────
-- 세 질문의 답(자녀 연령대·관심 분야)은 기기에만 둔다. 서버 테이블을 만들려면 개인정보처리방침을 먼저 고친다.
alter table public.info_articles
  add column if not exists apply_end_at timestamptz,
  add column if not exists child_ages text[] not null default '{}',
  add column if not exists region text;

-- ───────── W14 문의 ─────────
create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  category text not null check (category in ('campaign','reward','account','partner','etc')),
  body text not null,
  answer text,
  status text not null default 'open' check (status in ('open','answered')),
  created_at timestamptz not null default now()
);
alter table public.inquiries enable row level security;
create policy "inquiries: owner" on public.inquiries for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);
create policy "inquiries: admin all" on public.inquiries for all using (public.is_admin()) with check (public.is_admin());

-- ───────── 계정 삭제 RPC (W9 출시 점검에서 앱이 부르는 이름) ─────────
-- 전제: profiles 는 auth.users 를 on delete cascade 로 참조한다. 연결 때 출금 기록 보존(세무 5년)과 충돌하는지 확인한다.
create or replace function public.delete_my_account() returns void
language plpgsql security definer set search_path = public, auth as $$
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  delete from auth.users where id = auth.uid();
end;
$$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

-- ───────── 운영 규칙 초안값 (rules.ts DEFAULT_RULES 와 같아야 한다) ─────────
insert into public.app_settings (key, value) values
  ('wallet.expireMonths',          '12'),
  ('trust.baseTemperature',        '36.5'),
  ('trust.perPoint',               '0.1'),
  ('trust.gradeGood',              '20'),
  ('trust.gradeExcellent',         '50'),
  ('trust.highValueAmount',        '100000'),
  ('trust.highValueGrade',         '"good"'),
  ('moderation.blockPromoLinks',   'true'),
  ('moderation.stockGuard',        'true'),
  ('rating.minVisible',            '3'),
  ('advertiser.baseFee',           '50000'),
  ('advertiser.agencyFee',         '100000'),
  ('assist.provider',              '"stub"'),
  ('referral.enabled',             'false'),
  ('notify.selection',             'true'),
  ('notify.review',                'true'),
  ('notify.subsidy',               'true'),
  ('notify.subsidyDaysBefore',     '7')
on conflict (key) do nothing;
