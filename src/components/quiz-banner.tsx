import Link from "next/link";

import { ArrowUpRightIcon } from "@/components/icons";

export function QuizBanner() {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-20 sm:px-8">
      <div className="surface-card flex flex-col items-start justify-between gap-6 p-6 sm:flex-row sm:items-center sm:p-10">
        <div className="flex flex-col gap-3">
          <span className="text-[12px] font-medium text-ember">
            오늘의 퀵 퀴즈
          </span>
          <h2 className="max-w-md break-keep text-[24px] font-semibold leading-snug text-obsidian sm:text-[32px] sm:leading-tight">
            방금 배운 표현, 기억하고 있나요?
          </h2>
          <p className="text-kr-body max-w-md break-keep text-[14px] text-fog">
            트렌드별로 모은 표현을 짧은 퀴즈로 바로 복습해보세요.
          </p>
        </div>

        <Link href="/quiz" className="btn-solid-black group shrink-0">
          지금 풀기
          <ArrowUpRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>
    </section>
  );
}
