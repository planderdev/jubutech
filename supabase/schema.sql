-- 주부테크 (JubuTech) — Supabase 스키마 초안 v0.1 (2026-09-16)
-- 현재 앱은 src/lib/store.ts(localStorage 목업)로 동작한다. 백엔드 연결 시 이 스키마를 기준으로
-- store.ts의 액션을 Supabase 호출로 교체한다. (루비 체험단 스키마 + 플랜더웍스 일정 스키마 참고)

create extension if not exists pgcrypto;

-- 역할
create type public.user_role as enum ('member', 'advertiser', 'admin');
create type public.board_key as enum ('income','sidejob','subsidy','stock','groupbuy','free','region','qna');
create type public.info_category as enum ('subsidy','policy','saving','card','finance','parenting','pet','sidejob');
create type public.channel_type as enum ('instagram','blog','youtube','tiktok','receipt','survey');
create type public.campaign_status as enum ('draft','pending','open','closed','selected','ongoing','done','cancelled');
create type public.application_status as enum ('pending','selected','rejected','submitted','completed','cancelled');
create type public.market as enum ('KOSPI','KOSDAQ','ETF','US');
create type public.trend as enum ('up','down');

-- 프로필 (auth.users 1:1)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'member',
  name text, nickname text not null, region text,
  tags text[] not null default '{}',
  intro text, brand text,
  points int not null default 0,
  level int not null default 1,
  badges text[] not null default '{}',
  created_at timestamptz not null default now()
);
create table public.profile_channels (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  type channel_type not null, url text not null, followers int
);

-- 돈되는 정보
create table public.info_articles (
  id uuid primary key default gen_random_uuid(),
  category info_category not null,
  title text not null, summary text not null, body text[] not null default '{}',
  source text not null, source_date date not null, deadline date,
  reward_points int not null default 0,
  amount text, target text, how_to text[],
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);
create table public.info_saves (
  profile_id uuid references public.profiles(id) on delete cascade,
  article_id uuid references public.info_articles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (profile_id, article_id)
);

-- 커뮤니티
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  board board_key not null,
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null, body text not null,
  tags text[] not null default '{}',
  region text, thumb_url text,
  income int, sponsored boolean not null default false,
  views int not null default 0,
  status text not null default 'published',
  created_at timestamptz not null default now()
);
create index posts_board_created_idx on public.posts(board, created_at desc);
create table public.post_likes (
  post_id uuid references public.posts(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete cascade,
  primary key (post_id, profile_id)
);
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  parent_id uuid references public.comments(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);
create table public.bookmarks (
  profile_id uuid references public.profiles(id) on delete cascade,
  post_id uuid references public.posts(id) on delete cascade,
  primary key (profile_id, post_id)
);

-- 체험단 캠페인 (루비 campaigns + 하위 테이블 단순화)
create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  advertiser_id uuid not null references public.profiles(id) on delete cascade,
  brand text not null, title text not null,
  category text not null,
  channels channel_type[] not null default '{}',
  thumb_icon text, thumb_url text,
  reward_type text not null check (reward_type in ('product','point','cash')),
  reward_value int not null default 0, reward_desc text not null,
  recruit_count int not null,
  recruit_start date not null, recruit_end date not null,
  announce_date date not null, mission_start date, mission_end date,
  missions text[] not null default '{}', requirements text[] not null default '{}', keywords text[] not null default '{}',
  region text,
  status campaign_status not null default 'draft',
  review_note text, reviewed_at timestamptz,
  views int not null default 0,
  created_at timestamptz not null default now()
);
create index campaigns_status_idx on public.campaigns(status, recruit_end);
create table public.applications (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  channel channel_type not null, channel_url text, message text,
  status application_status not null default 'pending',
  submission_url text, submission_note text, feedback text,
  selected_at timestamptz, submitted_at timestamptz, completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (campaign_id, profile_id)
);

-- 매매일지 (트레이딩 매매 체크리스트)
create table public.trades (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  name text not null, market market not null default 'KOSPI',
  buy_date date not null, sell_date date,
  buy_price numeric not null, sell_price numeric, qty numeric not null,
  target_price numeric, stop_price numeric, support text, resistance text,
  -- 1. 진입 전 필수 체크리스트 6항목
  chk_ma boolean not null default false, chk_ichimoku boolean not null default false, chk_bollinger boolean not null default false,
  chk_supply boolean not null default false, chk_entry boolean not null default false, chk_market boolean not null default false,
  ichimoku_pos text check (ichimoku_pos in ('above','below')), bollinger_pos text check (bollinger_pos in ('upper','lower')),
  -- 2. 이평선별 추세 (5/10/20/60/120/224/448)
  ma_trend jsonb not null default '{}'::jsonb,
  -- 4. 매수·매도 근거
  buy_reasons text[] not null default '{}',
  sell_intraday text, sell_volume text, sell_index text,
  memo text, emotion text check (emotion in ('calm','fomo','fear','greedy')),
  created_at timestamptz not null default now()
);
create index trades_profile_date_idx on public.trades(profile_id, buy_date desc);

-- 포인트 / 알림
create table public.point_logs (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  amount int not null, reason text not null,
  ref_type text, ref_id uuid,
  created_at timestamptz not null default now()
);
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  title text not null, body text, href text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- RLS 골격 (세부 정책은 연결 시 확정)
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.campaigns enable row level security;
alter table public.applications enable row level security;
alter table public.trades enable row level security;
alter table public.point_logs enable row level security;
alter table public.notifications enable row level security;

create policy "trades: owner only" on public.trades for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);
create policy "posts: public read" on public.posts for select using (status = 'published');
create policy "posts: author write" on public.posts for insert with check (auth.uid() = author_id);
create policy "campaigns: public read when live" on public.campaigns for select using (status in ('open','closed','selected','ongoing','done') or auth.uid() = advertiser_id);
create policy "applications: own or campaign owner" on public.applications for select using (auth.uid() = profile_id or auth.uid() = (select advertiser_id from public.campaigns c where c.id = campaign_id));
create policy "applications: apply self" on public.applications for insert with check (auth.uid() = profile_id);
create policy "notifications: own" on public.notifications for all using (auth.uid() = profile_id);
create policy "point_logs: own read" on public.point_logs for select using (auth.uid() = profile_id);
