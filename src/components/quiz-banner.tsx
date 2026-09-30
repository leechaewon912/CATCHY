import { ArrowUpRightIcon, CheckCircleIcon, FlameIcon } from "@/components/icons";
import { quizStats } from "@/lib/mock-data";

export function QuizBanner() {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-20 sm:px-8">
      <div className="flex flex-col items-start justify-between gap-6 rounded-3xl border border-lime-300/20 bg-gradient-to-br from-white/[0.06] to-transparent p-8 sm:flex-row sm:items-center sm:p-10">
        <div className="flex flex-col gap-3">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-lime-300">
            오늘의 퀵 퀴즈
          </span>
          <h2 className="max-w-md text-2xl font-black leading-tight text-white sm:text-3xl">
            배운 표현, {quizStats.questionCount}문제로 1분 만에 체화하기
          </h2>
          <div className="flex flex-wrap items-center gap-4 pt-1 text-sm text-white/55">
            <span className="flex items-center gap-1.5">
              <CheckCircleIcon className="h-4 w-4 text-lime-300" />
              복습 대기 표현 {quizStats.reviewDue}개
            </span>
            <span className="flex items-center gap-1.5">
              <FlameIcon className="h-4 w-4 text-orange-400" />
              {quizStats.streakDays}일 연속 학습 중
            </span>
          </div>
        </div>

        <button
          type="button"
          className="group flex shrink-0 items-center gap-2 rounded-full bg-lime-300 px-7 py-3.5 text-sm font-bold text-black transition-transform hover:-translate-y-0.5"
        >
          지금 풀기
          <ArrowUpRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </button>
      </div>
    </section>
  );
}
