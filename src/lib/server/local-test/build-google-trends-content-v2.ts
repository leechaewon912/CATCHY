import "server-only";

import { classifyTrendV2, type ContentType, type TrendCategoryV2 } from "@/lib/server/local-test/google-trends-categories-v2";
import { pickExpressionsV2, type TrendExpressionV2 } from "@/lib/server/local-test/google-trends-expressions-v2";
import { findGetToKnow } from "@/lib/server/local-test/google-trends-get-to-know";
import { TREND_CATEGORY_V2_IMAGE } from "@/lib/server/local-test/google-trends-categories-v2";
import type { GoogleTrendItem } from "@/lib/server/local-test/google-trends-types";
import { buildQuizFromExpressions } from "@/lib/server/build-quiz";

// LOCAL TEST ONLY — not imported by any production route/page/DB code.
// Reclassifies the SAME frozen 16-item Google Trends snapshot already
// collected earlier (google-trends-snapshot.ts) under the new 7-category
// scheme — this file never fetches anything itself (no network calls at
// all), so it can't trigger a Google Trends rate limit, and it never
// calls the EU Press Corner adapter or GDELT either.
const DEDUP_TOKEN_SIMILARITY_THRESHOLD = 0.6;

export type GoogleTrendsContentItemV2 = {
  id: string;
  term: string;
  category: TrendCategoryV2;
  contentType: ContentType;
  approxTraffic: string;
  pubDate: string;
  title: string;
  whatsTrending: { en: string; ko: string };
  getToKnow: { en: string; ko: string } | null;
  expressions: Array<TrendExpressionV2 & { id: string; trendId: string; category: TrendCategoryV2 }>;
  quiz: ReturnType<typeof buildQuizFromExpressions>;
  imagePath: string;
  sourceUrl: string;
  usedDataFields: string[];
  omittedFields: string[];
};

export type GoogleTrendsTestReportV2 = {
  runAt: string;
  totalCandidates: number;
  excludedCount: number;
  excludedTerms: Array<{ term: string; reason: string }>;
  dedupedCount: number;
  finalCount: number;
  categoryCounts: Record<TrendCategoryV2, number>;
  otherBucketTerms: string[];
  items: GoogleTrendsContentItemV2[];
};

function tokenize(term: string): Set<string> {
  return new Set(
    term
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((t) => t.length >= 3),
  );
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  for (const t of a) if (b.has(t)) intersection++;
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

function buildTitle(term: string, category: TrendCategoryV2): string {
  const prettyTerm = term.replace(/\b\w/g, (c) => c.toUpperCase());
  const templates: Record<TrendCategoryV2, string> = {
    "국제·사회": `"${prettyTerm}" Is Trending in US Searches`,
    "경제·금융": `"${prettyTerm}" Is Trending in Market-Related Searches`,
    "기술·과학": `"${prettyTerm}" Is Trending in US Tech Searches`,
    "엔터테인먼트·문화": `Everyone's Searching "${prettyTerm}" Right Now`,
    스포츠: `"${prettyTerm}" Is Trending in Sports Searches`,
    "라이프스타일·인터넷": `"${prettyTerm}" Is Blowing Up in US Searches`,
    기타: `"${prettyTerm}" Is Trending — Here's What's Known`,
  };
  return templates[category];
}

// Returns both an English and a Korean rendering of the same two
// sentences — the real app's detail page always pairs an EN panel with
// a KO panel ("무슨 일이 있었나요?"), so this test's content needs both,
// not English only. Both say exactly the same thing: the term, its
// approx_traffic bucket, and when it was observed — no cause is implied
// in either language.
function buildWhatsTrending(item: GoogleTrendItem): { en: string; ko: string } {
  const date = new Date(item.pubDate);
  const dateStr = Number.isNaN(date.getTime()) ? item.pubDate : date.toISOString().slice(0, 16).replace("T", " ") + " UTC";
  return {
    en: `The search term "${item.term}" is currently trending in the United States on Google Trends, with estimated search interest of ${item.approxTraffic} as of ${dateStr}. Google Trends data shows that interest is rising — it does not explain the specific reason behind it, so none is assumed here.`,
    ko: `검색어 "${item.term}"가 ${dateStr} 기준으로 미국 Google Trends에서 트렌딩 중이며, 추정 검색 관심도는 ${item.approxTraffic}입니다. Google Trends 데이터는 관심도가 상승했다는 사실만 보여줄 뿐 구체적인 원인은 설명하지 않으므로, 원인을 추측하지 않았습니다.`,
  };
}

// `rawItems` is always the already-collected snapshot passed in by the
// caller (see the preview page) — this function has no fetch of its own
// and makes zero network calls, so re-running it never touches Google's
// rate limit.
export async function buildGoogleTrendsTestContentV2(
  rawItems: GoogleTrendItem[],
): Promise<GoogleTrendsTestReportV2> {
  const runAt = new Date().toISOString();

  const excludedTerms: Array<{ term: string; reason: string }> = [];
  const candidates: Array<{ item: GoogleTrendItem; category: TrendCategoryV2; contentType: ContentType }> = [];

  for (const item of rawItems) {
    const result = classifyTrendV2(item.term);
    if (result.kind === "excluded") {
      excludedTerms.push({ term: item.term, reason: result.reason });
      continue;
    }
    candidates.push({ item, category: result.category, contentType: result.contentType });
  }

  const deduped: typeof candidates = [];
  for (const candidate of candidates) {
    const tokens = tokenize(candidate.item.term);
    const isDuplicate = deduped.some(
      (kept) => jaccard(tokens, tokenize(kept.item.term)) >= DEDUP_TOKEN_SIMILARITY_THRESHOLD,
    );
    if (isDuplicate) {
      excludedTerms.push({ term: candidate.item.term, reason: "다른 후보와 중복(유사 검색어)" });
    } else {
      deduped.push(candidate);
    }
  }

  const categoryCounts: Record<TrendCategoryV2, number> = {
    "국제·사회": 0,
    "경제·금융": 0,
    "기술·과학": 0,
    "엔터테인먼트·문화": 0,
    스포츠: 0,
    "라이프스타일·인터넷": 0,
    기타: 0,
  };

  const items: GoogleTrendsContentItemV2[] = deduped.map((candidate, index) => {
    const { item, category, contentType } = candidate;
    categoryCounts[category]++;

    const getToKnow = findGetToKnow(item.term);
    const trendId = `gtv2-${index}`;
    const expressions = pickExpressionsV2(category, index).map((e, i) => ({
      ...e,
      id: `${trendId}-expr-${i}`,
      trendId,
      category,
    }));

    return {
      id: trendId,
      term: item.term,
      category,
      contentType,
      approxTraffic: item.approxTraffic,
      pubDate: item.pubDate,
      title: buildTitle(item.term, category),
      whatsTrending: buildWhatsTrending(item),
      getToKnow,
      expressions,
      quiz: buildQuizFromExpressions(expressions),
      imagePath: TREND_CATEGORY_V2_IMAGE[category],
      sourceUrl: "https://trends.google.com/trending?geo=US",
      usedDataFields: ["검색어(term)", "approx_traffic", "pubDate"],
      omittedFields: [
        "ht:news_item (관련 기사 제목/URL/스니펫 — 각 언론사 저작권, 미사용)",
        "ht:picture / ht:picture_source (관련 기사 썸네일 — 미사용)",
        ...(getToKnow ? [] : ["Get to Know (로컬 사전에 없는 용어라 생략)"]),
      ],
    };
  });

  return {
    runAt,
    totalCandidates: rawItems.length,
    excludedCount: excludedTerms.length,
    excludedTerms,
    dedupedCount: candidates.length - deduped.length,
    finalCount: items.length,
    categoryCounts,
    otherBucketTerms: items.filter((i) => i.category === "기타").map((i) => i.term),
    items,
  };
}
