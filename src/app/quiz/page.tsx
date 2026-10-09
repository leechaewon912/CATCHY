import Link from "next/link";
import type { Metadata } from "next";

import { QuizClient } from "@/app/quiz/quiz-client";
import { ArrowLeftIcon } from "@/components/icons";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { buildQuizQuestions, CATEGORY_BADGE_CLASS, getTrendById } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "오늘의 퀵 퀴즈 — CATCHY",
  description: "트렌드에서 배운 표현을 짧은 퀴즈로 체화해보세요.",
};

export default async function QuizPage({
  searchParams,
}: {
  searchParams: Promise<{ trend?: string }>;
}) {
  const { trend: trendId } = await searchParams;
  const trend = trendId ? getTrendById(trendId) : undefined;

  const questions = buildQuizQuestions(
    trend ? { trendId: trend.id } : undefined,
  );
  const backHref = trend ? `/trend/${trend.id}` : "/";
  const backLabel = trend ? "트렌드로 돌아가기" : "홈으로 돌아가기";

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
            {backLabel}
          </Link>

          {trend ? (
            <span className={CATEGORY_BADGE_CLASS}>{trend.category}</span>
          ) : (
            <p className="text-[12px] font-medium text-ember">
              오늘의 퀵 퀴즈
            </p>
          )}

          <h1 className="mt-2 text-[32px] font-semibold leading-tight text-obsidian sm:text-[40px]">
            {trend ? trend.title : "배운 표현, 짧게 체크하기"}
          </h1>

          <div className="mt-8">
            <QuizClient questions={questions} returnHref={backHref} />
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
