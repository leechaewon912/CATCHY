import "server-only";

import Parser from "rss-parser";

import type { Category } from "@/lib/mock-data";
import { domainFromUrl, type SourceAdapter, type SourceArticle } from "@/lib/server/sources/types";

// European Commission Press Corner RSS — see rss-source-policy.ts's
// "eu-press-corner" entry for the license basis (Decision 2011/833/EU,
// commercial reuse allowed with attribution; third-party content/logos
// excluded). Live-verified 2026-10-15: returns real, same-day press
// releases (title/link/pubDate) — unlike Wikinews (license is just as
// clean, CC BY 4.0, but both its RecentChanges and Newpages RSS feeds
// returned zero <item> entries on live test, so no adapter was built for
// it; see rss-source-policy.ts's "wikinews" entry for that record).
const EU_PRESS_CORNER_FEED_URL = "https://ec.europa.eu/commission/presscorner/api/rss?language=en";
const REQUEST_TIMEOUT_MS = 10_000;
// Single small feed fetched at most once per collection run in normal
// operation — this cache only matters for back-to-back manual/dev runs
// within the same process lifetime (e.g. repeated local testing), not a
// cross-request cache (each Vercel invocation starts cold).
const CACHE_TTL_MS = 10 * 60 * 1000;

const parser = new Parser({ timeout: REQUEST_TIMEOUT_MS });

let cache: { fetchedAt: number; articles: SourceArticle[] } | null = null;

// Metadata-only — deliberately ignores item.content/contentSnippet
// (the feed's <description> includes a real excerpt of the press
// release) and any image/enclosure fields, matching the same
// title/url/domain/publishedAt-only shape rss-collect.ts and gdelt.ts
// already use. Never read those fields here.
async function fetchEuPressCornerArticles(): Promise<SourceArticle[]> {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.articles;
  }

  try {
    const feed = await parser.parseURL(EU_PRESS_CORNER_FEED_URL);
    const articles: SourceArticle[] = (feed.items ?? [])
      .filter((item) => item.title && item.link)
      .map((item) => ({
        title: item.title!.trim(),
        url: item.link!,
        domain: domainFromUrl(item.link!),
        publishedAt: item.isoDate ?? item.pubDate ?? new Date().toISOString(),
      }));
    cache = { fetchedAt: Date.now(), articles };
    return articles;
  } catch (error) {
    // Same non-fatal posture as rss-collect.ts's fetchFeed: one source
    // being down never aborts the category or the run, just yields fewer
    // candidate articles. No retry — a single failed attempt just means
    // zero EU articles for this run, picked up again next run.
    console.error("[eu-press-corner] failed to fetch feed", error);
    return [];
  }
}

// EU Press Corner isn't split by Catchy's categories — every category
// would get the same pool of EU policy press releases, which only
// actually fits "글로벌 이슈". collect-trends.ts only calls this adapter
// for that one category; every other category never reaches this file.
export const euPressCornerAdapter: SourceAdapter = {
  id: "eu-press-corner",
  async fetchArticlesForCategory(_: Category): Promise<SourceArticle[]> {
    return fetchEuPressCornerArticles();
  },
};
