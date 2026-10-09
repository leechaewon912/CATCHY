import { isAuthorizedAdminRequest } from "@/lib/server/admin-auth";
import { parseCollectionOptionsFromRequest, runDailyTrendCollection } from "@/lib/server/collect-trends";

// Vercel Cron hits this with GET (see vercel.json: "0 0 * * *" UTC =
// 09:00 KST). Protected by the same ADMIN_CRON_SECRET bearer check as
// /api/admin/collect-trends — for Vercel's automatic
// `Authorization: Bearer $CRON_SECRET` header to satisfy this check,
// set a `CRON_SECRET` env var in the Vercel project with the same value
// as ADMIN_CRON_SECRET.
//
// runDailyTrendCollection's internal time budget (collect-trends.ts)
// stops starting new categories well before this runs out, so a run
// always finishes within the Vercel Hobby plan's 60s maxDuration cap
// instead of relying on a higher-tier plan. If GDELT turns out to need
// more than one run per day to cover all 7 categories, add
// `?limitCategories=n` to the path in vercel.json to spread collection
// across more frequent, narrower triggers.
export const maxDuration = 60;

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

  try {
    const report = await runDailyTrendCollection(options);
    return Response.json(report);
  } catch (error) {
    console.error("[cron/daily-trends] collection run failed", error);
    return Response.json({ error: "collection run failed" }, { status: 500 });
  }
}
