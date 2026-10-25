import "server-only";

import { getTrendById as getMockTrendById, trends as mockTrends, type Expression, type Trend } from "@/lib/mock-data";
import { getCultureEditorialTrends } from "@/lib/mock-data.culture-editorials";
import { getPublishedTrendsFromDb, getTrendByIdFromDb } from "@/lib/server/db/read-trends";
import { toExpressions } from "@/lib/server/to-expressions";

// Portfolio/demo switch — see src/lib/mock-data.culture-editorials.ts for
// the 7 hand-written culture editorials this swaps in. "true" (exact
// string match) is the only way to opt in; unset or any other value keeps
// the existing DB-first + mock-data.ts-fallback behavior completely
// untouched. Never read anywhere except this file.
export const MOCK_MODE = process.env.MOCK_MODE === "true";

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

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

// "YYYYMMDD" in Asia/Seoul wall-clock time — same "+9h shift, read back
// with UTC getters" trick used throughout this codebase (src/app/
// page.tsx, src/app/api/cron/daily-editorial/route.ts). Used below only
// to compare a Mock seed's and a GPT row's calendar day, not stored.
function kstDateStamp(isoString: string): string {
  const kst = new Date(new Date(isoString).getTime() + KST_OFFSET_MS);
  return `${kst.getUTCFullYear()}${String(kst.getUTCMonth() + 1).padStart(2, "0")}${String(kst.getUTCDate()).padStart(2, "0")}`;
}

// Mock seeds whose (category, KST calendar day) matches a real GPT row
// are dropped — "실제 GPT 콘텐츠가 있는 날짜는 GPT 콘텐츠가 우선 노출".
// Only suppresses that seed's appearance in the merged listing; it's
// never deleted and its own /trend/<id> page still renders normally.
function withoutMockEntriesSupersededByGpt(mockTrends: Trend[], gptTrends: Trend[]): Trend[] {
  const gptCategoryDates = new Set(
    gptTrends.map((trend) => `${trend.category}|${kstDateStamp(trend.generatedAt)}`),
  );
  return mockTrends.filter(
    (trend) => !gptCategoryDates.has(`${trend.category}|${kstDateStamp(trend.generatedAt)}`),
  );
}

// MOCK_MODE semantics: the 14 hand/GPT-written culture editorials PLUS
// any real GPT self-generated content from Supabase (content_origin=
// "gpt_editorial" — getPublishedTrendsFromDb/getTrendByIdFromDb already
// filter to that origin, see read-trends.ts). RSS-origin rows are never
// read here regardless of MOCK_MODE. This lets the daily-editorial cron's
// output accumulate on the live site immediately, without ever flipping
// MOCK_MODE off or touching the 91 stored-but-hidden RSS rows.
//
// A Mock seed is dropped from the merged list whenever a GPT row already
// covers the same category on the same KST calendar day — see
// withoutMockEntriesSupersededByGpt above.
//
// Non-MOCK_MODE path is untouched: DB-first (any origin), falling back to
// src/lib/mock-data.ts's hand-written demo trends when Supabase has
// nothing published.
export async function getHomeTrends(): Promise<Trend[]> {
  if (!MOCK_MODE) {
    const dbTrends = await getPublishedTrendsFromDb();
    return rankTrends(dbTrends ?? mockTrends);
  }
  const gptTrends = await getPublishedTrendsFromDb();
  const mockEntries = withoutMockEntriesSupersededByGpt(getCultureEditorialTrends(), gptTrends ?? []);
  return rankTrends([...mockEntries, ...(gptTrends ?? [])]);
}

export async function getTrendDetail(id: string): Promise<Trend | undefined> {
  if (!MOCK_MODE) {
    const dbTrend = await getTrendByIdFromDb(id);
    return dbTrend ?? getMockTrendById(id);
  }
  const mockMatch = getCultureEditorialTrends().find((trend) => trend.id === id);
  if (mockMatch) return mockMatch;
  const dbTrend = await getTrendByIdFromDb(id);
  return dbTrend ?? undefined;
}

export async function getTrendExpressions(trendId: string): Promise<Expression[]> {
  const trend = await getTrendDetail(trendId);
  return trend ? toExpressions(trend) : [];
}
