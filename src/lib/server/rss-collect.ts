import "server-only";

import Parser from "rss-parser";

import type { Category } from "@/lib/mock-data";
import { getActiveRssFeedsForCategory } from "@/lib/server/rss-sources";

const REQUEST_TIMEOUT_MS = 10_000;
// A courtesy pause between feeds within one category — these are static,
// CDN-served files from large publishers, not a throttled search API
// like GDELT, so this is about not bursting requests rather than
// defending against a documented rate limit.
const RSS_FEED_SPACING_MS = 300;

// Metadata-only, matching the same shape collect-trends.ts's
// clusterArticles already consumes from GDELT — deliberately excludes
// item.content/contentSnippet/summary/enclosure (body text, thumbnails).
// Never read those fields here, even though rss-parser exposes them.
export type RssArticle = {
  title: string;
  url: string;
  domain: string;
  publishedAt: string;
};

const parser = new Parser({ timeout: REQUEST_TIMEOUT_MS });

function domainFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "unknown";
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchFeed(feedUrl: string): Promise<RssArticle[]> {
  try {
    const feed = await parser.parseURL(feedUrl);
    return (feed.items ?? [])
      .filter((item) => item.title && item.link)
      .map((item) => ({
        title: item.title!.trim(),
        url: item.link!,
        domain: domainFromUrl(item.link!),
        publishedAt: item.isoDate ?? item.pubDate ?? new Date().toISOString(),
      }));
  } catch (error) {
    // A single feed being down/moved/malformed shouldn't fail the whole
    // category — unlike GDELT's rate limit, there's no "abort the whole
    // run" condition here, just fewer articles for this category.
    console.error(`[rss] failed to fetch ${feedUrl}`, error);
    return [];
  }
}

export async function fetchRssArticlesForCategory(category: Category): Promise<RssArticle[]> {
  const feeds = getActiveRssFeedsForCategory(category);
  const articles: RssArticle[] = [];

  for (let i = 0; i < feeds.length; i += 1) {
    if (i > 0) {
      await delay(RSS_FEED_SPACING_MS);
    }
    articles.push(...(await fetchFeed(feeds[i])));
  }

  return articles;
}
