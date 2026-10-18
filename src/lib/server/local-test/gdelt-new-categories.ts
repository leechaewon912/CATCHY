// LOCAL TEST ONLY — not imported by any API route, page, or DB code.
// src/lib/server/gdelt.ts is NOT modified: its fetchGdeltArticlesForCategory
// is keyed to the production Category type (src/lib/mock-data.ts), which
// this test deliberately doesn't touch. This file re-implements only the
// query-building/fetch step for the new 7-category taxonomy, while
// reusing gdelt.ts's actual rate-limit error class and spacing constant
// so "respect the existing rate limit" means the same thing here as it
// does in production, not a reinvented one.

import { GdeltRateLimitedError, GDELT_REQUEST_SPACING_MS } from "@/lib/server/gdelt";
import type { Category } from "@/lib/mock-data";
import type { NewCategory } from "@/lib/server/local-test/new-category-types";

const GDELT_DOC_ENDPOINT = "https://api.gdeltproject.org/api/v2/doc/doc";
const REQUEST_TIMEOUT_MS = 15_000;
// Deliberately lower than production's 150 (gdelt.ts) — this is a
// one-off local test, not a standing collection job, so there's no
// reason to pull a large page per category.
const MAX_RECORDS_PER_CATEGORY = 30;
const DEFAULT_TIMESPAN = "72h";

// Plain single/double-keyword OR queries, same style as gdelt.ts's own
// CATEGORY_QUERIES — quoted multi-word phrases require exact matches and
// tend to return empty results even outside rate-limiting (see gdelt.ts's
// own comment on this).
// GDELT's current API rejects 3+ OR'd terms without surrounding
// parentheses ("Queries containing OR'd terms must be surrounded by
// ()") — found live during the first local test run of this file
// (src/lib/server/gdelt.ts's own 2-term queries never hit this because
// they only ever OR two terms, not three).
export const NEW_CATEGORY_GDELT_QUERIES: Record<NewCategory, string> = {
  "국제정치·외교": "(diplomacy OR summit OR treaty)",
  "경제·산업": "(economy OR trade OR industry)",
  "기후·환경": "(climate OR environment OR emissions)",
  "과학·기술": "(science OR research OR technology)",
  "보건·사회": "(health OR hospital OR welfare)",
  "안보·인도주의": "(security OR conflict OR humanitarian)",
  "문화·교육": "(culture OR education OR heritage)",
};

// Metadata-only, same shape/field set as gdelt.ts's GdeltArticle —
// title/url/domain/publishedAt. GDELT's `socialimage` (thumbnail) and
// any snippet/description-like field are never read here, matching the
// "GDELT snippet/본문/이미지/설명 필드는 저장하거나 LLM 입력으로 전달하지
// 않는다" requirement by construction (those fields are never even
// destructured out of the API response below).
export type GdeltNewCategoryArticle = {
  title: string;
  url: string;
  domain: string;
  publishedAt: string;
};

type GdeltApiArticle = {
  title?: string;
  url?: string;
  domain?: string;
  seendate?: string;
};

type GdeltApiResponse = {
  articles?: GdeltApiArticle[];
};

function buildGdeltUrl(query: string): string {
  const params = new URLSearchParams({
    query,
    mode: "artlist",
    format: "json",
    timespan: DEFAULT_TIMESPAN,
    maxrecords: String(MAX_RECORDS_PER_CATEGORY),
  });
  return `${GDELT_DOC_ENDPOINT}?${params.toString()}`;
}

function normalizeSeenDate(seendate: string | undefined): string {
  if (!seendate) return new Date().toISOString();
  const match = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/.exec(seendate);
  if (!match) return seendate;
  const [, year, month, day, hour, minute, second] = match;
  return `${year}-${month}-${day}T${hour}:${minute}:${second}.000Z`;
}

// Single attempt, no retry — a non-rate-limit failure returns an empty
// list (same non-fatal posture as every other adapter in this project).
// A rate limit (HTTP 429 or the "please limit requests" message) throws
// GdeltRateLimitedError, which the caller (run-local-test.ts) must treat
// as "stop calling GDELT for the rest of this run", never retried.
export async function fetchGdeltArticlesForNewCategory(
  category: NewCategory,
): Promise<GdeltNewCategoryArticle[]> {
  const query = NEW_CATEGORY_GDELT_QUERIES[category];

  let response: Response;
  try {
    response = await fetch(buildGdeltUrl(query), {
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      headers: { Accept: "application/json" },
    });
  } catch (error) {
    console.error(`[local-test/gdelt] ${category}: request failed`, error);
    return [];
  }

  if (response.status === 429) {
    // GdeltRateLimitedError's `category` field is typed to the production
    // Category union (src/lib/mock-data.ts) — this local test's category
    // string doesn't belong to that union, so it's cast purely for the
    // error constructor's type signature. Never used to look anything up
    // against the production CATEGORY_* maps.
    throw new GdeltRateLimitedError(category as unknown as Category, "HTTP 429");
  }

  const text = await response.text();
  if (/please limit requests/i.test(text)) {
    throw new GdeltRateLimitedError(category as unknown as Category, "rate-limit message in response body");
  }

  if (!response.ok) {
    console.error(`[local-test/gdelt] ${category}: HTTP ${response.status}`);
    return [];
  }

  let payload: GdeltApiResponse;
  try {
    payload = JSON.parse(text) as GdeltApiResponse;
  } catch {
    console.error(`[local-test/gdelt] ${category}: non-JSON response`, text.slice(0, 200));
    return [];
  }

  if (!payload.articles || payload.articles.length === 0) {
    return [];
  }

  return payload.articles
    .filter((article) => article.title && article.url && article.domain)
    .map((article) => ({
      title: article.title!.trim(),
      url: article.url!,
      domain: article.domain!.toLowerCase(),
      publishedAt: normalizeSeenDate(article.seendate),
    }));
}

export { GDELT_REQUEST_SPACING_MS };
