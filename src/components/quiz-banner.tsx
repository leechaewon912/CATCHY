import Link from "next/link";

import { ArrowUpRightIcon, CheckCircleIcon, FlameIcon } from "@/components/icons";
import { quizStats } from "@/lib/mock-data";

export function QuizBanner() {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-20 sm:px-8">
      <div className="surface-dark flex flex-col items-start justify-between gap-6 p-8 sm:flex-row sm:items-center sm:p-10">
        <div className="flex flex-col gap-3">
          <span className="text-[12px] font-medium text-ember">
            오늘의 퀵 퀴즈
          </span>
          <h2 className="max-w-md text-[32px] font-semibold leading-tight text-snow">
            배운 표현, {quizStats.questionCount}문제로 1분 만에 체화하기
          </h2>
          <div className="flex flex-wrap items-center gap-4 pt-1 text-[14px] text-mist">
            <span className="flex items-center gap-1.5">
              <CheckCircleIcon className="h-4 w-4 text-snow" />
              복습 대기 표현 {quizStats.reviewDue}개
            </span>
            <span className="flex items-center gap-1.5">
              <FlameIcon className="h-4 w-4 text-ember" />
              {quizStats.streakDays}일 연속 학습 중
            </span>
          </div>
        </div>

        <Link
          href="/quiz"
          className="group flex shrink-0 cursor-pointer items-center gap-2 rounded-buttons bg-snow px-7 py-3.5 text-[14px] font-medium text-obsidian transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-graphite focus-visible:ring-snow"
        >
          지금 풀기
          <ArrowUpRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>
    </section>
  );
}
