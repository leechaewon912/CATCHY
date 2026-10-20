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
export const CATEGORY_DISPLAY_LABELS: Record<Category, string> = {
  "음악": "음악",
  "영화·시리즈": "영화·시리즈",
  "밈·인터넷": "소셜·트렌드",
  "라이프스타일": "라이프스타일",
  "테크·게임": "테크·크리에이티브",
  "스포츠": "스포츠",
  "글로벌 이슈": "문화",
};
