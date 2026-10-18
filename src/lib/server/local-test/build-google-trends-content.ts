import "server-only";

import { fetchGoogleTrendsUS } from "@/lib/server/local-test/google-trends-fetch";
import { classifyPreferredCategory } from "@/lib/server/local-test/google-trends-classify";
import { pickExpressions, type TrendExpression } from "@/lib/server/local-test/google-trends-expressions";
import { findGetToKnow } from "@/lib/server/local-test/google-trends-get-to-know";
import { PREFERRED_CATEGORY_IMAGE, type GoogleTrendItem, type PreferredCategory } from "@/lib/server/local-test/google-trends-types";
import { buildQuizFromExpressions } from "@/lib/server/build-quiz";

const MAX_CONTENT_ITEMS = 10;
const DEDUP_TOKEN_SIMILARITY_THRESHOLD = 0.5;

export type GoogleTrendsContentItem = {
  id: string;
  term: string;
  category: PreferredCategory;
  approxTraffic: string;
  pubDate: string;
  title: string;
  whatsTrending: { en: string; ko: string };
  getToKnow: { en: string; ko: string } | null;
  expressions: Array<TrendExpression & { id: string; trendId: string; category: PreferredCategory }>;
  quiz: ReturnType<typeof buildQuizFromExpressions>;
  imagePath: string;
  sourceUrl: string;
  usedDataFields: string[];
  omittedFields: string[];
};

export type GoogleTrendsTestReport = {
  runAt: string;
  totalCandidates: number;
  excludedCount: number;
  excludedTerms: Array<{ term: string; reason: string }>;
  dedupedCount: number;
  finalCount: number;
  categoryCounts: Record<PreferredCategory, number>;
  items: GoogleTrendsContentItem[];
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

// Title-case-ish, click-worthy, never implies an unverified cause ("...
// Sparks Backlash", "... After Scandal") — only states that the term
// itself is trending right now.
function buildTitle(term: string, category: PreferredCategory): string {
  const prettyTerm = term.replace(/\b\w/g, (c) => c.toUpperCase());
  const templates: Record<PreferredCategory, string> = {
    Entertainment: `Everyone's Searching "${prettyTerm}" Right Now`,
    "Fashion & Beauty": `"${prettyTerm}" Is Trending in Fashion Searches`,
    "Internet Culture": `"${prettyTerm}" Is Blowing Up in US Searches`,
    Lifestyle: `"${prettyTerm}" Is Trending — Here's What It Means`,
    Technology: `"${prettyTerm}" Is Trending in US Tech Searches`,
  };
  return templates[category];
}

// Only verifiable facts from Google Trends itself: the term, its
// approx_traffic bucket, and when it was observed — explicitly refuses
// to explain WHY, per this test's fact-accuracy rules.
function buildWhatsTrending(item: GoogleTrendItem): { en: string; ko: string } {
  const date = new Date(item.pubDate);
  const dateStr = Number.isNaN(date.getTime()) ? item.pubDate : date.toISOString().slice(0, 16).replace("T", " ") + " UTC";
  return {
    en: `The search term "${item.term}" is currently trending in the United States on Google Trends, with estimated search interest of ${item.approxTraffic} as of ${dateStr}. Google Trends data shows that interest is rising — it does not explain the specific reason behind it, so none is assumed here.`,
    ko: `검색어 "${item.term}"가 ${dateStr} 기준으로 미국 Google Trends에서 트렌딩 중이며, 추정 검색 관심도는 ${item.approxTraffic}입니다. Google Trends 데이터는 관심도가 상승했다는 사실만 보여줄 뿐 구체적인 원인은 설명하지 않으므로, 원인을 추측하지 않았습니다.`,
  };
}

// `preFetchedItems` lets a caller supply raw items collected across
// several polls over time (the live RSS endpoint only ever returns a
// rolling top-~10 snapshot — see google-trends-fetch.ts's doc comment —
// so a single request can't approximate a 24-48h window on its own).
// Defaults to one live fetch when omitted, which is what the real
// preview page uses.
export async function buildGoogleTrendsTestContent(
  preFetchedItems?: GoogleTrendItem[],
): Promise<GoogleTrendsTestReport> {
  const runAt = new Date().toISOString();
  const rawItems = preFetchedItems ?? (await fetchGoogleTrendsUS());

  const excludedTerms: Array<{ term: string; reason: string }> = [];
  const candidates: Array<{ item: GoogleTrendItem; category: PreferredCategory }> = [];

  for (const item of rawItems) {
    const classified = classifyPreferredCategory(item.term);
    if (!classified) {
      excludedTerms.push({
        term: item.term,
        reason: "제외 대상 주제이거나 선호 카테고리(5개) 키워드와 일치하지 않음",
      });
      continue;
    }
    candidates.push({ item, category: classified.category });
  }

  // Dedup similar terms (e.g. "black friday 2026" vs "black friday
  // deals") — keeps the first-seen one, same Jaccard-token approach used
  // elsewhere in this project's local-test pipelines.
  const deduped: typeof candidates = [];
  for (const candidate of candidates) {
    const tokens = tokenize(candidate.item.term);
    const isDuplicate = deduped.some(
      (kept) => jaccard(tokens, tokenize(kept.item.term)) >= DEDUP_TOKEN_SIMILARITY_THRESHOLD,
    );
    if (!isDuplicate) deduped.push(candidate);
  }

  const categoryCounts: Record<PreferredCategory, number> = {
    Entertainment: 0,
    "Fashion & Beauty": 0,
    "Internet Culture": 0,
    Lifestyle: 0,
    Technology: 0,
  };

  const items: GoogleTrendsContentItem[] = deduped.slice(0, MAX_CONTENT_ITEMS).map((candidate, index) => {
    const { item, category } = candidate;
    categoryCounts[category]++;

    const getToKnow = findGetToKnow(item.term);
    const trendId = `gt-${index}`;
    const expressions = pickExpressions(category, index).map((e, i) => ({
      ...e,
      id: `${trendId}-expr-${i}`,
      trendId,
      category,
    }));

    return {
      id: `gt-${index}`,
      term: item.term,
      category,
      approxTraffic: item.approxTraffic,
      pubDate: item.pubDate,
      title: buildTitle(item.term, category),
      whatsTrending: buildWhatsTrending(item),
      getToKnow,
      expressions,
      quiz: buildQuizFromExpressions(expressions),
      imagePath: PREFERRED_CATEGORY_IMAGE[category],
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
    items,
  };
}
