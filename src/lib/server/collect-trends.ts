import "server-only";

import type { Category, SourceType, TrendSource } from "@/lib/mock-data";
import {
  ALL_CATEGORIES,
  CATEGORY_SLUGS,
  fetchGdeltArticlesForCategory,
  GDELT_REQUEST_SPACING_MS,
  GdeltRateLimitedError,
  type GdeltArticle,
} from "@/lib/server/gdelt";
import { generateTrendDraft } from "@/lib/server/generate-trend-draft";
import { upsertTrend, type UpsertTrendInput } from "@/lib/server/db/save-trends";

// Ceiling, not a target — 0, 1, or 2 published per category is a normal
// outcome when GDELT has fewer qualifying (2+ domain) clusters that
// run, not a failure. Nothing downstream assumes exactly 3.
const MAX_PUBLISHED_PER_CATEGORY = 3;
const MIN_DISTINCT_DOMAINS = 2;
const CLUSTER_SIMILARITY_THRESHOLD = 0.3;
const MAX_SOURCES_PER_TREND = 5;

const STOPWORDS = new Set([
  "about",
  "after",
  "again",
  "against",
  "amid",
  "amid",
  "amidst",
  "amount",
  "amounts",
  "announce",
  "announces",
  "announced",
  "could",
  "during",
  "every",
  "first",
  "from",
  "have",
  "into",
  "latest",
  "more",
  "most",
  "news",
  "over",
  "says",
  "should",
  "since",
  "than",
  "that",
  "their",
  "there",
  "these",
  "they",
  "this",
  "those",
  "through",
  "today",
  "update",
  "updates",
  "were",
  "what",
  "when",
  "where",
  "which",
  "while",
  "will",
  "with",
  "would",
]);

// A small set of domains we're confident are self-publishing official
// sources (leagues, agencies, government/intl bodies) or major chart /
// streaming platforms. Everything else defaults to "media" — this is a
// conservative heuristic: misclassifying an official source as "media"
// only makes a cluster harder to publish, it never lets an unverified
// source masquerade as official.
const OFFICIAL_DOMAINS = new Set([
  "nba.com",
  "fifa.com",
  "uefa.com",
  "olympics.com",
  "grammy.com",
  "oscars.org",
  "emmys.com",
  "un.org",
  "who.int",
  "nasa.gov",
  "whitehouse.gov",
  "europa.eu",
]);

const PLATFORM_DOMAINS = new Set([
  "netflix.com",
  "spotify.com",
  "youtube.com",
  "billboard.com",
  "tiktok.com",
  "github.com",
  "huggingface.co",
  "store.steampowered.com",
]);

function classifySourceType(domain: string): SourceType {
  const normalized = domain.toLowerCase();
  if (
    OFFICIAL_DOMAINS.has(normalized) ||
    normalized.endsWith(".gov") ||
    normalized.endsWith(".int")
  ) {
    return "official";
  }
  if (PLATFORM_DOMAINS.has(normalized)) {
    return "platform";
  }
  return "media";
}

function tokenize(title: string): Set<string> {
  return new Set(
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((token) => token.length >= 4 && !STOPWORDS.has(token)),
  );
}

function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  for (const token of a) {
    if (b.has(token)) intersection += 1;
  }
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

type ArticleCluster = {
  anchorTokens: Set<string>;
  articles: GdeltArticle[];
};

export type TrendCluster = {
  category: Category;
  clusterKey: string;
  sources: Array<TrendSource & { domain: string }>;
  distinctDomainCount: number;
  hasOfficialOrPlatform: boolean;
};

function clusterKeyFromTokens(tokens: Set<string>, fallbackTitle: string): string {
  const key = [...tokens].sort().slice(0, 4).join("-");
  if (key) return key;
  return fallbackTitle
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .split(/\s+/)
    .slice(0, 4)
    .join("-");
}

// Groups GDELT articles that look like the same underlying story: each
// incoming article joins the first existing cluster whose anchor title's
// token set it's similar enough to (Jaccard >= threshold), otherwise it
// starts a new cluster. The anchor stays fixed (the first article's
// tokens) rather than growing with every addition, so clusters don't
// drift onto a different topic as more articles join.
export function clusterArticles(category: Category, articles: GdeltArticle[]): TrendCluster[] {
  const clusters: ArticleCluster[] = [];

  for (const article of articles) {
    const tokens = tokenize(article.title);
    let best: { cluster: ArticleCluster; score: number } | null = null;

    for (const cluster of clusters) {
      const score = jaccardSimilarity(tokens, cluster.anchorTokens);
      if (score >= CLUSTER_SIMILARITY_THRESHOLD && (!best || score > best.score)) {
        best = { cluster, score };
      }
    }

    if (best) {
      best.cluster.articles.push(article);
    } else {
      clusters.push({ anchorTokens: tokens, articles: [article] });
    }
  }

  return clusters.map((cluster) => {
    const byDomain = new Map<string, GdeltArticle>();
    for (const article of cluster.articles) {
      if (!byDomain.has(article.domain)) {
        byDomain.set(article.domain, article);
      }
    }

    const representativeArticles = [...byDomain.values()]
      .sort((a, b) => {
        const aOfficial = classifySourceType(a.domain) !== "media" ? 1 : 0;
        const bOfficial = classifySourceType(b.domain) !== "media" ? 1 : 0;
        return bOfficial - aOfficial;
      })
      .slice(0, MAX_SOURCES_PER_TREND);

    const sources: Array<TrendSource & { domain: string }> = representativeArticles.map(
      (article) => ({
        sourceName: article.domain,
        sourceType: classifySourceType(article.domain),
        originalTitle: article.title,
        originalUrl: article.url,
        publishedAt: article.publishedAt,
        usageNote:
          "GDELT로 발견된 출처 — 사실관계 교차 확인용으로만 참고하며, 원문 문장이나 이미지는 인용하지 않음.",
        domain: article.domain,
      }),
    );

    return {
      category,
      clusterKey: clusterKeyFromTokens(cluster.anchorTokens, cluster.articles[0]?.title ?? "topic"),
      sources,
      distinctDomainCount: byDomain.size,
      hasOfficialOrPlatform: sources.some((source) => source.sourceType !== "media"),
    };
  });
}

// Only clusters confirmed by >=2 distinct domains are even candidates
// for publishing — this is the code-enforced version of this project's
// hasEnoughSources/hasOfficialOrPlatformSource gate (see
// src/lib/trend-validation.ts), applied before any content is written.
// Official/platform-backed clusters are preferred; within that, bigger
// clusters (more corroborating domains) win. At most
// MAX_PUBLISHED_PER_CATEGORY per category.
export function selectPublishableClusters(clusters: TrendCluster[]): TrendCluster[] {
  return clusters
    .filter((cluster) => cluster.distinctDomainCount >= MIN_DISTINCT_DOMAINS)
    .sort((a, b) => {
      const officialDiff = Number(b.hasOfficialOrPlatform) - Number(a.hasOfficialOrPlatform);
      if (officialDiff !== 0) return officialDiff;
      return b.distinctDomainCount - a.distinctDomainCount;
    })
    .slice(0, MAX_PUBLISHED_PER_CATEGORY);
}

// Asia/Seoul has no DST, so this is a fixed +9h offset from UTC.
function kstDateStamp(date: Date): string {
  const kst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  const year = kst.getUTCFullYear();
  const month = String(kst.getUTCMonth() + 1).padStart(2, "0");
  const day = String(kst.getUTCDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

function trendIdFor(category: Category, clusterKey: string, dateStamp: string): string {
  return `${CATEGORY_SLUGS[category]}-${clusterKey}-${dateStamp}`;
}

export type CategoryCollectionSummary = {
  category: Category;
  articlesFetched: number;
  clustersFound: number;
  published: string[];
  skippedForTooFewDomains: number;
};

export type CollectionReport = {
  startedAt: string;
  finishedAt: string;
  categories: CategoryCollectionSummary[];
  // Categories never attempted this run — either because a rate limit
  // aborted the run early, or the time budget ran out first.
  skippedCategories: Category[];
  abortedDueToRateLimit: boolean;
  rateLimitedCategory?: Category;
};

export type RunCollectionOptions = {
  // Restrict to specific categories (e.g. for local single-category
  // testing). Takes precedence over limitCategories.
  categories?: Category[];
  // Only run the first N of ALL_CATEGORIES. Ignored if categories is set.
  limitCategories?: number;
  // Stop starting new categories once this much time has elapsed, so a
  // single run can't overrun a serverless function's time limit. The
  // default leaves headroom under a 60s Vercel Hobby maxDuration even in
  // the worst case (one more in-flight request timing out at 15s).
  timeBudgetMs?: number;
};

const DEFAULT_TIME_BUDGET_MS = 40_000;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function resolveTargetCategories(options: RunCollectionOptions): Category[] {
  if (options.categories && options.categories.length > 0) {
    return options.categories;
  }
  if (options.limitCategories && options.limitCategories > 0) {
    return ALL_CATEGORIES.slice(0, options.limitCategories);
  }
  return ALL_CATEGORIES;
}

// The single entry point both /api/admin/collect-trends and
// /api/cron/daily-trends call: fetch GDELT candidates per category,
// cluster them, keep only clusters with >=2 distinct domains, generate
// stub learning content (src/lib/server/generate-trend-draft.ts) for up
// to 3 per category, and upsert them into Supabase.
//
// Two distinct "stop early" conditions, handled differently:
// - Time budget exceeded: a normal, healthy outcome. Whatever was
//   already collected for earlier categories in this run is still
//   persisted; remaining categories are just skipped and picked up next
//   run.
// - GDELT rate limit (429 / "please limit requests") hit on any
//   category: treated as fatal for the *whole* run. Nothing collected
//   this run — including earlier, successful categories — is persisted,
//   since a run that got rate-limited partway through isn't a reliable
//   sample. No partial saves.
export async function runDailyTrendCollection(
  options: RunCollectionOptions = {},
): Promise<CollectionReport> {
  const startedAt = new Date();
  const timeBudgetMs = options.timeBudgetMs ?? DEFAULT_TIME_BUDGET_MS;
  const targetCategories = resolveTargetCategories(options);
  const dateStamp = kstDateStamp(startedAt);

  const categorySummaries: CategoryCollectionSummary[] = [];
  const skippedCategories: Category[] = [];
  const pendingSaves: UpsertTrendInput[] = [];

  let abortedDueToRateLimit = false;
  let rateLimitedCategory: Category | undefined;

  for (let i = 0; i < targetCategories.length; i += 1) {
    const category = targetCategories[i];

    if (Date.now() - startedAt.getTime() >= timeBudgetMs) {
      skippedCategories.push(...targetCategories.slice(i));
      break;
    }

    if (i > 0) {
      await delay(GDELT_REQUEST_SPACING_MS);
    }

    let articles: GdeltArticle[];
    try {
      articles = await fetchGdeltArticlesForCategory(category);
    } catch (error) {
      if (error instanceof GdeltRateLimitedError) {
        console.error(
          `[collect-trends] ${error.message} — aborting run, nothing collected so far will be saved`,
        );
        abortedDueToRateLimit = true;
        rateLimitedCategory = category;
        skippedCategories.push(...targetCategories.slice(i + 1));
        break;
      }
      throw error;
    }

    const clusters = clusterArticles(category, articles);
    const publishable = selectPublishableClusters(clusters);

    const published: string[] = [];
    for (let index = 0; index < publishable.length; index += 1) {
      const cluster = publishable[index];
      const id = trendIdFor(category, cluster.clusterKey, dateStamp);

      const content = await generateTrendDraft({
        category,
        clusterKey: cluster.clusterKey,
        variantIndex: index,
        sourceCount: cluster.sources.length,
        domainCount: cluster.distinctDomainCount,
      });

      const sources: TrendSource[] = cluster.sources.map((source) => ({
        sourceName: source.sourceName,
        sourceType: source.sourceType,
        originalTitle: source.originalTitle,
        originalUrl: source.originalUrl,
        publishedAt: source.publishedAt,
        usageNote: source.usageNote,
      }));

      pendingSaves.push({ id, category, clusterKey: cluster.clusterKey, status: "published", content, sources });
      published.push(id);
    }

    categorySummaries.push({
      category,
      articlesFetched: articles.length,
      clustersFound: clusters.length,
      published,
      skippedForTooFewDomains: clusters.length - publishable.length,
    });
  }

  if (abortedDueToRateLimit) {
    return {
      startedAt: startedAt.toISOString(),
      finishedAt: new Date().toISOString(),
      // Nothing was saved, so report published as empty even for
      // categories that were processed before the rate limit hit.
      categories: categorySummaries.map((summary) => ({ ...summary, published: [] })),
      skippedCategories,
      abortedDueToRateLimit: true,
      rateLimitedCategory,
    };
  }

  for (const save of pendingSaves) {
    try {
      await upsertTrend(save);
    } catch (error) {
      console.error(`[collect-trends] failed to save ${save.id}`, error);
    }
  }

  return {
    startedAt: startedAt.toISOString(),
    finishedAt: new Date().toISOString(),
    categories: categorySummaries,
    skippedCategories,
    abortedDueToRateLimit: false,
  };
}

// Shared by both routes so `?category=<Korean category>` or
// `?limitCategories=<n>` work the same way for manual admin testing and
// (if ever added to vercel.json) the cron trigger.
export function parseCollectionOptionsFromRequest(request: Request): RunCollectionOptions {
  const url = new URL(request.url);
  const categoryParam = url.searchParams.get("category")?.trim();
  const limitParam = url.searchParams.get("limitCategories");

  if (categoryParam) {
    if (!(ALL_CATEGORIES as string[]).includes(categoryParam)) {
      throw new Error(
        `invalid category "${categoryParam}" — expected one of: ${ALL_CATEGORIES.join(", ")}`,
      );
    }
    return { categories: [categoryParam as Category] };
  }

  if (limitParam) {
    const limitCategories = Number.parseInt(limitParam, 10);
    if (!Number.isFinite(limitCategories) || limitCategories <= 0) {
      throw new Error(`invalid limitCategories "${limitParam}" — expected a positive integer`);
    }
    return { limitCategories };
  }

  return {};
}
