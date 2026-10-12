import { isAuthorizedAdminRequest } from "@/lib/server/admin-auth";
import { parseCollectionOptionsFromRequest, runDailyTrendCollection } from "@/lib/server/collect-trends";

// Manual trigger for daily trend collection. Protected by
// ADMIN_CRON_SECRET — see README for curl examples.
//
// Defaults to the curated RSS feeds in src/lib/server/rss-sources.ts.
// Add `?source=gdelt` to use GDELT instead (kept for manual
// testing/fallback only — see src/lib/server/gdelt.ts for why it's no
// longer the default). Supports `?category=<Korean category>` or
// `?limitCategories=<n>` to run a subset for local testing.
//
// A run's internal time budget (collect-trends.ts) stops starting new
// categories before this runs out, so 60s (the Vercel Hobby max) is
// enough even for a full 7-category run.
export const maxDuration = 60;

export async function POST(request: Request) {
  if (!isAuthorizedAdminRequest(request)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  let options: ReturnType<typeof parseCollectionOptionsFromRequest>;
  try {
    options = parseCollectionOptionsFromRequest(request);
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 400 });
  }

  try {
    const report = await runDailyTrendCollection(options);
    return Response.json(report);
  } catch (error) {
    console.error("[admin/collect-trends] collection run failed", error);
    return Response.json({ error: "collection run failed" }, { status: 500 });
  }
}
