import "server-only";

import type { Category, ExpressionSeed, TrendSource } from "@/lib/mock-data";
import type { GenerateTrendDraftOutput } from "@/lib/server/generate-trend-draft";
import { getSupabaseServerClient } from "@/lib/server/supabase-client";

export type UpsertTrendInput = {
  id: string;
  category: Category;
  clusterKey: string;
  status: "draft" | "published";
  content: GenerateTrendDraftOutput;
  sources: TrendSource[];
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
      category: input.category,
      summary: input.content.summary,
      english_summary: input.content.englishSummary,
      korean_summary: input.content.koreanSummary,
      why_trending: input.content.whyTrending,
      cluster_key: input.clusterKey,
      status: input.status,
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
        usage_situation: expression.usageSituation,
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
