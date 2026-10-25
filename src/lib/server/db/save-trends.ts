import "server-only";

import type { Category, ExpressionSeed, TrendSource } from "@/lib/mock-data";
import type { GenerateTrendDraftOutput } from "@/lib/server/generate-trend-draft";
import { getSupabaseServerClient } from "@/lib/server/supabase-client";

// cluster_key strings of published trends in this category generated
// since `sinceIso` — used by collect-trends.ts to skip republishing the
// same real-world story under a new id (the clusterKey an RSS run picks
// for one story isn't guaranteed stable run-to-run, since it's derived
// from whichever article happened to anchor the cluster — see
// clusterKeyFromTokens in collect-trends.ts). Returns [] (never throws)
// on any error or missing config, same fail-open posture as the rest of
// this file's read paths — a dedupe check that can't run shouldn't block
// collection.
export async function fetchRecentPublishedClusterKeys(
  category: Category,
  sinceIso: string,
): Promise<string[]> {
  const client = getSupabaseServerClient();
  if (!client) return [];

  const { data, error } = await client
    .from("trends")
    .select("cluster_key")
    .eq("category", category)
    .eq("status", "published")
    .gte("generated_at", sinceIso)
    .returns<Array<{ cluster_key: string | null }>>();

  if (error) {
    console.error(`[supabase] failed to load recent cluster keys for ${category}:`, error.message);
    return [];
  }

  return (data ?? []).flatMap((row) => (row.cluster_key ? [row.cluster_key] : []));
}

export type RecentEditorialContext = {
  existingTitles: { englishTitle: string; koreanTitle: string }[];
  existingPhrases: string[];
  existingOpenings: string[];
};

function firstSentenceOf(text: string): string {
  return text.trim().split(/(?<=[.!?])\s+/)[0]?.trim() ?? "";
}

// Recent GPT self-generated editorials' titles + expression phrases, used
// by the autonomous topic-selection step (generate-culture-editorial-with-
// llm.ts's generateDailyCultureEditorial) to steer new generations away
// from subjects/expressions already covered. Fail-open like
// fetchRecentPublishedClusterKeys above — a dedupe check that can't run
// shouldn't block generation, it just means weaker dedup for that run.
export async function fetchRecentEditorialContext(sinceDays = 90): Promise<RecentEditorialContext> {
  const client = getSupabaseServerClient();
  if (!client) return { existingTitles: [], existingPhrases: [], existingOpenings: [] };

  const sinceIso = new Date(Date.now() - sinceDays * 24 * 60 * 60 * 1000).toISOString();

  const { data: trendRows, error: trendsError } = await client
    .from("trends")
    .select("id, title, english_title, english_summary")
    .eq("content_origin", "gpt_editorial")
    .gte("generated_at", sinceIso)
    .returns<Array<{ id: string; title: string; english_title: string | null; english_summary: string }>>();

  if (trendsError) {
    console.error("[supabase] failed to load recent editorial titles:", trendsError.message);
    return { existingTitles: [], existingPhrases: [], existingOpenings: [] };
  }

  const rows = trendRows ?? [];
  const existingTitles = rows.map((row) => ({
    englishTitle: row.english_title ?? row.title,
    koreanTitle: row.title,
  }));
  const existingOpenings = rows.map((row) => firstSentenceOf(row.english_summary)).filter(Boolean);

  if (rows.length === 0) {
    return { existingTitles: [], existingPhrases: [], existingOpenings: [] };
  }

  const { data: expressionRows, error: expressionsError } = await client
    .from("expressions")
    .select("phrase")
    .in("trend_id", rows.map((row) => row.id))
    .returns<Array<{ phrase: string }>>();

  if (expressionsError) {
    console.error("[supabase] failed to load recent editorial phrases:", expressionsError.message);
    return { existingTitles, existingPhrases: [], existingOpenings };
  }

  return {
    existingTitles,
    existingPhrases: (expressionRows ?? []).map((row) => row.phrase),
    existingOpenings,
  };
}

export type UpsertTrendInput = {
  id: string;
  category: Category;
  clusterKey: string;
  status: "draft" | "published";
  content: GenerateTrendDraftOutput;
  sources: TrendSource[];
  // 영어 원문 제목 — RSS 콘텐츠는 없음(undefined), GPT 자체 생성 에디토리얼은
  // 항상 채움. 없으면 트렌드 카드/상세 페이지가 한국어 title을 메인
  // 제목으로 쓴다(trend.englishTitle의 기존 optional 처리와 동일).
  englishTitle?: string;
  // 생략하면 기존 RSS 파이프라인과 동일하게 "rss"로 저장된다.
  contentOrigin?: "rss" | "gpt_editorial";
};

// Upserts one trend + replaces its sources/expressions. The trend id is
// deterministic (category + normalized cluster key + KST date, built in
// collect-trends.ts), so running the collector again the same day
// updates the existing row instead of creating a duplicate — this is the
// "같은 날 같은 이슈 중복 저장 방지" behavior.
//
// trend_sources/expressions have no natural unique key of their own, so
// each run replaces them wholesale (delete-then-insert) rather than
// trying to diff individual rows.
export async function upsertTrend(input: UpsertTrendInput): Promise<void> {
  const client = getSupabaseServerClient();
  if (!client) {
    throw new Error("Supabase is not configured (missing NEXT_PUBLIC_SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY)");
  }

  const now = new Date().toISOString();

  const { error: trendError } = await client.from("trends").upsert(
    {
      id: input.id,
      title: input.content.title,
      english_title: input.englishTitle ?? null,
      category: input.category,
      summary: input.content.summary,
      english_summary: input.content.englishSummary,
      korean_summary: input.content.koreanSummary,
      why_trending: input.content.whyTrending,
      cluster_key: input.clusterKey,
      status: input.status,
      content_origin: input.contentOrigin ?? "rss",
      generated_at: now,
      reviewed_at: input.status === "published" ? now : null,
    },
    { onConflict: "id" },
  );
  if (trendError) {
    throw new Error(`failed to upsert trend ${input.id}: ${trendError.message}`);
  }

  const { error: deleteSourcesError } = await client
    .from("trend_sources")
    .delete()
    .eq("trend_id", input.id);
  if (deleteSourcesError) {
    throw new Error(`failed to clear old sources for ${input.id}: ${deleteSourcesError.message}`);
  }

  if (input.sources.length > 0) {
    const { error: insertSourcesError } = await client.from("trend_sources").insert(
      input.sources.map((source, index) => ({
        trend_id: input.id,
        source_name: source.sourceName,
        source_type: source.sourceType,
        original_title: source.originalTitle,
        original_url: source.originalUrl,
        published_at: source.publishedAt,
        usage_note: source.usageNote,
        sort_order: index,
      })),
    );
    if (insertSourcesError) {
      throw new Error(`failed to insert sources for ${input.id}: ${insertSourcesError.message}`);
    }
  }

  const { error: deleteExpressionsError } = await client
    .from("expressions")
    .delete()
    .eq("trend_id", input.id);
  if (deleteExpressionsError) {
    throw new Error(`failed to clear old expressions for ${input.id}: ${deleteExpressionsError.message}`);
  }

  const expressions: ExpressionSeed[] = input.content.expressions;
  if (expressions.length > 0) {
    const { error: insertExpressionsError } = await client.from("expressions").insert(
      expressions.map((expression, index) => ({
        trend_id: input.id,
        phrase: expression.phrase,
        meaning_ko: expression.meaningKo,
        nuance: expression.nuance,
        // usageSituation is optional on ExpressionSeed (GPT editorials
        // never populate it, see mock-data.ts's comment on that field),
        // but the DB column is NOT NULL with no default — fall back to
        // "" same as why_trending below. It's never rendered in any UI
        // (internal classification note only), so an empty string here
        // has no visible effect.
        usage_situation: expression.usageSituation ?? "",
        example_en: expression.exampleEn,
        example_ko: expression.exampleKo,
        comparison_phrase: expression.comparison?.phrase ?? null,
        comparison_nuance_diff: expression.comparison?.nuanceDiff ?? null,
        sort_order: index,
      })),
    );
    if (insertExpressionsError) {
      throw new Error(`failed to insert expressions for ${input.id}: ${insertExpressionsError.message}`);
    }
  }
}
