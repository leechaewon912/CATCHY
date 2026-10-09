This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## GDELT-based daily trend collection

CATCHY can collect trend candidates from the public [GDELT DOC 2.0
API](https://blog.gdeltproject.org/gdelt-doc-2-0-api-debuts/) (no API
key needed), cluster same-issue articles, keep only clusters backed by
2+ distinct domains, generate stub English-learning content (no OpenAI
key configured yet — see `src/lib/server/generate-trend-draft.ts`), and
upsert up to 3 published trends per category into Supabase. See
`src/lib/server/collect-trends.ts` for the pipeline and
`supabase/schema.sql` for the table shapes.

### Current status (as of 2026-10-09) — waiting on tomorrow's cron

Deployed to Vercel (`catchy-three.vercel.app`), env vars set, Supabase
permissions fixed, auth/pipeline/abort-on-rate-limit logic all verified
working end-to-end against production. **Not yet verified: a real,
non-throttled GDELT response with actual articles.**

Today's manual testing (local sandbox + production) used up enough of
GDELT's rate-limit headroom on both networks that every later attempt
came back `429`/`abortedDueToRateLimit: true` — including after
widening the timespan to 72h and simplifying the queries (see "Query
timespan tuning" below), so that fix itself is still unconfirmed with
real data. Decision: stop manual retries for today and let tomorrow's
scheduled cron (`vercel.json`, `0 0 * * *` UTC = 09:00 KST) be the
first real attempt — it'll hit GDELT from a cold, untested window
instead of one we've already been hammering.

**How to check tomorrow, after 09:00 KST:**

1. Vercel dashboard → the project → Deployments/Functions logs →
   `/api/cron/daily-trends` — confirm it ran and check the JSON
   response body it logged (or check Cron Jobs tab for the invocation
   record). Look specifically at `abortedDueToRateLimit` and
   `articlesFetched` per category.
2. Supabase SQL Editor:
   ```sql
   select id, category, title, status, generated_at
   from trends
   order by generated_at desc
   limit 10;
   ```
   Rows timestamped around 09:00 KST = the cron worked and GDELT
   returned real articles this time.
3. Open [https://catchy-three.vercel.app](https://catchy-three.vercel.app)
   — if step 2 shows rows, the homepage should show those instead of
   (or alongside) the mock-data trends.
4. If it's still `0 articles`/`abortedDueToRateLimit` for every
   category, that means either GDELT is still constrained for this
   IP/time, or the query simplification needs further adjustment — not
   a reason to immediately retry manually; let it ride to the next
   day's run, or use `?category=<one>` sparingly rather than a full
   manual run.

### Setup

1. Copy `.env.example` to `.env.local` and fill in
   `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`.
2. Add an `ADMIN_CRON_SECRET` to `.env.local` (not committed — generate
   one with `openssl rand -hex 32`). Both collection routes return 401
   without a matching bearer token.
3. Run `supabase/schema.sql` in the Supabase SQL Editor once.

### ⚠️ Don't repeatedly test against real GDELT

GDELT's rate limiting turned out to be much stricter in practice than
its own docs ("one request every ~5 seconds") suggest — repeated manual
testing during development got this network's egress IP throttled with
persistent `HTTP 429`s, and eventually connections were dropped
outright at the TCP level (not just 429s). Treat the live endpoint as a
scarce, shared resource:

- Prefer `?category=<one category>` for local testing (one GDELT
  request instead of seven).
- Leave several minutes between manual runs — don't loop/retry quickly
  even if a run comes back empty.
- A single 429 or "please limit requests" response aborts the *entire*
  run and saves nothing (see "Rate-limit behavior" below) — that's
  expected, not a bug, and retrying immediately will likely just get
  rate-limited again.

### Trigger collection manually

Full run (all 7 categories, time-budget-limited — see below):

```bash
curl -X POST http://localhost:3000/api/admin/collect-trends \
  -H "Authorization: Bearer $ADMIN_CRON_SECRET"
```

Single category (preferred for local testing — one GDELT request):

```bash
curl -X POST "http://localhost:3000/api/admin/collect-trends?category=%EA%B8%80%EB%A1%9C%EB%B2%8C%20%EC%9D%B4%EC%8A%88" \
  -H "Authorization: Bearer $ADMIN_CRON_SECRET"
```

(`%EA%B8%80...` is `글로벌 이슈` URL-encoded — any of the 7 category
strings works: 음악, 영화·시리즈, 밈·인터넷, 라이프스타일, 테크·게임,
스포츠, 글로벌 이슈.)

First N categories instead of one specific one:

```bash
curl -X POST "http://localhost:3000/api/admin/collect-trends?limitCategories=1" \
  -H "Authorization: Bearer $ADMIN_CRON_SECRET"
```

Each returns a JSON report with, per category, how many GDELT articles
were fetched, how many clusters were found, which trend ids got
published, and how many clusters were skipped for having fewer than 2
distinct domains — plus `abortedDueToRateLimit` and `skippedCategories`
(see below).

### Rate-limit behavior

`src/lib/server/gdelt.ts`'s `fetchGdeltArticlesForCategory` throws
`GdeltRateLimitedError` specifically for `HTTP 429` or a "please limit
requests" response body (never for network errors/timeouts/malformed
JSON — those stay non-fatal and just count as 0 articles for that
category). `runDailyTrendCollection` (`src/lib/server/collect-trends.ts`)
treats that as fatal for the *whole run*: it stops immediately and
saves nothing to Supabase, including categories that succeeded earlier
in the same run — a run that got rate-limited partway through isn't a
trustworthy sample, so it's all-or-nothing rather than a partial save.
The response reflects this with `"abortedDueToRateLimit": true` and
`"rateLimitedCategory"`, and every category's `published` array comes
back empty even if clusters were found before the abort.

Separately, if a run's internal time budget (40s by default, leaving
headroom under a 60s `maxDuration`) runs out before all requested
categories are attempted, that's treated as a normal, healthy outcome —
whatever was already collected for earlier categories *is* saved, and
the unattempted ones show up in `"skippedCategories"` with
`"abortedDueToRateLimit": false`.

### Verify data landed in Supabase

In the Supabase SQL Editor:

```sql
select id, category, title, status, generated_at
from trends
order by generated_at desc
limit 10;

select trend_id, source_name, source_type, original_url
from trend_sources
where trend_id = '<a trend id from above>';
```

### Verify the homepage picks it up

Open [http://localhost:3000](http://localhost:3000) after a successful
collection run. The home feed and `/trend/[id]` pages read Supabase
first (`src/lib/server/trend-repository.ts`) and only fall back to the
hand-written trends in `src/lib/mock-data.ts` if Supabase has nothing
publishable — so newly collected trends should appear alongside (or
instead of) the mock ones immediately, no rebuild needed.

### Deploying to Vercel

#### Required environment variables

Set these in the Vercel project (Settings → Environment Variables)
before deploying — without them, Supabase reads/writes and the
collection routes' auth check all fail the same way they do locally
without `.env.local`:

| Variable | Required for | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | reading/writing Supabase from server code | safe to expose; see `src/lib/server/supabase-client.ts` |
| `SUPABASE_SERVICE_ROLE_KEY` | reading/writing Supabase from server code | **server-only**, bypasses RLS — never prefix with `NEXT_PUBLIC_` |
| `ADMIN_CRON_SECRET` | both collection routes return 401 without it | generate with `openssl rand -hex 32`; use the *same* value as `CRON_SECRET` below |

Optional but recommended:

| Variable | Required for | Notes |
|---|---|---|
| `CRON_SECRET` | letting Vercel Cron auto-authenticate | Vercel automatically sends `Authorization: Bearer $CRON_SECRET` when invoking cron jobs if this exact-named var exists. Set it to the **same value** as `ADMIN_CRON_SECRET` so `/api/cron/daily-trends`'s bearer check (which reads `ADMIN_CRON_SECRET`) passes. Without this, the daily cron invocation will get 401'd — the schedule will still fire, it just won't be authorized. |

No GDELT env var is needed — the DOC 2.0 API is public and unauthenticated.

#### Cron schedule

`vercel.json` is already configured for 09:00 KST daily:

```json
{
  "crons": [{ "path": "/api/cron/daily-trends", "schedule": "0 0 * * *" }]
}
```

`0 0 * * *` is cron syntax for "00:00 every day" in **UTC** (Vercel
Cron schedules are always UTC) — `00:00 UTC = 09:00 KST` (UTC+9, no
DST), so this matches "매일 한국시간 오전 9시" as requested. No change
needed; just confirm in the Vercel dashboard (Settings → Cron Jobs)
that the job shows up after deploying.

#### Manual test after deploying

Once deployed and the env vars above are set, test from the production
URL (replace with your actual Vercel domain) — this uses a *different*
egress IP than local dev, so it isn't affected by the rate-limit/block
this sandboxed network hit during development:

```bash
# Single category first — safest first test, only one GDELT request
curl -X POST "https://<your-project>.vercel.app/api/admin/collect-trends?category=%EA%B8%80%EB%A1%9C%EB%B2%8C%20%EC%9D%B4%EC%8A%88" \
  -H "Authorization: Bearer $ADMIN_CRON_SECRET"

# Full run, once the single-category test looks healthy
curl -X POST "https://<your-project>.vercel.app/api/admin/collect-trends" \
  -H "Authorization: Bearer $ADMIN_CRON_SECRET"
```

Then re-run the Supabase SQL and homepage checks above, against the
deployed Supabase project and `https://<your-project>.vercel.app`.

**Still don't loop/retry this quickly, even against the production
URL** — see "⚠️ Don't repeatedly test against real GDELT" above; a
fresh egress IP just means you're starting from zero violations, not
that the rate limit doesn't apply.

### Timing, time budget, and Vercel Hobby's 60s limit

GDELT categories are always fetched sequentially, never in parallel,
with at least `GDELT_REQUEST_SPACING_MS` (8s) between requests
(`src/lib/server/gdelt.ts`). On top of that, `runDailyTrendCollection`
won't start a new category once `timeBudgetMs` (40s by default) has
elapsed since the run started — so a run always wraps up with enough
headroom under both routes' `maxDuration = 60` (the Vercel Hobby plan's
cap) for Supabase writes and response serialization, even if every
fetch takes the full 15s timeout. In the worst case this means only
~2-3 of the 7 categories get attempted per invocation; the rest show up
in `"skippedCategories"` and get picked up on the next run (see "Rate-
limit behavior" above for why that's different from a rate-limit
abort, which saves nothing). If GDELT consistently can't cover all 7
categories in one daily run, consider triggering
`/api/cron/daily-trends?limitCategories=n` more than once a day instead
of raising the time budget.

In practice, testing from this sandboxed dev network during
development got persistent `HTTP 429`s even with 10-45s between
individual requests — stricter than GDELT's "one request every ~5
seconds" docs suggest — and eventually connections were refused/timed
out at the TCP level entirely (confirmed with a bare `curl`, independent
of any of this app's code), most likely because the egress IP had
accumulated enough violations to get temporarily blocked. If you hit
that, don't retry in a loop — wait at least several minutes, or test
from a different network (e.g. the deployed Vercel function's egress
IP, or your own machine instead of a shared/sandboxed one). A quick
`curl https://api.gdeltproject.org/api/v2/doc/doc?query=election&mode=artlist&format=json&timespan=72h&maxrecords=5`
confirms whether it's your network being throttled before assuming a
code issue.

### Query/timespan tuning (why queries look simple)

After deploying and running real (non-throttled, `HTTP 200`) requests
against production, GDELT came back with a clean `{}` — no `articles`
key, no error, no throttle message — for queries like
`(protest OR election OR climate OR "human rights")` with
`timespan=24h` and `sort=hybridrel`. Confirmed via a direct `curl`
independent of this app's code, so it wasn't a bug on our end — GDELT's
index for a narrow window + quoted-phrase + multi-OR query combination
can just be sparse at a given moment.

In response, `src/lib/server/gdelt.ts` now uses:
- **72h timespan** (was 24h) — more room for clustering to find 2+
  domains on the same story.
- **Simple 1-2 keyword queries, no quoted phrases** (e.g. `music OR
  concert` instead of `(music OR album OR concert OR grammy OR
  "billboard chart")`) — quoted phrases require an exact match, which
  was likely the main cause of the empty results.
- **No explicit `sort`** (was `hybridrel`) — defaults to GDELT's native
  `datedesc`; result order doesn't matter since everything gets
  clustered anyway.
- **Explicit logging** for the `{}`/empty-`articles`-array case
  (`fetchGdeltArticlesForCategory`) so "0 articles" shows up in logs
  with a reason, distinguishable from a silent failure.

Published-per-category stays capped at 3 but isn't a target — 0, 1, or
2 published trends for a category in a given run is expected whenever
fewer qualifying (2+ distinct domain) clusters turn up, not a bug.

### Scope notes

- Only GDELT is used — no NewsData.io/NewsAPI/Guardian API, no API key
  for any external news source.
- Only metadata is read/stored (title, url, domain, sourceCountry,
  seendate, language) — never article bodies, images, or thumbnails.
- `title`/`summary`/`englishSummary`/`koreanSummary`/`whyTrending`/
  `expressions` are always CATCHY's own stub copy, never derived from
  article text — see the comment at the top of
  `src/lib/server/generate-trend-draft.ts`.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
