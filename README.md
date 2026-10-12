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

## Daily trend collection

CATCHY collects trend candidates, clusters same-issue articles, keeps
only clusters backed by 2+ distinct domains, generates English-learning
content for up to 3 clusters per category (real, LLM-generated content
if `OPENAI_API_KEY` is set — see "LLM-generated content" below;
otherwise the rule-based stub templates in
`src/lib/server/generate-trend-draft.ts`), and upserts the result into
Supabase. See `src/lib/server/collect-trends.ts` for the pipeline and
`supabase/schema.sql` for the table shapes. The pipeline itself doesn't
care which source fed it articles — only the fetch step at the top
differs between the two sources below.

### Default source: curated publisher RSS feeds

As of 2026-10-12, **RSS is the default collection source**, not GDELT
(see "Why GDELT isn't the default anymore" below). `src/lib/server/
rss-sources.ts` lists 2-4 hand-picked, verified-live RSS feeds per
category from official outlets/publishers (Billboard, Variety, The
Verge, ESPN, BBC, etc.) — add, remove, or re-verify feeds there.
`src/lib/server/rss-collect.ts` fetches each category's feeds
sequentially with a small courtesy delay (`RSS_REQUEST_SPACING_MS`,
300ms — these are static publisher files, not a throttled search API,
so this is politeness, not rate-limit defense) and extracts **only**
`title`, `url` (→ `domain`), and `publishedAt` from each item —
`item.content`/`contentSnippet`/`summary`/`enclosure` (body text,
thumbnails) are never read, matching the same metadata-only constraint
GDELT was already held to. A single feed failing (moved, malformed,
down) only means fewer articles for that category — it never aborts
the whole run.

### GDELT (manual fallback only)

`src/lib/server/gdelt.ts` is still in the codebase and still works —
it's just no longer called by default. Request it explicitly with
`?source=gdelt` on either collection route (see "Trigger collection
manually" below). Kept for manual testing and as a fallback if the
curated RSS list ever runs dry for a category.

#### Why GDELT isn't the default anymore

GDELT's rate limiting turned out to be much stricter in practice than
its own docs ("one request every ~5 seconds") suggest. Across repeated
testing — both from the sandboxed dev network *and*, later, from
production's own Vercel egress IP on 2026-10-10 and again on
2026-10-11 — manual and even scheduled-cron runs kept coming back
`abortedDueToRateLimit: true`. Rate limiting a public API on their own
network is GDELT's call to make, but it means GDELT can't be trusted as
the *default*, unattended daily source — hence the move to RSS, with
GDELT demoted to an explicit opt-in for manual testing only.

If you do test it manually, treat the live endpoint as a scarce, shared
resource:

- Prefer `?category=<one category>&source=gdelt` (one GDELT request
  instead of seven).
- Leave several minutes between manual runs — don't loop/retry quickly
  even if a run comes back empty.
- A single 429 or "please limit requests" response aborts the *entire*
  run and saves nothing (see "Rate-limit behavior" below) — that's
  expected, not a bug, and retrying immediately will likely just get
  rate-limited again.

### Setup

1. Copy `.env.example` to `.env.local` and fill in
   `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`.
2. Add an `ADMIN_CRON_SECRET` to `.env.local` (not committed — generate
   one with `openssl rand -hex 32`). Both collection routes return 401
   without a matching bearer token.
3. Run `supabase/schema.sql` in the Supabase SQL Editor once.

No env var or API key is needed for either collection source — the RSS
feeds and the GDELT DOC 2.0 API are both public and unauthenticated.

### Trigger collection manually

Full run, all 7 categories, RSS (default):

```bash
curl -X POST http://localhost:3000/api/admin/collect-trends \
  -H "Authorization: Bearer $ADMIN_CRON_SECRET"
```

Single category (useful for local testing either source):

```bash
curl -X POST "http://localhost:3000/api/admin/collect-trends?category=%EA%B8%80%EB%A1%9C%EB%B2%8C%20%EC%9D%B4%EC%8A%88" \
  -H "Authorization: Bearer $ADMIN_CRON_SECRET"
```

(`%EA%B8%80...` is `글로벌 이슈` URL-encoded — any of the 7 category
strings works: 음악, 영화·시리즈, 밈·인터넷, 라이프스타일, 테크·게임,
스포츠, 글로벌 이슈.)

Explicitly use GDELT instead of RSS (add `&source=gdelt`, or `?source=gdelt`
if it's the only param):

```bash
curl -X POST "http://localhost:3000/api/admin/collect-trends?source=gdelt&category=%EA%B8%80%EB%A1%9C%EB%B2%8C%20%EC%9D%B4%EC%8A%88" \
  -H "Authorization: Bearer $ADMIN_CRON_SECRET"
```

First N categories instead of one specific one:

```bash
curl -X POST "http://localhost:3000/api/admin/collect-trends?limitCategories=1" \
  -H "Authorization: Bearer $ADMIN_CRON_SECRET"
```

Each returns a JSON report (now including `"source": "rss" | "gdelt"`)
with, per category, how many articles were fetched, how many clusters
were found, which trend ids got published, and how many clusters were
skipped for having fewer than 2 distinct domains — plus
`abortedDueToRateLimit` and `skippedCategories` (see below).

### Rate-limit behavior (GDELT path only)

`src/lib/server/gdelt.ts`'s `fetchGdeltArticlesForCategory` throws
`GdeltRateLimitedError` specifically for `HTTP 429` or a "please limit
requests" response body (never for network errors/timeouts/malformed
JSON — those stay non-fatal and just count as 0 articles for that
category). `runDailyTrendCollection` (`src/lib/server/collect-trends.ts`)
treats that as fatal for the *whole run* when `source: "gdelt"`: it
stops immediately and saves nothing to Supabase, including categories
that succeeded earlier in the same run — a run that got rate-limited
partway through isn't a trustworthy sample, so it's all-or-nothing
rather than a partial save. The response reflects this with
`"abortedDueToRateLimit": true` and `"rateLimitedCategory"`, and every
category's `published` array comes back empty even if clusters were
found before the abort. The RSS path has no equivalent — a failed feed
just yields fewer articles for that category, never an aborted run.

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
| `OPENAI_API_KEY` | real, per-trend LLM-generated summaries/expressions instead of the rule-based stub templates | **server-only**, never prefix with `NEXT_PUBLIC_`. See "LLM-generated content" below. Without it (or if a call fails), collection automatically falls back to the stub generator — the app and the daily cron both keep working either way, just with more generic copy. |

RSS/GDELT fetching itself needs no key either way — only the optional LLM step does.

### LLM-generated content (optional, falls back automatically)

`src/lib/server/generate-trend-with-llm.ts` can turn a cluster's RSS
metadata into a real, specific trend write-up instead of the generic
stub templates in `generate-trend-draft.ts`. It's called from
`collect-trends.ts` **only for clusters that already passed
`selectPublishableClusters`** — i.e. at most `MAX_PUBLISHED_PER_CATEGORY`
(3) LLM calls per category per run, never for the full candidate list.

What it sends and doesn't send:
- Input is metadata only — each article's `title`, `sourceName`,
  `originalUrl`, `publishedAt`, plus the `category`. Article bodies are
  never fetched anywhere in this app, so there's nothing to send even
  if we wanted to.
- The prompt explicitly instructs the model to never copy an article's
  sentences, never reuse an article's title as the trend's title, and
  to only describe what's corroborated across the cluster's multiple
  sources — not invent detail that only one source might have.
- The model must return exactly 3 expressions and a small, strictly
  validated JSON shape (`src/lib/server/generate-trend-with-llm.ts`'s
  `parseDraft`) — any mismatch is treated as a failure, not patched up,
  so a malformed completion never reaches Supabase.

Fallback behavior: no `OPENAI_API_KEY`, a network error, a non-2xx
response, or a response that fails the shape validation all result in
`generateTrendDraftWithLlm` returning `null` (never throwing) —
`collect-trends.ts` logs `LLM unavailable or failed — falling back to
template` and calls the existing stub generator instead. A single
cluster's LLM failure never aborts the run or affects other clusters.

Source links are unaffected either way — `trend_sources` is always
built straight from the RSS/GDELT cluster's own metadata
(`originalTitle`/`originalUrl`/`sourceName`), regardless of which
generator produced the summary/expressions.

#### Cron schedule

`vercel.json` is already configured for 09:00 KST daily, and runs the
default RSS source (no `?source=gdelt` in the path):

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
URL (replace with your actual Vercel domain):

```bash
# Single category first (RSS, the default)
curl -X POST "https://<your-project>.vercel.app/api/admin/collect-trends?category=%EA%B8%80%EB%A1%9C%EB%B2%8C%20%EC%9D%B4%EC%8A%88" \
  -H "Authorization: Bearer $ADMIN_CRON_SECRET"

# Full run, once the single-category test looks healthy
curl -X POST "https://<your-project>.vercel.app/api/admin/collect-trends" \
  -H "Authorization: Bearer $ADMIN_CRON_SECRET"
```

Then re-run the Supabase SQL and homepage checks above, against the
deployed Supabase project and `https://<your-project>.vercel.app`. If
you add `&source=gdelt` to either command to test the fallback path
specifically, see "Why GDELT isn't the default anymore" above first —
don't loop/retry it quickly even from production's egress IP.

### Timing, time budget, and Vercel Hobby's 60s limit

Categories are always fetched sequentially, never in parallel, with a
spacing delay between them — `RSS_CATEGORY_SPACING_MS` (500ms, a
courtesy pause) for the default RSS path, or
`GDELT_REQUEST_SPACING_MS` (8s, rate-limit defense) when
`source=gdelt`. On top of that, `runDailyTrendCollection` won't start a
new category once `timeBudgetMs` (40s by default) has elapsed since
the run started — so a run always wraps up with enough headroom under
both routes' `maxDuration = 60` (the Vercel Hobby plan's cap) for
Supabase writes and response serialization. With RSS this budget
comfortably covers all 7 categories (each fetching 2-4 small static
feeds) in one invocation; the old GDELT-specific guidance below about
needing multiple narrower invocations no longer applies by default,
but is kept here for when `?source=gdelt` is used.

**GDELT-specific history** (`?source=gdelt` only): in the worst case,
GDELT's 8s-per-category spacing meant only ~2-3 of the 7 categories got
attempted per invocation; the rest showed up in `"skippedCategories"`.
Separately, testing from this project's dev network got persistent
`HTTP 429`s even with 10-45s between individual requests — stricter
than GDELT's "one request every ~5 seconds" docs suggest — and
eventually connections were refused/timed out at the TCP level
entirely (confirmed with a bare `curl`, independent of any of this
app's code). A quick
`curl https://api.gdeltproject.org/api/v2/doc/doc?query=election&mode=artlist&format=json&timespan=72h&maxrecords=5`
confirms whether a given network is currently throttled by GDELT.

### Query/timespan tuning (GDELT path only — why its queries look simple)

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

- **RSS (default) is the curated feed list in
  `src/lib/server/rss-sources.ts`** — official publisher feeds only, no
  third-party news aggregator API (NewsData.io/NewsAPI/Guardian API
  etc.) and no API key. **GDELT (fallback, `?source=gdelt`)** is the
  public DOC 2.0 API, also no key.
- Only metadata is read/stored — RSS: title, url, domain, publishedAt
  (`src/lib/server/rss-collect.ts` never reads an item's
  content/contentSnippet/summary/enclosure fields). GDELT: title, url,
  domain, sourceCountry, seendate, language. Neither path ever touches
  article bodies, images, or thumbnails.
- `title`/`summary`/`englishSummary`/`koreanSummary`/`whyTrending`/
  `expressions` are always CATCHY's own stub copy, never derived from
  article text — see the comment at the top of
  `src/lib/server/generate-trend-draft.ts`. This holds regardless of
  which source fed the cluster.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
