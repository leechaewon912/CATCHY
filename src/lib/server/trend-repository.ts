import "server-only";

import { getTrendById as getMockTrendById, trends as mockTrends, type Expression, type Trend } from "@/lib/mock-data";
import { getPublishedTrendsFromDb, getTrendByIdFromDb } from "@/lib/server/db/read-trends";
import { toExpressions } from "@/lib/server/to-expressions";

// Most "trending" first, for the home hero + feed. In priority order:
// 1. trendScore/rank, once either is ever populated (DB column or mock
//    value) — neither exists yet, so this never fires today.
// 2. Source/domain count — trend.sources is already the representative-
//    per-domain list built in collect-trends.ts, so its length doubles
//    as a distinct-domain count without a separate field.
// 3. Most recently generated.
// Array.prototype.sort is stable, so anything still tied after all
// three falls back to whatever order the caller already had it in
// (DB rows ordered newest-first, or mock-data's authored order).
function trendRankScore(trend: Trend): number {
  const scoreOrRank = trend.trendScore ?? trend.rank;
  return typeof scoreOrRank === "number" ? scoreOrRank : Number.NEGATIVE_INFINITY;
}

function rankTrends(trends: Trend[]): Trend[] {
  const hasExplicitScore = trends.some(
    (trend) => typeof trend.trendScore === "number" || typeof trend.rank === "number",
  );

  return [...trends].sort((a, b) => {
    if (hasExplicitScore) {
      return trendRankScore(b) - trendRankScore(a);
    }
    const domainDiff = b.sources.length - a.sources.length;
    if (domainDiff !== 0) return domainDiff;
    return new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime();
  });
}

// DB-first, mock-data fallback. Used by the home page and /trend/[id]
// so published Supabase content (collected via GDELT, see
// src/lib/server/collect-trends.ts) is used when present, and the
// hand-written mock trends in src/lib/mock-data.ts keep working
// untouched when it isn't (no Supabase configured, empty tables, or a
// query error).
export async function getHomeTrends(): Promise<Trend[]> {
  const dbTrends = await getPublishedTrendsFromDb();
  return rankTrends(dbTrends ?? mockTrends);
}

export async function getTrendDetail(id: string): Promise<Trend | undefined> {
  const dbTrend = await getTrendByIdFromDb(id);
  return dbTrend ?? getMockTrendById(id);
}

export async function getTrendExpressions(trendId: string): Promise<Expression[]> {
  const trend = await getTrendDetail(trendId);
  return trend ? toExpressions(trend) : [];
}
