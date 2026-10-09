import "server-only";

import type { Category } from "@/lib/mock-data";

// GDELT DOC 2.0 API — public, no API key. Docs:
// https://blog.gdeltproject.org/gdelt-doc-2-0-api-debuts/
// We only ever read `mode=artlist` metadata fields (title/url/domain/
// sourcecountry/seendate/language) — never article bodies, images, or
// thumbnails. See CATEGORY_QUERIES below for the per-category queries.
const GDELT_DOC_ENDPOINT = "https://api.gdeltproject.org/api/v2/doc/doc";
// Observed in testing: even throttle (429) responses can take 8-12s to
// arrive, so a short timeout risks misclassifying a slow 429 as a
// network timeout. 15s gives real responses room without hanging long.
const REQUEST_TIMEOUT_MS = 15_000;
const MAX_RECORDS_PER_CATEGORY = 150;

// Widened from 24h after seeing clean (non-throttled) `{}` responses —
// GDELT's index for a narrow 24h window can simply be sparse for a given
// query at a given moment. 72h gives clustering more to work with while
// still being "recent" for a daily trend feed.
const DEFAULT_TIMESPAN = "72h";

// Simple, single/double-keyword queries — no quoted multi-word phrases.
// Quoted phrases require an exact match, which stacked on top of a
// multi-OR query made results disappear even outside of rate-limiting
// (confirmed by curling GDELT directly and getting a clean `{}`, not a
// 429). Plain keywords cast a wider net; clustering + the 2-distinct-
// domain gate downstream are what keep quality in check, not query
// precision.
export const CATEGORY_QUERIES: Record<Category, string> = {
  "음악": "music OR concert",
  "영화·시리즈": "movie OR film",
  "밈·인터넷": "viral OR meme",
  "라이프스타일": "celebrity OR fashion",
  "테크·게임": "technology OR gaming",
  "스포츠": "sports OR championship",
  "글로벌 이슈": "protest OR election",
};

// English slug per category, used for trend ids / cluster keys —
// Supabase's `trends.id` is a text primary key and the app's URLs use it
// directly, so it needs to stay ASCII.
export const CATEGORY_SLUGS: Record<Category, string> = {
  "음악": "music",
  "영화·시리즈": "movie",
  "밈·인터넷": "meme",
  "라이프스타일": "lifestyle",
  "테크·게임": "tech",
  "스포츠": "sports",
  "글로벌 이슈": "global",
};

export const ALL_CATEGORIES = Object.keys(CATEGORY_QUERIES) as Category[];

// GDELT's documented policy ("limit requests to one every 5 seconds")
// turned out to be optimistic in practice — testing from one network hit
// persistent 429s even with 10-45s between requests. 8s is the floor
// requested; collect-trends.ts uses this constant for spacing and treats
// any 429/limit-message as fatal for the whole run (see
// GdeltRateLimitedError) rather than retrying.
export const GDELT_REQUEST_SPACING_MS = 8_000;

// Thrown by fetchGdeltArticlesForCategory specifically for HTTP 429 or a
// "please limit requests" response body — never for network errors,
// timeouts, or malformed JSON, which stay non-fatal (logged, treated as
// zero articles for that category). Callers must treat this as fatal for
// the *entire* run: stop immediately and persist nothing collected so
// far, since there's no way to tell whether categories that did return
// data were sampled fairly.
export class GdeltRateLimitedError extends Error {
  readonly category: Category;

  constructor(category: Category, reason: string) {
    super(`GDELT rate-limited on ${category}: ${reason}`);
    this.name = "GdeltRateLimitedError";
    this.category = category;
  }
}

// Metadata-only — deliberately excludes GDELT's `socialimage` (thumbnail)
// field and never touches article bodies.
export type GdeltArticle = {
  title: string;
  url: string;
  domain: string;
  sourceCountry: string;
  publishedAt: string;
  language: string;
};

type GdeltApiArticle = {
  title?: string;
  url?: string;
  domain?: string;
  sourcecountry?: string;
  seendate?: string;
  language?: string;
};

type GdeltApiResponse = {
  articles?: GdeltApiArticle[];
};

// No explicit `sort` — defaults to GDELT's native "datedesc". `hybridrel`
// (relevance-ranked) was dropped after it coincided with clean `{}`
// responses for multi-OR queries; datedesc is simpler to reason about
// and clustering doesn't care about result order anyway.
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

// GDELT's `seendate` looks like "20261009T050000Z" — normalize to ISO so
// callers don't need to know GDELT's format.
function normalizeSeenDate(seendate: string | undefined): string {
  if (!seendate) return new Date().toISOString();
  const match = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/.exec(seendate);
  if (!match) return seendate;
  const [, year, month, day, hour, minute, second] = match;
  return `${year}-${month}-${day}T${hour}:${minute}:${second}.000Z`;
}

// Throws GdeltRateLimitedError on HTTP 429 or a "please limit requests"
// response body — callers (collect-trends.ts) must treat that as fatal
// for the whole run. Every other failure mode (network error, timeout,
// malformed JSON, any other non-2xx status) is non-fatal: logged, and
// an empty list is returned so the rest of the run keeps going.
export async function fetchGdeltArticlesForCategory(
  category: Category,
): Promise<GdeltArticle[]> {
  const query = CATEGORY_QUERIES[category];

  let response: Response;
  try {
    response = await fetch(buildGdeltUrl(query), {
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      headers: { Accept: "application/json" },
    });
  } catch (error) {
    console.error(`[gdelt] ${category}: request failed`, error);
    return [];
  }

  if (response.status === 429) {
    throw new GdeltRateLimitedError(category, "HTTP 429");
  }

  const text = await response.text();
  if (/please limit requests/i.test(text)) {
    throw new GdeltRateLimitedError(category, "rate-limit message in response body");
  }

  if (!response.ok) {
    console.error(`[gdelt] ${category}: HTTP ${response.status}`);
    return [];
  }

  let payload: GdeltApiResponse;
  try {
    payload = JSON.parse(text) as GdeltApiResponse;
  } catch {
    console.error(`[gdelt] ${category}: non-JSON response`, text.slice(0, 200));
    return [];
  }

  if (!payload.articles) {
    // A clean `{}` (no "articles" key, no error, no throttle message) is
    // GDELT's normal way of saying "nothing matched" — not a bug on our
    // end. Logged so a run of all-zero categories is distinguishable
    // from a silent failure when reading logs later.
    console.log(`[gdelt] ${category}: 0 articles (no "articles" key — query/timespan likely too narrow right now)`);
    return [];
  }

  if (payload.articles.length === 0) {
    console.log(`[gdelt] ${category}: 0 articles (empty "articles" array)`);
    return [];
  }

  return payload.articles
    .filter((article) => article.title && article.url && article.domain)
    .map((article) => ({
      title: article.title!.trim(),
      url: article.url!,
      domain: article.domain!.toLowerCase(),
      sourceCountry: article.sourcecountry ?? "unknown",
      publishedAt: normalizeSeenDate(article.seendate),
      language: article.language ?? "unknown",
    }));
}
