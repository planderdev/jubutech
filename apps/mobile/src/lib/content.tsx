import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { DEMO_ARTICLES, DEMO_CATEGORIES, DEMO_NOW, demoHomeCategories, demoRegionalArticles, demoVisibleArticles, rowToArticle, type ArticleRow, type DemoArticle, type DemoCategory } from "@jubutech/shared";
import { supabase, supabaseEnabled } from "@/lib/supabase";

/**
 * 재테크 정보 콘텐츠 (글·카테고리). Supabase 키가 있으면 `info_articles`·`info_categories` 를 읽고,
 * 없거나 읽기에 실패하면 데모 픽스처(PHP `fixtures.php` 와 같은 값)를 그대로 쓴다.
 * 공개 여부 판단 기준 시각: DB 에서 읽은 글은 지금 시각(운영자가 오늘 게시한 글이 바로 보이게), 데모는 DEMO_NOW.
 */
export type ContentSource = "demo" | "supabase";

interface ContentState {
  source: ContentSource;
  /** 게시 중인 글 (PHP visibleArticle) */
  articles: DemoArticle[];
  /** 사용 중인 카테고리 전체 (order 순) */
  categories: DemoCategory[];
  /** 홈 숏컷 순서 (기본 카테고리 우선) */
  homeCategories: DemoCategory[];
  regionalArticles: (region: string) => DemoArticle[];
  now: string;
}

const ContentContext = createContext<ContentState | null>(null);

function build(source: ContentSource, articles: DemoArticle[], categories: DemoCategory[]): ContentState {
  const now = source === "supabase" ? new Date().toISOString() : DEMO_NOW;
  const enabled = categories.filter((c) => c.enabled).sort((a, b) => a.order - b.order);
  return {
    source,
    now,
    articles: demoVisibleArticles(articles, now).sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt)),
    categories: enabled,
    homeCategories: demoHomeCategories(categories),
    regionalArticles: (region: string) => demoRegionalArticles(region, articles, now),
  };
}

type CategoryRow = { id: string; name: string; icon: string; sort: number; enabled: boolean };

export async function fetchContent(): Promise<{ articles: DemoArticle[]; categories: DemoCategory[] } | null> {
  if (!supabaseEnabled) return null;
  const [a, c] = await Promise.all([
    supabase.from("info_articles").select("*").eq("status", "published").order("published_at", { ascending: false }),
    supabase.from("info_categories").select("*").order("sort"),
  ]);
  if (a.error || c.error || !a.data || !c.data) return null;
  return {
    articles: a.data.map((r) => rowToArticle(r as unknown as ArticleRow)),
    categories: (c.data as CategoryRow[]).map((r) => ({ id: r.id, name: r.name, icon: r.icon, order: r.sort, enabled: r.enabled })),
  };
}

export function ContentProvider({ children }: { children: ReactNode }) {
  const [loaded, setLoaded] = useState<{ articles: DemoArticle[]; categories: DemoCategory[] } | null>(null);

  useEffect(() => {
    let alive = true;
    fetchContent()
      .then((r) => { if (alive && r && r.categories.length) setLoaded(r); })
      .catch(() => { /* 네트워크 실패 → 데모 콘텐츠 유지 */ });
    return () => { alive = false; };
  }, []);

  const value = useMemo(
    () => (loaded ? build("supabase", loaded.articles, loaded.categories) : build("demo", DEMO_ARTICLES, DEMO_CATEGORIES)),
    [loaded],
  );
  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent(): ContentState {
  const v = useContext(ContentContext);
  if (!v) throw new Error("useContent 는 ContentProvider 안에서만 쓴다");
  return v;
}
