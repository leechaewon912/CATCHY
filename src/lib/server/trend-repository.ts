import "server-only";

import { getTrendById as getMockTrendById, trends as mockTrends, type Expression, type Trend } from "@/lib/mock-data";
import { getPublishedTrendsFromDb, getTrendByIdFromDb } from "@/lib/server/db/read-trends";
import { toExpressions } from "@/lib/server/to-expressions";

// DB-first, mock-data fallback. Used by the home page and /trend/[id]
// so published Supabase content (collected via GDELT, see
// src/lib/server/collect-trends.ts) is used when present, and the
// hand-written mock trends in src/lib/mock-data.ts keep working
// untouched when it isn't (no Supabase configured, empty tables, or a
// query error).
export async function getHomeTrends(): Promise<Trend[]> {
  const dbTrends = await getPublishedTrendsFromDb();
  return dbTrends ?? mockTrends;
}

export async function getTrendDetail(id: string): Promise<Trend | undefined> {
  const dbTrend = await getTrendByIdFromDb(id);
  return dbTrend ?? getMockTrendById(id);
}

export async function getTrendExpressions(trendId: string): Promise<Expression[]> {
  const trend = await getTrendDetail(trendId);
  return trend ? toExpressions(trend) : [];
}
