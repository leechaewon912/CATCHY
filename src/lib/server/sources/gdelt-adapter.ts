import "server-only";

import type { Category } from "@/lib/mock-data";
import { fetchGdeltArticlesForCategory, GdeltRateLimitedError } from "@/lib/server/gdelt";
import type { SourceAdapter, SourceArticle } from "@/lib/server/sources/types";

// Wraps the existing GDELT collection logic (src/lib/server/gdelt.ts) in
// the common SourceAdapter shape, per the requirement that GDELT only
// ever be used as a reviewed candidate — never the default or sole
// collection source — and that doing so needs its own cache/spacing/
// failure handling. gdelt.ts's own fetch/rate-limit logic is untouched
// here (same single-attempt-no-retry posture, same
// GdeltRateLimitedError), this file only adds a short in-memory cache on
// top so repeated calls within one process don't re-hit GDELT's already
// fragile rate limit. NOT called anywhere in the default collect-trends
// flow — collect-trends.ts's own existing `source === "gdelt"` opt-in
// path (?source=gdelt) still goes straight to fetchGdeltArticlesForCategory,
// unchanged. This adapter exists so a future, deliberate decision to add
// GDELT into a multi-source run has a ready, conformant, already-cached
// entry point to use instead of wiring gdelt.ts in ad hoc.
const CACHE_TTL_MS = 10 * 60 * 1000;

const cacheByCategory = new Map<Category, { fetchedAt: number; articles: SourceArticle[] }>();

async function fetchGdeltArticlesCached(category: Category): Promise<SourceArticle[]> {
  const cached = cacheByCategory.get(category);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.articles;
  }

  try {
    const articles = await fetchGdeltArticlesForCategory(category);
    const normalized: SourceArticle[] = articles.map((article) => ({
      title: article.title,
      url: article.url,
      domain: article.domain,
      publishedAt: article.publishedAt,
    }));
    cacheByCategory.set(category, { fetchedAt: Date.now(), articles: normalized });
    return normalized;
  } catch (error) {
    // GdeltRateLimitedError is the one case gdelt.ts intentionally lets
    // propagate (collect-trends.ts's existing ?source=gdelt path treats
    // it as fatal for the whole run — see collect-trends.ts). Re-throwing
    // here preserves that contract for any future caller of this
    // adapter; any other error is logged and treated as "zero articles",
    // same non-fatal posture as every other adapter in this directory.
    if (error instanceof GdeltRateLimitedError) {
      throw error;
    }
    console.error(`[gdelt-adapter] ${category}: unexpected failure`, error);
    return [];
  }
}

export const gdeltAdapter: SourceAdapter = {
  id: "gdelt-project",
  fetchArticlesForCategory: fetchGdeltArticlesCached,
};
