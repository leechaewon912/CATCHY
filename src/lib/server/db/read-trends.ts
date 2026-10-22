import "server-only";

import {
  isPublishableTrend,
  type Category,
  type SourceType,
  type Trend,
  type TrendSource,
} from "@/lib/mock-data";
import { buildQuizFromExpressions } from "@/lib/server/build-quiz";
import { getSupabaseServerClient } from "@/lib/server/supabase-client";

type TrendRow = {
  id: string;
  title: string;
  category: Category;
  summary: string;
  english_summary: string;
  korean_summary: string;
  why_trending: string;
  status: Trend["status"];
  generated_at: string;
  reviewed_at: string | null;
  // Added for the GPT self-generated editorial pipeline — absent
  // (undefined) on rows read before these columns existed, defaulted
  // ('rss') or nullable on new ones. See trend-validation.ts for how
  // content_origin is used.
  content_origin?: Trend["contentOrigin"] | null;
  english_title?: string | null;
};

type TrendSourceRow = {
  trend_id: string;
  source_name: string;
  source_type: SourceType;
  original_title: string;
  original_url: string;
  published_at: string;
  usage_note: string | null;
  sort_order: number;
};

type ExpressionRow = {
  trend_id: string;
  phrase: string;
  meaning_ko: string;
  nuance: string;
  usage_situation: string;
  example_en: string;
  example_ko: string;
  // Added after this table was first created — absent (undefined) on
  // rows read before the column existed, not just null on new ones.
  comparison_phrase?: string | null;
  comparison_nuance_diff?: string | null;
  sort_order: number;
};

const TREND_COLUMNS =
  "id, title, category, summary, english_summary, korean_summary, why_trending, status, generated_at, reviewed_at, content_origin, english_title";

function bySortOrder<T extends { sort_order: number }>(rows: T[]): T[] {
  return [...rows].sort((a, b) => a.sort_order - b.sort_order);
}

function mapTrend(row: TrendRow, sourceRows: TrendSourceRow[], expressionRows: ExpressionRow[]): Trend {
  const sources: TrendSource[] = bySortOrder(sourceRows).map((source) => ({
    sourceName: source.source_name,
    sourceType: source.source_type,
    originalTitle: source.original_title,
    originalUrl: source.original_url,
    publishedAt: source.published_at,
    usageNote: source.usage_note ?? "",
  }));

  const expressions = bySortOrder(expressionRows).map((expression) => ({
    phrase: expression.phrase,
    meaningKo: expression.meaning_ko,
    nuance: expression.nuance,
    usageSituation: expression.usage_situation,
    exampleEn: expression.example_en,
    exampleKo: expression.example_ko,
    comparison:
      expression.comparison_phrase && expression.comparison_nuance_diff
        ? {
            phrase: expression.comparison_phrase,
            nuanceDiff: expression.comparison_nuance_diff,
          }
        : undefined,
  }));

  return {
    id: row.id,
    title: row.title,
    englishTitle: row.english_title ?? undefined,
    category: row.category,
    summary: row.summary,
    englishSummary: row.english_summary,
    koreanSummary: row.korean_summary,
    // RSS 콘텐츠는 why_trending이 항상 non-empty — GPT 에디토리얼처럼
    // 빈 문자열로 저장된 경우만 undefined로 바꿔 상세 페이지가 그 섹션을
    // 생략하게 한다(whyTrending이 optional인 이유와 동일한 처리).
    whyTrending: row.why_trending || undefined,
    sources,
    expressions,
    quiz: buildQuizFromExpressions(expressions),
    status: row.status,
    generatedAt: row.generated_at,
    reviewedAt: row.reviewed_at,
    contentOrigin: row.content_origin ?? undefined,
  };
}

async function fetchRelations(
  client: ReturnType<typeof getSupabaseServerClient>,
  trendIds: string[],
): Promise<{ sourceRows: TrendSourceRow[]; expressionRows: ExpressionRow[]; error: string | null }> {
  if (!client) {
    return { sourceRows: [], expressionRows: [], error: null };
  }

  const [sourcesResult, expressionsResult] = await Promise.all([
    client.from("trend_sources").select("*").in("trend_id", trendIds).returns<TrendSourceRow[]>(),
    client.from("expressions").select("*").in("trend_id", trendIds).returns<ExpressionRow[]>(),
  ]);

  if (sourcesResult.error || expressionsResult.error) {
    return {
      sourceRows: [],
      expressionRows: [],
      error: sourcesResult.error?.message ?? expressionsResult.error?.message ?? "unknown error",
    };
  }

  return { sourceRows: sourcesResult.data ?? [], expressionRows: expressionsResult.data ?? [], error: null };
}

// Returns null when there's no usable DB data (missing env vars, query
// error, or no published rows) so callers fall back to mock-data.
// isPublishableTrend() is re-applied here as a final gate, same as
// src/lib/mock-data.ts's getPublishedTrends() — status alone isn't
// trusted (see src/lib/trend-validation.ts).
export async function getPublishedTrendsFromDb(): Promise<Trend[] | null> {
  const client = getSupabaseServerClient();
  if (!client) return null;

  const { data: trendRows, error: trendsError } = await client
    .from("trends")
    .select(TREND_COLUMNS)
    .eq("status", "published")
    // RSS → GPT 자체 생성 전환 기간 한정 조치: 실데이터 모드(MOCK_MODE=
    // false)에서는 content_origin='gpt_editorial' 콘텐츠만 노출하고,
    // 기존 91개 RSS 트렌드는 (삭제하지 않고) 노출만 숨긴다. RSS 쪽 cron이
    // 중단된 뒤에도 이 테이블에는 과거 RSS 행이 그대로 남아있으므로, 이
    // 필터가 없으면 둘이 섞여서 노출된다.
    .eq("content_origin", "gpt_editorial")
    .order("generated_at", { ascending: false })
    .returns<TrendRow[]>();

  if (trendsError) {
    console.error("[supabase] failed to load trends:", trendsError.message);
    return null;
  }
  if (!trendRows || trendRows.length === 0) return null;

  const trendIds = trendRows.map((row) => row.id);
  const { sourceRows, expressionRows, error } = await fetchRelations(client, trendIds);
  if (error) {
    console.error("[supabase] failed to load trend relations:", error);
    return null;
  }

  const trends = trendRows
    .map((row) =>
      mapTrend(
        row,
        sourceRows.filter((source) => source.trend_id === row.id),
        expressionRows.filter((expression) => expression.trend_id === row.id),
      ),
    )
    .filter(isPublishableTrend);

  return trends.length > 0 ? trends : null;
}

export async function getTrendByIdFromDb(id: string): Promise<Trend | null> {
  const client = getSupabaseServerClient();
  if (!client) return null;

  const { data: row, error: trendError } = await client
    .from("trends")
    .select(TREND_COLUMNS)
    .eq("id", id)
    .eq("status", "published")
    // Same RSS-hiding filter as getPublishedTrendsFromDb() above — a
    // direct /trend/<rss-id> visit shouldn't surface old RSS content
    // either once MOCK_MODE=false.
    .eq("content_origin", "gpt_editorial")
    .maybeSingle()
    .returns<TrendRow>();

  if (trendError) {
    console.error("[supabase] failed to load trend:", trendError.message);
    return null;
  }
  if (!row) return null;

  const { sourceRows, expressionRows, error } = await fetchRelations(client, [id]);
  if (error) {
    console.error("[supabase] failed to load trend relations:", error);
    return null;
  }

  const trend = mapTrend(row, sourceRows, expressionRows);
  return isPublishableTrend(trend) ? trend : null;
}
