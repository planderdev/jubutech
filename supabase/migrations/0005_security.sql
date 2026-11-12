-- 보안 점검(Supabase advisors, 2026-11-12) 반영. 0001~0004 위에 적용한다.

-- 1) 트리거 전용 함수는 API(rpc)로 직접 부르지 못하게 한다. 트리거는 실행 권한과 상관없이 계속 동작한다.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.apply_trust_event() from public, anon, authenticated;
-- is_admin() 은 RLS 정책이 호출하므로 anon·authenticated 실행 권한을 남긴다 (호출자 자신의 관리자 여부만 돌려준다).

-- 2) 광고주 평가 통계: SECURITY DEFINER 뷰 대신 같은 결과를 돌려주는 함수로 바꾼다.
--    개별 평가 행은 RLS 로 막고, 건수 기준(rating.minVisible)을 넘은 집계만 누구나 본다.
drop view if exists public.brand_rating_stats;
create or replace function public.brand_rating_stats()
returns table (advertiser_id uuid, brand text, rating_count bigint, average numeric, match_rate numeric, on_time_rate numeric)
language sql stable security definer set search_path = public as $$
  select c.advertiser_id, c.brand, count(*) as rating_count,
    round(avg(r.stars)::numeric, 1) as average,
    round(100.0 * count(*) filter (where r.matched_guide = 'yes') / count(*)) as match_rate,
    round(100.0 * count(*) filter (where r.shipped_on_time = 'yes') / nullif(count(*) filter (where r.shipped_on_time <> 'na'), 0)) as on_time_rate
  from public.brand_ratings r join public.campaigns c on c.id = r.campaign_id
  where r.status = 'visible'
  group by c.advertiser_id, c.brand
  having count(*) >= coalesce((select (value)::int from public.app_settings where key = 'rating.minVisible'), 3);
$$;
grant execute on function public.brand_rating_stats() to anon, authenticated;
