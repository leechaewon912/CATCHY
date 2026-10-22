import "server-only";

import type { Category } from "@/lib/mock-data";
import { ALL_CATEGORIES, CATEGORY_SLUGS } from "@/lib/server/gdelt";
import { isAuthorizedAdminRequest } from "@/lib/server/admin-auth";
import { generateDailyCultureEditorial } from "@/lib/server/generate-culture-editorial-with-llm";
import { fetchRecentEditorialContext, upsertTrend } from "@/lib/server/db/save-trends";
import { getSupabaseServerClient } from "@/lib/server/supabase-client";

// Vercel Cron hits this with GET (see vercel.json: "0 0 * * *" UTC =
// 09:00 KST). Protected by the same ADMIN_CRON_SECRET bearer check as the
// RSS pipeline's cron route (src/lib/server/admin-auth.ts) — see README
// for the CRON_SECRET env var note.
//
// Generates CATCHY's self-authored "culture editorial" content — no RSS/
// external news collection at all (src/lib/server/generate-culture-
// editorial-with-llm.ts). Runs with Fluid Compute's 300s Hobby ceiling:
// 4-5 stories generated sequentially in-process comfortably fit in that
// budget, so this doesn't need the RSS pipeline's fan-out-to-separate-
// functions pattern (see /api/cron/daily-trends/route.ts) — and
// persisting each story immediately as it finishes (inside the loop
// below) means a slow/failing story never loses ones that already
// succeeded, even in a worst-case timeout.
export const maxDuration = 300;

const MIN_DAILY_EDITORIALS = 4;
const MAX_DAILY_EDITORIALS = 5;
// "실패 시 해당 카테고리만 1회 더 재시도" — generateDailyCultureEditorial
// already retries internally (topic pick / summary / expressions each up
// to 3 attempts) before giving up and returning null, so this outer loop
// is a single additional *full* retry (fresh topic pick and all), not a
// per-step retry.
const MAX_ATTEMPTS_PER_CATEGORY = 2;

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

// "YYYYMMDD" in Asia/Seoul wall-clock time — same "shift by +9h, read UTC
// getters" trick as src/app/quiz/page.tsx's local kstDateStamp. Asia/Seoul
// has no DST, so a fixed offset is always correct.
function kstDateStamp(date: Date): string {
  const kst = new Date(date.getTime() + KST_OFFSET_MS);
  return `${kst.getUTCFullYear()}${String(kst.getUTCMonth() + 1).padStart(2, "0")}${String(kst.getUTCDate()).padStart(2, "0")}`;
}

// Start of the current KST calendar day, as a UTC ISO string — used to
// query "already generated today" without pulling in a timezone library.
function kstDayStartIso(date: Date): string {
  const kst = new Date(date.getTime() + KST_OFFSET_MS);
  const dayStartKst = Date.UTC(kst.getUTCFullYear(), kst.getUTCMonth(), kst.getUTCDate(), 0, 0, 0);
  return new Date(dayStartKst - KST_OFFSET_MS).toISOString();
}

// Deterministic id: re-running this cron the same KST day for the same
// category upserts the same row (onConflict: "id" in upsertTrend) instead
// of creating a duplicate — this is the "중복 실행 방지" behavior, with no
// extra bookkeeping needed beyond the id itself.
function trendIdFor(category: Category, dateStamp: string): string {
  return `editorial-${CATEGORY_SLUGS[category]}-${dateStamp}`;
}

function pickRandomDistinct<T>(items: T[], count: number): T[] {
  const pool = [...items];
  const picked: T[] = [];
  while (pool.length > 0 && picked.length < count) {
    const index = Math.floor(Math.random() * pool.length);
    picked.push(pool.splice(index, 1)[0]);
  }
  return picked;
}

// Categories that already got a gpt_editorial story today — excluded from
// this run's candidate pool so a re-run (manual retry, or a second cron
// firing) never duplicates or over-generates past the daily target.
// Fail-open (same posture as fetchRecentPublishedClusterKeys/
// fetchRecentEditorialContext): if this query fails, proceed with no
// categories excluded rather than blocking the whole run.
async function fetchTodaysCoveredCategories(sinceIso: string): Promise<Set<Category>> {
  const client = getSupabaseServerClient();
  if (!client) return new Set();

  const { data, error } = await client
    .from("trends")
    .select("category")
    .eq("content_origin", "gpt_editorial")
    .gte("generated_at", sinceIso)
    .returns<Array<{ category: Category }>>();

  if (error) {
    console.error(
      "[cron/daily-editorial] failed to load today's covered categories, proceeding with none excluded:",
      error.message,
    );
    return new Set();
  }

  return new Set((data ?? []).map((row) => row.category));
}

type CategoryResult = { category: Category; status: "generated" | "failed"; trendId?: string; reason?: string };

export async function GET(request: Request) {
  if (!isAuthorizedAdminRequest(request)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const dateStamp = kstDateStamp(now);
  const todayStartIso = kstDayStartIso(now);

  const coveredCategories = await fetchTodaysCoveredCategories(todayStartIso);
  const candidateCategories = ALL_CATEGORIES.filter((category) => !coveredCategories.has(category));

  const targetCount = Math.min(
    candidateCategories.length,
    MIN_DAILY_EDITORIALS + Math.floor(Math.random() * (MAX_DAILY_EDITORIALS - MIN_DAILY_EDITORIALS + 1)),
  );
  const selectedCategories = pickRandomDistinct(candidateCategories, targetCount);

  const results: CategoryResult[] = [];

  // Sequential, not parallel: each category's generation is persisted via
  // upsertTrend() as soon as it succeeds, so an earlier failure/slowdown
  // never loses later successes and vice versa — requirement "일부 생성
  // 실패해도 성공한 콘텐츠는 저장·게시되도록" is satisfied by this
  // per-category persistence, not by a batch-level transaction.
  for (const category of selectedCategories) {
    let succeeded = false;
    let lastReason: string | undefined;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS_PER_CATEGORY && !succeeded; attempt++) {
      try {
        // Re-fetched each attempt (and naturally reflects any categories
        // already generated earlier in this same run) so dedup context
        // stays fresh across the whole run, not just across days.
        const context = await fetchRecentEditorialContext();
        const output = await generateDailyCultureEditorial(category, context);
        if (!output) {
          lastReason = "생성 실패 (LLM 미설정 또는 모든 내부 재시도 소진)";
          continue;
        }

        const trendId = trendIdFor(category, dateStamp);
        await upsertTrend({
          id: trendId,
          category,
          clusterKey: trendId,
          status: "published",
          content: {
            title: output.title,
            summary: output.summary,
            englishSummary: output.englishSummary,
            koreanSummary: output.koreanSummary,
            // GPT 에디토리얼은 "왜 화제인지" 섹션이 해당 없음 — 빈 문자열로
            // 저장하면 read-trends.ts의 mapTrend가 undefined로 바꿔
            // 상세 페이지가 그 섹션을 생략한다(whyTrending optional 처리).
            whyTrending: "",
            expressions: output.expressions,
          },
          sources: [],
          englishTitle: output.englishTitle,
          contentOrigin: "gpt_editorial",
        });

        results.push({ category, status: "generated", trendId });
        succeeded = true;
      } catch (error) {
        lastReason = error instanceof Error ? error.message : String(error);
        console.error(`[cron/daily-editorial] ${category} attempt ${attempt} failed:`, error);
      }
    }

    if (!succeeded) {
      results.push({ category, status: "failed", reason: lastReason });
    }
  }

  return Response.json({
    dateStamp,
    excludedAlreadyCovered: [...coveredCategories],
    generated: results.filter((result) => result.status === "generated"),
    failed: results.filter((result) => result.status === "failed"),
  });
}
