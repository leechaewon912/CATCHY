import type { Category } from "@/lib/mock-data";
import { ALL_CATEGORIES } from "@/lib/server/gdelt";
import { isAuthorizedAdminRequest } from "@/lib/server/admin-auth";
import { parseCollectionOptionsFromRequest, runDailyTrendCollection } from "@/lib/server/collect-trends";

// Vercel Cron hits this with GET (see vercel.json: "0 0 * * *" UTC =
// 09:00 KST). Protected by the same ADMIN_CRON_SECRET bearer check as
// /api/admin/collect-trends — for Vercel's automatic
// `Authorization: Bearer $CRON_SECRET` header to satisfy this check,
// set a `CRON_SECRET` env var in the Vercel project with the same value
// as ADMIN_CRON_SECRET.
//
// Runs the curated RSS feeds (src/lib/server/rss-sources.ts) by
// default — GDELT proved too rate-limit prone in production to run
// unattended, see the README. Add `?source=gdelt` to this path in
// vercel.json only for manual fallback testing, not as the standing
// schedule.
export const maxDuration = 60;

// A single in-process run across all 7 categories (what this endpoint
// used to do directly) reliably exceeds the Vercel Hobby plan's 60s
// maxDuration — confirmed in production on 2026-10-13 (504
// FUNCTION_INVOCATION_TIMEOUT), since the two-step LLM generation
// (src/lib/server/generate-trend-with-llm.ts, up to several retries
// per cluster) can take 30-60s for a single heavy category on its own.
//
// Hobby's cron limits (max 2 cron jobs, no more than once/day each)
// rule out spreading categories across multiple separate cron entries.
// Instead, a *full* run (no ?category=/?limitCategories= — i.e.
// exactly what Vercel's unparameterized daily trigger sends) fans out
// one independent self-invocation of /api/admin/collect-trends per
// category: each is its own serverless function instance with its own
// fresh 60s budget, so one slow/failing category can never make
// another time out or fail. This endpoint only confirms each category
// was *dispatched*, not that it finished — check Supabase or call
// /api/admin/collect-trends?category=<X> directly for a category's own
// full report.
//
// A scoped request (?category=X and/or ?source=gdelt, e.g. for manual
// testing) is small enough to finish well within 60s on its own, so it
// still runs in-process exactly as before — no fan-out needed.
async function dispatchCategory(
  category: Category,
  baseUrl: string,
  secret: string,
  source: "rss" | "gdelt",
): Promise<{ category: Category; dispatched: boolean; error?: string }> {
  const url = new URL("/api/admin/collect-trends", baseUrl);
  url.searchParams.set("category", category);
  if (source === "gdelt") {
    url.searchParams.set("source", "gdelt");
  }

  try {
    await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${secret}` },
      // Only waits long enough to confirm Vercel accepted and started
      // the request — an abort here does NOT cancel the target
      // invocation, which keeps running independently to completion on
      // its own instance regardless of whether this caller is still
      // waiting.
      signal: AbortSignal.timeout(8_000),
    });
    return { category, dispatched: true };
  } catch (error) {
    // AbortError from the 8s timeout above is the expected/normal case
    // (we deliberately don't wait for the category to finish) — only a
    // non-abort error means dispatch itself genuinely failed.
    if (error instanceof Error && error.name === "AbortError") {
      return { category, dispatched: true };
    }
    return { category, dispatched: false, error: (error as Error).message };
  }
}

export async function GET(request: Request) {
  if (!isAuthorizedAdminRequest(request)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  let options: ReturnType<typeof parseCollectionOptionsFromRequest>;
  try {
    options = parseCollectionOptionsFromRequest(request);
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 400 });
  }

  const isFullRun = !options.categories && !options.limitCategories;

  if (!isFullRun) {
    try {
      const report = await runDailyTrendCollection(options);
      return Response.json(report);
    } catch (error) {
      console.error("[cron/daily-trends] collection run failed", error);
      return Response.json({ error: "collection run failed" }, { status: 500 });
    }
  }

  const secret = process.env.ADMIN_CRON_SECRET;
  if (!secret) {
    // isAuthorizedAdminRequest already guarantees this is set (it's the
    // same env var), so this is unreachable in practice — kept only so
    // the fan-out fails loudly instead of silently if that ever changes.
    return Response.json({ error: "ADMIN_CRON_SECRET not configured" }, { status: 500 });
  }

  const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : new URL(request.url).origin;

  const results = await Promise.all(
    ALL_CATEGORIES.map((category) => dispatchCategory(category, baseUrl, secret, options.source ?? "rss")),
  );

  return Response.json({
    mode: "fan-out",
    note: "Each category was dispatched as an independent invocation of /api/admin/collect-trends and runs to completion on its own — this response only confirms dispatch, not completion. Check Supabase, or call /api/admin/collect-trends?category=<X> directly, for a category's own result.",
    results,
  });
}
