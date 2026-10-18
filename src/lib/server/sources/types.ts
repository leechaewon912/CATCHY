import "server-only";

import type { Category } from "@/lib/mock-data";

// Shared shape every collection adapter (RSS, GDELT, a public-institution
// API, ...) must normalize its output to before it reaches
// clusterArticles in collect-trends.ts — title/url/domain/publishedAt
// only. No body text, no images, no thumbnails, ever: this is the one
// place that shape is enforced for every source, not just RSS.
export type SourceArticle = {
  title: string;
  url: string;
  domain: string;
  publishedAt: string;
};

// A collection source, normalized to the same interface regardless of
// what it fetches from underneath (an RSS feed, GDELT's DOC 2.0 API, an
// institution's own JSON/XML API, ...). `id` should match a sourceId in
// rss-source-policy.ts so the license this adapter operates under is
// always traceable back to a recorded verdict.
export type SourceAdapter = {
  id: string;
  fetchArticlesForCategory(category: Category): Promise<SourceArticle[]>;
};

export function domainFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "unknown";
  }
}
