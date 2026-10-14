import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { QuizClient, type QuizQuestionWithExpression } from "@/app/quiz/quiz-client";
import { QuizEntryClient, type QuizPickerTrend } from "@/app/quiz/quiz-entry-client";
import { ArrowLeftIcon } from "@/components/icons";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import type { Trend } from "@/lib/mock-data";
import { buildQuizFromExpressions } from "@/lib/server/build-quiz";
import { getHomeTrends, getTrendDetail, getTrendExpressions } from "@/lib/server/trend-repository";

export const metadata: Metadata = {
  title: "오늘의 퀵 퀴즈 — CATCHY",
  description: "트렌드에서 배운 표현을 짧은 퀴즈로 체화해보세요.",
};

// At least 2 expressions are needed for a question to have a wrong-answer
// option to distinguish from — trends with fewer aren't offered in the
// picker, and a direct ?trend= link to one falls back to an inline
// message instead of rendering a degenerate one-option "quiz".
const MIN_EXPRESSIONS_FOR_QUIZ = 2;

// Valid entry_point values for the quiz_started event — anything else
// (missing param, a direct/bookmarked URL visit) falls back to
// "direct" below.
const QUIZ_ENTRY_POINTS = ["trend_detail", "quiz_picker"] as const;
type QuizEntryPoint = (typeof QUIZ_ENTRY_POINTS)[number] | "direct";

function resolveEntryPoint(entry: string | undefined): QuizEntryPoint {
  return (QUIZ_ENTRY_POINTS as readonly string[]).includes(entry ?? "")
    ? (entry as QuizEntryPoint)
    : "direct";
}

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

// "YYYY-MM-DD" in Asia/Seoul wall-clock time — the same "treat UTC
// getters as KST after shifting by +9h" trick src/app/page.tsx and
// collect-trends.ts's kstDateStamp use. Asia/Seoul has no DST, so a
// fixed offset is always correct.
function kstDateStamp(date: Date): string {
  const kst = new Date(date.getTime() + KST_OFFSET_MS);
  return `${kst.getUTCFullYear()}-${String(kst.getUTCMonth() + 1).padStart(2, "0")}-${String(kst.getUTCDate()).padStart(2, "0")}`;
}

// The quiz picker only offers trends generated on the current KST
// calendar day — older trends (still fine to link to directly or play
// via /trend/[id]) are filtered out here rather than at the repository
// level, so getHomeTrends() itself stays untouched.
function isGeneratedToday(generatedAt: string, now: Date): boolean {
  return kstDateStamp(new Date(generatedAt)) === kstDateStamp(now);
}

export default async function QuizPage({
  searchParams,
}: {
  searchParams: Promise<{ trend?: string; entry?: string }>;
}) {
  const { trend: trendId, entry } = await searchParams;
  const entryPoint = resolveEntryPoint(entry);

  if (!trendId) {
    const trends = await getHomeTrends();
    const todaysTrends = trends.filter((trend) => isGeneratedToday(trend.generatedAt, new Date()));
    return <QuizTrendPicker trends={todaysTrends} />;
  }

  const trend = await getTrendDetail(trendId);
  if (!trend) {
    notFound();
  }

  const expressions = await getTrendExpressions(trend.id);
  const backHref = `/trend/${trend.id}`;

  const quizSeeds = buildQuizFromExpressions(expressions);
  const questions: QuizQuestionWithExpression[] = quizSeeds.map((seed, index) => ({
    id: expressions[index].id,
    phrase: seed.phrase,
    correctMeaningKo: seed.correctMeaningKo,
    optionsKo: seed.optionsKo,
    expression: expressions[index],
  }));

  return (
    <div className="flex min-h-full flex-col bg-paper">
      <SiteHeader />

      <main className="flex-1">
        <section className="mx-auto max-w-2xl px-5 pt-8 pb-20 sm:px-8 sm:pt-12">
          <Link
            href={backHref}
            className="mb-6 inline-flex cursor-pointer items-center gap-1.5 rounded text-[14px] font-normal text-fog transition-colors hover:text-graphite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-obsidian"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            트렌드로 돌아가기
          </Link>

          {/* Category chip intentionally omitted here — the quiz-solving
              screen only needs the trend title and the question UI below
              it, not the category it came from. */}
          <h1 className="text-[32px] font-semibold leading-tight text-obsidian sm:text-[40px]">
            {trend.title}
          </h1>

          <div className="mt-8">
            {questions.length >= MIN_EXPRESSIONS_FOR_QUIZ ? (
              <QuizClient
                questions={questions}
                trendTitle={trend.title}
                returnHref={backHref}
                trendId={trend.id}
                entryPoint={entryPoint}
              />
            ) : (
              <div className="surface-card flex flex-col items-start gap-4 p-8 text-[14px] text-fog">
                <p>이 트렌드는 아직 표현이 부족해서 퀴즈를 만들 수 없어요.</p>
                <Link href="/quiz" className="btn-ghost">
                  다른 트렌드 선택하기
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function QuizTrendPicker({ trends }: { trends: Trend[] }) {
  // Plain, serializable summaries only — the client component can't
  // import mock-data.ts's Trend value (it's "server-only"), and doesn't
  // need the full trend (sources, quiz, etc.) anyway.
  const quizzableTrends: QuizPickerTrend[] = trends
    .filter((trend) => trend.expressions.length >= MIN_EXPRESSIONS_FOR_QUIZ)
    .map((trend) => ({
      id: trend.id,
      title: trend.title,
      category: trend.category,
      summary: trend.summary,
      expressionCount: trend.expressions.length,
    }));

  return (
    <div className="flex min-h-full flex-col bg-paper">
      <SiteHeader />

      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-5 pt-8 pb-20 sm:px-8 sm:pt-12">
          <Link
            href="/"
            className="mb-6 inline-flex cursor-pointer items-center gap-1.5 rounded text-[14px] font-normal text-fog transition-colors hover:text-graphite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-obsidian"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            홈으로 돌아가기
          </Link>

          <p className="text-[12px] font-medium text-ember">오늘의 퀵 퀴즈</p>
          <h1 className="mt-2 text-[32px] font-semibold leading-tight text-obsidian sm:text-[40px]">
            퀴즈 풀 트렌드를 선택해주세요
          </h1>
          <p className="mt-2 text-[14px] text-fog">
            트렌드별로 배운 표현만 모아서 짧게 복습할 수 있어요.
          </p>

          <QuizEntryClient trends={quizzableTrends} />
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
