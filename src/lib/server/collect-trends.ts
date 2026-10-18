import "server-only";

import type { Category, SourceType, TrendSource } from "@/lib/mock-data";
import {
  ALL_CATEGORIES,
  CATEGORY_SLUGS,
  fetchGdeltArticlesForCategory,
  GDELT_REQUEST_SPACING_MS,
  GdeltRateLimitedError,
} from "@/lib/server/gdelt";
import { fetchRssArticlesForCategory } from "@/lib/server/rss-collect";
import { CURATED_RSS_DOMAINS } from "@/lib/server/rss-sources";
import { getSourcePolicy, isCommerciallyUsable } from "@/lib/server/rss-source-policy";
import { euPressCornerAdapter } from "@/lib/server/sources/eu-presscorner-adapter";
import { generateTrendDraft, type GenerateTrendDraftOutput } from "@/lib/server/generate-trend-draft";
import { generateTrendDraftWithLlm } from "@/lib/server/generate-trend-with-llm";
import {
  fetchRecentPublishedClusterKeys,
  upsertTrend,
  type UpsertTrendInput,
} from "@/lib/server/db/save-trends";

export type CollectionSource = "rss" | "gdelt";

// A courtesy pause between categories when using RSS — these are static
// publisher files, not a throttled search API, so this is about not
// bursting requests rather than defending against a documented limit
// (contrast with GDELT_REQUEST_SPACING_MS below).
const RSS_CATEGORY_SPACING_MS = 500;

const USAGE_NOTE_BY_SOURCE: Record<CollectionSource, string> = {
  rss: "언론사 공식 RSS로 발견된 출처 — 사실관계 교차 확인용으로만 참고하며, 원문 문장이나 이미지는 인용하지 않음.",
  gdelt: "GDELT로 발견된 출처 — 사실관계 교차 확인용으로만 참고하며, 원문 문장이나 이미지는 인용하지 않음.",
};

// Appended to a trend's sources only when it was collected via
// source==="gdelt" (never the default path — see
// parseCollectionOptionsFromRequest). This is a data-provider credit for
// the GDELT Project itself (required by its license, see
// rss-source-policy.ts's "gdelt-project" entry), not a corroborating
// article — sourceType "reference" keeps it out of
// hasOfficialOrPlatformSource's gate, and the trend detail page renders
// sourceType "reference" separately from the "참고 출처" article list so
// it never reads as "another original-article source".
// Only "글로벌 이슈" gets this merged in (see the call site below) — the
// EU Press Corner feed is EU policy press releases, which doesn't fit
// any other category. Non-fatal: a failure here never aborts the
// category or the run, same posture as a single RSS feed failing (see
// rss-collect.ts's fetchFeed) — it just means zero EU articles get added
// this run. Note this single-domain source can't clear
// MIN_DISTINCT_DOMAINS on its own (see rss-source-policy.ts's
// "eu-press-corner" entry) — it only ever helps corroborate alongside a
// second independent domain, never carries a cluster alone.
async function fetchSupplementaryGlobalIssuesArticles(): Promise<ClusterableArticle[]> {
  try {
    return await euPressCornerAdapter.fetchArticlesForCategory("글로벌 이슈");
  } catch (error) {
    console.error("[collect-trends] EU Press Corner fetch failed, continuing without it", error);
    return [];
  }
}

function buildGdeltAttributionSource(nowIso: string): TrendSource | null {
  const policy = getSourcePolicy("gdelt-project");
  if (!policy) return null;
  return {
    sourceName: "GDELT Project",
    sourceType: "reference",
    originalTitle: "GDELT Project",
    originalUrl: policy.tosUrl,
    publishedAt: nowIso,
    usageNote: "트렌드 수집에 사용된 GDELT 데이터셋 출처 표시 — 원문 기사 출처가 아님.",
  };
}

// Shared input shape for clustering — intentionally narrower than either
// RssArticle or GdeltArticle so clusterArticles works with either source
// unmodified.
type ClusterableArticle = {
  title: string;
  url: string;
  domain: string;
  publishedAt: string;
};

// Ceiling on *new* published trends per category per day (a category
// normally gets exactly one run per day via the cron fan-out — see
// /api/cron/daily-trends/route.ts), not a target — 0 through 6 are all
// normal outcomes depending on how many qualifying (2+ domain) clusters
// a given day's RSS feeds actually have. Deliberately NOT a total
// storage cap: older-dated trends are never deleted to make room for
// new ones — see the project history for why that used to happen and
// was removed (it silently deleted prior days' published trends,
// including ones a manual re-run of a category the same day could
// trigger).
const MAX_PUBLISHED_PER_CATEGORY = 6;
// How far back to look for "is this the same story already published"
// when deciding whether a candidate cluster is a duplicate (see
// isDuplicateClusterKey below). A cluster's key depends on which
// article happened to anchor it that run (clusterKeyFromTokens), so the
// same real-world story can get a different key on a same-day rerun or
// the next day's run — comparing against a short recent window (not
// just today) catches both.
const DUPLICATE_CHECK_WINDOW_DAYS = 3;
// The quality/fact-check bar for ordinary press RSS: a single outlet's
// framing of a story isn't enough on its own, so publishing requires
// 2+ independently-domained sources agreeing on it. This is NOT a
// license requirement (it predates and is unrelated to the commercial-
// use audit in rss-source-policy.ts) — see SINGLE_SOURCE_OFFICIAL_ENABLED
// below for the one deliberate exception to it.
const MIN_DISTINCT_DOMAINS = 2;
const CLUSTER_SIMILARITY_THRESHOLD = 0.3;
const MAX_SOURCES_PER_TREND = 5;

// Exception to MIN_DISTINCT_DOMAINS: a cluster backed by exactly one
// source may still publish if that source is both (a) classified
// "official" (classifySourceType below — a government/international
// institution, not a press outlet) and (b) independently confirmed
// commercially-usable in the license registry (rss-source-policy.ts's
// isCommerciallyUsable). Unlike the 2+-domain bar, this one IS purely
// about license confidence: a single authoritative institutional
// source whose reuse terms are actually confirmed doesn't need a second
// outlet's corroboration the way a random press RSS item does. Default
// enabled; set RSS_ALLOW_SINGLE_SOURCE_OFFICIAL=false to turn it off
// instead of changing code if this policy needs to be revisited.
const SINGLE_SOURCE_OFFICIAL_ENABLED = process.env.RSS_ALLOW_SINGLE_SOURCE_OFFICIAL !== "false";

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
  // ec.europa.eu, not europa.eu, is the actual domain on European
  // Commission Press Corner article links (see
  // sources/eu-presscorner-adapter.ts) — added alongside that adapter so
  // its articles are correctly classified as official rather than
  // falling through to "media".
  "ec.europa.eu",
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
  // Curated RSS domains (src/lib/server/rss-sources.ts) were each
  // individually vetted as a reputable outlet at curation time — that
  // trust call already happened, so they satisfy the official/platform
  // gate the same way a hand-picked GDELT domain would, without
  // needing every one of them re-listed in PLATFORM_DOMAINS below.
  if (PLATFORM_DOMAINS.has(normalized) || CURATED_RSS_DOMAINS.has(normalized)) {
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
  articles: ClusterableArticle[];
};

export type TrendCluster = {
  category: Category;
  clusterKey: string;
  sources: Array<TrendSource & { domain: string }>;
  distinctDomainCount: number;
  hasOfficialOrPlatform: boolean;
  // true only for a 1-domain cluster whose lone source is both
  // classified "official" and independently license-confirmed (see
  // SINGLE_SOURCE_OFFICIAL_ENABLED above) — the one case
  // rankPublishableClusters lets through below MIN_DISTINCT_DOMAINS.
  singleSourceEligible: boolean;
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

// Groups same-story articles from either source (RSS or GDELT — both
// satisfy ClusterableArticle) together: each incoming article joins the
// first existing cluster whose anchor title's token set it's similar
// enough to (Jaccard >= threshold), otherwise it starts a new cluster.
// The anchor stays fixed (the first article's tokens) rather than
// growing with every addition, so clusters don't drift onto a different
// topic as more articles join.
export function clusterArticles(
  category: Category,
  articles: ClusterableArticle[],
  source: CollectionSource,
): TrendCluster[] {
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
    const byDomain = new Map<string, ClusterableArticle>();
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
        usageNote: USAGE_NOTE_BY_SOURCE[source],
        domain: article.domain,
      }),
    );

    const singleSourceEligible =
      SINGLE_SOURCE_OFFICIAL_ENABLED &&
      byDomain.size === 1 &&
      sources.length === 1 &&
      sources[0].sourceType === "official" &&
      isCommerciallyUsable(sources[0].domain);

    return {
      category,
      clusterKey: clusterKeyFromTokens(cluster.anchorTokens, cluster.articles[0]?.title ?? "topic"),
      sources,
      distinctDomainCount: byDomain.size,
      hasOfficialOrPlatform: sources.some((source) => source.sourceType !== "media"),
      singleSourceEligible,
    };
  });
}

// Only clusters confirmed by >=2 distinct domains — or, as a deliberate
// exception, a single license-confirmed official-institution source
// (singleSourceEligible, see clusterArticles above and
// SINGLE_SOURCE_OFFICIAL_ENABLED) — are candidates for publishing. This
// is the code-enforced version of this project's
// hasEnoughSources/hasOfficialOrPlatformSource gate (see
// src/lib/trend-validation.ts, which mirrors this same single-source
// exception so a trend saved under it doesn't get filtered back out when
// read). Official/platform-backed clusters are preferred; within that,
// bigger clusters (more corroborating domains) win. Deliberately NOT
// sliced to MAX_PUBLISHED_PER_CATEGORY here — the caller slices after
// filtering out duplicates of already-published stories, so a duplicate
// doesn't waste one of the category's publish slots.
export function rankPublishableClusters(clusters: TrendCluster[]): TrendCluster[] {
  return clusters
    .filter((cluster) => cluster.distinctDomainCount >= MIN_DISTINCT_DOMAINS || cluster.singleSourceEligible)
    .sort((a, b) => {
      const officialDiff = Number(b.hasOfficialOrPlatform) - Number(a.hasOfficialOrPlatform);
      if (officialDiff !== 0) return officialDiff;
      return b.distinctDomainCount - a.distinctDomainCount;
    });
}

// A cluster's key is a handful of tokens from whichever article
// happened to anchor it (clusterKeyFromTokens) — not a stable id for
// the underlying story. Reusing the same Jaccard-similarity approach
// clusterArticles uses for titles, but over clusterKeys, catches the
// same story recurring under a different key (e.g. "apple-home-smart"
// vs "apple-event-expect-home" for the same Apple event).
function isDuplicateClusterKey(candidateKey: string, knownKeys: string[]): boolean {
  const candidateTokens = new Set(candidateKey.split("-").filter(Boolean));
  return knownKeys.some((knownKey) => {
    const knownTokens = new Set(knownKey.split("-").filter(Boolean));
    return jaccardSimilarity(candidateTokens, knownTokens) >= CLUSTER_SIMILARITY_THRESHOLD;
  });
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
  // Cleared the domain-count gate but wasn't published anyway — either
  // it looked like a duplicate of an already-published story (see
  // isDuplicateClusterKey), or the category already hit
  // MAX_PUBLISHED_PER_CATEGORY for this run.
  skippedAsDuplicateOrOverCap: number;
};

export type CollectionReport = {
  startedAt: string;
  finishedAt: string;
  source: CollectionSource;
  categories: CategoryCollectionSummary[];
  // Categories never attempted this run — either because a rate limit
  // aborted the run early, or the time budget ran out first.
  skippedCategories: Category[];
  abortedDueToRateLimit: boolean;
  rateLimitedCategory?: Category;
};

export type RunCollectionOptions = {
  // "rss" (default) uses the curated publisher feeds in
  // src/lib/server/rss-sources.ts. "gdelt" is opt-in only — see
  // parseCollectionOptionsFromRequest's `?source=gdelt` — kept for
  // manual testing/fallback now that GDELT has proven too rate-limit
  // prone for the default daily run (see README).
  source?: CollectionSource;
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
// /api/cron/daily-trends call: fetch candidate articles per category
// (RSS by default; GDELT only when explicitly requested — see
// CollectionSource above and the README), cluster them, keep only
// clusters with >=2 distinct domains, generate stub learning content
// (src/lib/server/generate-trend-draft.ts) for up to 3 per category,
// and upsert them into Supabase.
//
// Two distinct "stop early" conditions, handled differently:
// - Time budget exceeded: a normal, healthy outcome. Whatever was
//   already collected for earlier categories in this run is still
//   persisted; remaining categories are just skipped and picked up next
//   run.
// - GDELT rate limit (429 / "please limit requests") hit on any
//   category, when source is "gdelt": treated as fatal for the *whole*
//   run. Nothing collected this run — including earlier, successful
//   categories — is persisted, since a run that got rate-limited
//   partway through isn't a reliable sample. No partial saves. The RSS
//   path has no equivalent condition — a single feed failing just means
//   fewer articles for that category (see rss-collect.ts).
export async function runDailyTrendCollection(
  options: RunCollectionOptions = {},
): Promise<CollectionReport> {
  const source = options.source ?? "rss";
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
      await delay(source === "gdelt" ? GDELT_REQUEST_SPACING_MS : RSS_CATEGORY_SPACING_MS);
    }

    let articles: ClusterableArticle[];
    if (source === "gdelt") {
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
    } else {
      articles = await fetchRssArticlesForCategory(category);
      if (category === "글로벌 이슈") {
        articles = [...articles, ...(await fetchSupplementaryGlobalIssuesArticles())];
      }
    }

    const clusters = clusterArticles(category, articles, source);
    const ranked = rankPublishableClusters(clusters);

    const sinceIso = new Date(
      startedAt.getTime() - DUPLICATE_CHECK_WINDOW_DAYS * 24 * 60 * 60 * 1000,
    ).toISOString();
    const knownKeys = await fetchRecentPublishedClusterKeys(category, sinceIso);

    const publishable: TrendCluster[] = [];
    for (const cluster of ranked) {
      if (publishable.length >= MAX_PUBLISHED_PER_CATEGORY) break;
      if (isDuplicateClusterKey(cluster.clusterKey, knownKeys)) {
        console.log(
          `[collect-trends] ${category}/${cluster.clusterKey}: skipping — looks like a duplicate of an already-published story`,
        );
        continue;
      }
      publishable.push(cluster);
      knownKeys.push(cluster.clusterKey);
    }

    const published: string[] = [];
    for (let index = 0; index < publishable.length; index += 1) {
      const cluster = publishable[index];
      const id = trendIdFor(category, cluster.clusterKey, dateStamp);

      // LLM generation only runs for clusters that already cleared
      // rankPublishableClusters + the duplicate filter above, never for
      // the full candidate list — keeps LLM spend bounded to at most
      // MAX_PUBLISHED_PER_CATEGORY calls per category per run.
      let content: GenerateTrendDraftOutput | null = await generateTrendDraftWithLlm({
        category,
        clusterKey: cluster.clusterKey,
        articles: cluster.sources.map((source) => ({
          title: source.originalTitle,
          sourceName: source.sourceName,
          originalUrl: source.originalUrl,
          publishedAt: source.publishedAt,
        })),
      });

      if (content) {
        console.log(`[collect-trends] ${id}: generated via LLM`);
      } else {
        console.log(`[collect-trends] ${id}: LLM unavailable or failed — falling back to template`);
        content = await generateTrendDraft({
          category,
          clusterKey: cluster.clusterKey,
          variantIndex: index,
          sourceCount: cluster.sources.length,
          domainCount: cluster.distinctDomainCount,
        });
      }

      const sources: TrendSource[] = cluster.sources.map((source) => ({
        sourceName: source.sourceName,
        sourceType: source.sourceType,
        originalTitle: source.originalTitle,
        originalUrl: source.originalUrl,
        publishedAt: source.publishedAt,
        usageNote: source.usageNote,
      }));

      // Appended after the corroborating-article sources above (not
      // counted against MAX_SOURCES_PER_TREND, which already ran inside
      // clusterArticles) — only present for source==="gdelt" runs.
      if (source === "gdelt") {
        const attribution = buildGdeltAttributionSource(startedAt.toISOString());
        if (attribution) sources.push(attribution);
      }

      pendingSaves.push({ id, category, clusterKey: cluster.clusterKey, status: "published", content, sources });
      published.push(id);
    }

    categorySummaries.push({
      category,
      articlesFetched: articles.length,
      clustersFound: clusters.length,
      published,
      skippedForTooFewDomains: clusters.length - ranked.length,
      skippedAsDuplicateOrOverCap: ranked.length - publishable.length,
    });
  }

  if (abortedDueToRateLimit) {
    return {
      startedAt: startedAt.toISOString(),
      finishedAt: new Date().toISOString(),
      source,
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
    source,
    categories: categorySummaries,
    skippedCategories,
    abortedDueToRateLimit: false,
  };
}

// Shared by both routes so `?category=<Korean category>`,
// `?limitCategories=<n>`, or `?source=gdelt` work the same way for
// manual admin testing and the cron trigger. `source` defaults to
// "rss" whenever the param is absent or anything other than exactly
// "gdelt" — GDELT only ever runs when explicitly asked for.
export function parseCollectionOptionsFromRequest(request: Request): RunCollectionOptions {
  const url = new URL(request.url);
  const categoryParam = url.searchParams.get("category")?.trim();
  const limitParam = url.searchParams.get("limitCategories");
  const source: CollectionSource = url.searchParams.get("source") === "gdelt" ? "gdelt" : "rss";

  if (categoryParam) {
    if (!(ALL_CATEGORIES as string[]).includes(categoryParam)) {
      throw new Error(
        `invalid category "${categoryParam}" — expected one of: ${ALL_CATEGORIES.join(", ")}`,
      );
    }
    return { source, categories: [categoryParam as Category] };
  }

  if (limitParam) {
    const limitCategories = Number.parseInt(limitParam, 10);
    if (!Number.isFinite(limitCategories) || limitCategories <= 0) {
      throw new Error(`invalid limitCategories "${limitParam}" — expected a positive integer`);
    }
    return { source, limitCategories };
  }

  return { source };
}
