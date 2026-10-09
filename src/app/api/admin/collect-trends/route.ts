import { isAuthorizedAdminRequest } from "@/lib/server/admin-auth";
import { parseCollectionOptionsFromRequest, runDailyTrendCollection } from "@/lib/server/collect-trends";

// Manual trigger for the GDELT-based daily trend collection. Protected
// by ADMIN_CRON_SECRET — see README for curl examples.
//
// Supports `?category=<Korean category>` or `?limitCategories=<n>` to
// run a subset for local testing — GDELT rate-limits aggressively (see
// src/lib/server/gdelt.ts), so avoid running this repeatedly without a
// category/limitCategories filter.
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
