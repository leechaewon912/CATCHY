// LOCAL TEST ONLY — not imported by any API route, page, or DB code.
// Orchestrates EU Press Corner + GDELT (new categories) + techcrunch.com
// (the one existing RSS feed with a non-permission_required verdict),
// classifies/tags/dedupes/gates them, and writes a JSON report to the
// scratchpad — never to Supabase. This file never imports
// getSupabaseServerClient, upsertTrend, or anything under
// src/lib/server/db/.

import Parser from "rss-parser";

import { euPressCornerAdapter } from "@/lib/server/sources/eu-presscorner-adapter";
import { domainFromUrl } from "@/lib/server/sources/types";
import { isCommerciallyUsable } from "@/lib/server/rss-source-policy";
import {
  fetchGdeltArticlesForNewCategory,
  GDELT_REQUEST_SPACING_MS,
  NEW_CATEGORY_GDELT_QUERIES,
} from "@/lib/server/local-test/gdelt-new-categories";
import {
  inferRegionTags,
  NEW_CATEGORIES,
  NEW_CATEGORY_IMAGE,
  type NewCategory,
  type RegionTag,
} from "@/lib/server/local-test/new-category-types";
import { classifyAndSummarize } from "@/lib/server/local-test/classify-and-summarize";
import { GdeltRateLimitedError } from "@/lib/server/gdelt";

type RawArticle = {
  title: string;
  url: string;
  domain: string;
  publishedAt: string;
  sourceId: "eu-press-corner" | "gdelt-project" | "techcrunch.com";
};

const TECHCRUNCH_FEED_URL = "https://techcrunch.com/feed/";
const REQUEST_TIMEOUT_MS = 10_000;
const DEDUP_TITLE_SIMILARITY_THRESHOLD = 0.5;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------
// Step 1: fetch, per source — each wrapped so one source's failure
// never aborts the others (same non-fatal posture as the rest of this
// project's adapters).
// ---------------------------------------------------------------------

async function fetchEuArticles(): Promise<RawArticle[]> {
  try {
    // euPressCornerAdapter ignores its category argument entirely (one
    // shared feed, see sources/eu-presscorner-adapter.ts) — the cast
    // below exists only to satisfy its production-Category-typed
    // signature, nothing in the new 7-category taxonomy flows into it.
    const articles = await euPressCornerAdapter.fetchArticlesForCategory(
      "국제정치·외교" as unknown as Parameters<typeof euPressCornerAdapter.fetchArticlesForCategory>[0],
    );
    return articles.map((a) => ({ ...a, sourceId: "eu-press-corner" as const }));
  } catch (error) {
    console.error("[local-test] EU Press Corner fetch failed", error);
    return [];
  }
}

// Metadata-only — title/link/pubDate only, same exclusion pattern as
// rss-collect.ts and eu-presscorner-adapter.ts. item.content/
// contentSnippet/enclosure are never read.
async function fetchTechCrunchArticles(): Promise<RawArticle[]> {
  const policy = isCommerciallyUsable(TECHCRUNCH_FEED_URL);
  if (!policy) {
    console.log("[local-test] techcrunch.com excluded — license registry says permission_required");
    return [];
  }

  const parser = new Parser({ timeout: REQUEST_TIMEOUT_MS });
  try {
    const feed = await parser.parseURL(TECHCRUNCH_FEED_URL);
    return (feed.items ?? [])
      .filter((item) => item.title && item.link)
      .map((item) => ({
        title: item.title!.trim(),
        url: item.link!,
        domain: domainFromUrl(item.link!),
        publishedAt: item.isoDate ?? item.pubDate ?? new Date().toISOString(),
        sourceId: "techcrunch.com" as const,
      }));
  } catch (error) {
    console.error("[local-test] techcrunch.com fetch failed", error);
    return [];
  }
}

type GdeltRunResult = {
  articles: RawArticle[];
  rateLimited: boolean;
  rateLimitedAtCategory: NewCategory | null;
  attemptedCategories: NewCategory[];
};

// Sequential, spaced, single-attempt-per-category, stops calling GDELT
// entirely (not just skipping one category) the moment a rate limit is
// hit — no retry, no parallel calls, matching the "제한에 걸리면 무한
// 재시도하지 말고 해당 소스를 건너뛴다" requirement.
async function fetchGdeltArticles(): Promise<GdeltRunResult> {
  const articles: RawArticle[] = [];
  const attemptedCategories: NewCategory[] = [];
  let rateLimited = false;
  let rateLimitedAtCategory: NewCategory | null = null;

  for (let i = 0; i < NEW_CATEGORIES.length; i++) {
    const category = NEW_CATEGORIES[i];
    if (i > 0) {
      await delay(GDELT_REQUEST_SPACING_MS);
    }
    attemptedCategories.push(category);

    try {
      const categoryArticles = await fetchGdeltArticlesForNewCategory(category);
      for (const a of categoryArticles) {
        articles.push({ ...a, sourceId: "gdelt-project" as const });
      }
    } catch (error) {
      if (error instanceof GdeltRateLimitedError) {
        console.error(`[local-test] GDELT rate-limited at "${category}" — stopping GDELT for the rest of this run`, error.message);
        rateLimited = true;
        rateLimitedAtCategory = category;
        break;
      }
      console.error(`[local-test] GDELT ${category}: unexpected error`, error);
    }
  }

  return { articles, rateLimited, rateLimitedAtCategory, attemptedCategories };
}

// ---------------------------------------------------------------------
// Step 2: dedupe EU/GDELT/techcrunch articles that are the same URL or
// (via title-token Jaccard similarity) plausibly the same real-world
// event, regardless of which source(s) reported it.
// ---------------------------------------------------------------------

type ArticleGroup = {
  articles: RawArticle[];
};

function tokenize(title: string): Set<string> {
  return new Set(
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((t) => t.length >= 4),
  );
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  for (const t of a) if (b.has(t)) intersection++;
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

function dedupeArticles(articles: RawArticle[]): { groups: ArticleGroup[]; duplicatesRemoved: number } {
  const seenUrls = new Set<string>();
  const groups: Array<{ tokens: Set<string>; articles: RawArticle[] }> = [];
  let duplicatesRemoved = 0;

  for (const article of articles) {
    if (seenUrls.has(article.url)) {
      duplicatesRemoved++;
      continue;
    }
    seenUrls.add(article.url);

    const tokens = tokenize(article.title);
    let matched = false;
    for (const group of groups) {
      if (jaccard(tokens, group.tokens) >= DEDUP_TITLE_SIMILARITY_THRESHOLD) {
        group.articles.push(article);
        matched = true;
        duplicatesRemoved++;
        break;
      }
    }
    if (!matched) {
      groups.push({ tokens, articles: [article] });
    }
  }

  return { groups: groups.map((g) => ({ articles: g.articles })), duplicatesRemoved };
}

// ---------------------------------------------------------------------
// Step 3: attribution text per source — EU/GDELT get the exact fixed
// wording requested (data-provider credit, not "original article
// source"); techcrunch.com (an actual press outlet) gets its real name
// + link like any other article source. None of these imply Catchy is
// sponsored/endorsed by the named party.
// ---------------------------------------------------------------------

function attributionLine(sourceId: RawArticle["sourceId"], domain: string): string {
  if (sourceId === "eu-press-corner") return "출처: European Commission Press Corner";
  if (sourceId === "gdelt-project") return "데이터 제공: GDELT Project";
  return `출처: ${domain}`;
}

// ---------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------

export type LocalTestTrend = {
  category: NewCategory | "미분류";
  scope: "global";
  regionTags: RegionTag[];
  isSingleSource: boolean;
  usedLlm: boolean;
  summary: string;
  imageUrl: string | null;
  sources: Array<{
    sourceId: RawArticle["sourceId"];
    domain: string;
    originalTitle: string;
    originalUrl: string;
    publishedAt: string;
    attribution: string;
  }>;
};

export type LocalTestReport = {
  runAt: string;
  receivedCounts: Record<string, number>;
  gdelt: {
    rateLimited: boolean;
    rateLimitedAtCategory: NewCategory | null;
    attemptedCategories: NewCategory[];
  };
  duplicatesRemoved: number;
  categoryCounts: Record<NewCategory | "미분류", number>;
  koreaTaggedCount: number;
  singleSourceCount: number;
  multiSourceCount: number;
  publishableCount: number;
  excludedSources: Array<{ sourceId: string; displayDomain: string; reason: string }>;
  trends: LocalTestTrend[];
};

export async function runLocalTest(): Promise<LocalTestReport> {
  const runAt = new Date().toISOString();

  const [euArticles, techcrunchArticles, gdeltResult] = await Promise.all([
    fetchEuArticles(),
    fetchTechCrunchArticles(),
    fetchGdeltArticles(),
  ]);
  // Note: the three fetches above run concurrently with each other (EU,
  // techcrunch, GDELT are independent sources), but GDELT's OWN 7
  // category requests inside fetchGdeltArticles() are strictly
  // sequential and spaced — see that function. This is not "parallel
  // calls to GDELT", just three different sources being awaited
  // together.

  const receivedCounts = {
    "eu-press-corner": euArticles.length,
    "gdelt-project": gdeltResult.articles.length,
    "techcrunch.com": techcrunchArticles.length,
  };

  const allArticles = [...euArticles, ...gdeltResult.articles, ...techcrunchArticles];
  const { groups, duplicatesRemoved } = dedupeArticles(allArticles);

  const categoryCounts: Record<NewCategory | "미분류", number> = {
    "국제정치·외교": 0,
    "경제·산업": 0,
    "기후·환경": 0,
    "과학·기술": 0,
    "보건·사회": 0,
    "안보·인도주의": 0,
    "문화·교육": 0,
    "미분류": 0,
  };

  let koreaTaggedCount = 0;
  let singleSourceCount = 0;
  let multiSourceCount = 0;

  const trends: LocalTestTrend[] = [];

  for (const group of groups) {
    const primary = group.articles[0];
    const { category, summary, usedLlm } = await classifyAndSummarize({
      title: primary.title,
      sourceName: primary.domain,
      publishedAt: primary.publishedAt,
    });

    categoryCounts[category]++;

    const regionTags = new Set<RegionTag>();
    for (const article of group.articles) {
      for (const tag of inferRegionTags(article.title, article.sourceId)) {
        regionTags.add(tag);
      }
    }
    if (regionTags.has("korea")) koreaTaggedCount++;

    const isSingleSource = group.articles.length === 1;
    if (isSingleSource) singleSourceCount++;
    else multiSourceCount++;

    trends.push({
      category,
      scope: "global",
      regionTags: [...regionTags],
      isSingleSource,
      usedLlm,
      summary,
      imageUrl: category === "미분류" ? null : NEW_CATEGORY_IMAGE[category],
      sources: group.articles.map((a) => ({
        sourceId: a.sourceId,
        domain: a.domain,
        originalTitle: a.title,
        originalUrl: a.url,
        publishedAt: a.publishedAt,
        attribution: attributionLine(a.sourceId, a.domain),
      })),
    });
  }

  // Every article here only ever came from eu-press-corner, gdelt-project,
  // or techcrunch.com — all three already passed isCommerciallyUsable
  // before being fetched at all (techcrunch.com is checked explicitly in
  // fetchTechCrunchArticles; EU/GDELT are hardcoded to those two
  // pre-vetted sources only). So every resulting group here is
  // publishable, single-source or not — there is no additional gate to
  // apply at this step. publishableCount intentionally equals
  // trends.length to make that explicit in the report rather than
  // silently assumed.
  const publishableCount = trends.length;

  const excludedSources = [
    {
      sourceId: "(28 other curated RSS feeds)",
      displayDomain: "billboard.com, bbc.co.uk, theguardian.com, npr.org, ... (see rss-source-policy.ts)",
      reason: "permission_required — never fetched in this test at all, per the existing license registry",
    },
  ];

  return {
    runAt,
    receivedCounts,
    gdelt: {
      rateLimited: gdeltResult.rateLimited,
      rateLimitedAtCategory: gdeltResult.rateLimitedAtCategory,
      attemptedCategories: gdeltResult.attemptedCategories,
    },
    duplicatesRemoved,
    categoryCounts,
    koreaTaggedCount,
    singleSourceCount,
    multiSourceCount,
    publishableCount,
    excludedSources,
    trends,
  };
}

// Re-exported so the test runner script can print the GDELT query map
// used for this run without duplicating it.
export { NEW_CATEGORY_GDELT_QUERIES };
