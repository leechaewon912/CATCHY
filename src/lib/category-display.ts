import type { Category } from "@/lib/mock-data";

// Presentation-only relabeling. The underlying Category values (the
// Trend.category field — stored in Supabase, in src/lib/mock-data.ts,
// and in src/lib/mock-data.culture-editorials.ts) are left exactly as
// they are on purpose: those same strings are load-bearing keys
// elsewhere — src/lib/trend-image.ts's thumbnail-prefix map, the GDELT/
// RSS collection pipeline's category keywords and source lists
// (src/lib/server/gdelt.ts, rss-sources.ts, generate-trend-draft.ts,
// collect-trends.ts), and every already-published Supabase row's
// `category` column. Renaming the canonical value would silently break
// thumbnail lookups and the collection pipeline, and would require a
// data migration for rows that already exist. This map only changes
// what's shown to the user in badges/filters/labels — category
// filtering, grouping, and analytics tracking (trackExpressionViewed,
// trackTrendClicked, etc.) all keep using the canonical Category value.
//
// "글로벌 이슈"("문화" 카테고리 통합) — 라이프스타일과 같은 라벨로
// 합쳤다. canonical 값 "글로벌 이슈" 자체는 RSS/GDELT 파이프라인과
// 기존 Supabase 행에 그대로 남아있고(바꾸지 않음), 화면에 "문화" 대신
// "라이프스타일"로만 보이게 된다. 같은 라벨을 공유하는 두 canonical
// 값(라이프스타일/글로벌 이슈)을 하나의 필터로 묶는 실제 매칭 로직은
// trend-feed.tsx의 categoryMatchesFilter()에 있다.
export const CATEGORY_DISPLAY_LABELS: Record<Category, string> = {
  "음악": "음악",
  "영화·시리즈": "영화·시리즈",
  "밈·인터넷": "소셜·트렌드",
  "라이프스타일": "라이프스타일",
  "테크·게임": "테크·크리에이티브",
  "스포츠": "스포츠",
  "글로벌 이슈": "라이프스타일",
};

// DESIGN.md's palette is 99% achromatic with a single reserved accent
// (never for general UI), so category badges no longer get a distinct
// color per category — every category renders with the same neutral
// "Tag Pill Badge" styling (see .badge-outline in globals.css).
//
// Lives here rather than mock-data.ts (where it used to be) because
// mock-data.ts is "server-only" — client components that render a
// category badge (TrendCard, ExpressionCard, QuizEntryClient) need this
// value too, and this module carries no such restriction (same reason
// CATEGORY_DISPLAY_LABELS already lives here instead of mock-data.ts).
export const CATEGORY_BADGE_CLASS = "badge-outline";
