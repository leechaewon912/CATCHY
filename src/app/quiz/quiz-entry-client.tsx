"use client";

import Link from "next/link";

import type { Category } from "@/lib/mock-data";

export type QuizPickerTrend = {
  id: string;
  title: string;
  category: Category;
  summary: string;
  expressionCount: number;
};

export function QuizEntryClient({ trends }: { trends: QuizPickerTrend[] }) {
  if (trends.length === 0) {
    return (
      <p className="mt-10 text-[14px] text-fog">
        오늘은 아직 퀴즈를 만들 수 있는 트렌드가 없어요. 새로운 트렌드가 올라오면 여기서 바로 풀 수 있어요.
      </p>
    );
  }

  const categories = Array.from(new Set(trends.map((trend) => trend.category)));

  return (
    <div className="mt-8 flex flex-col gap-12">
      {categories.map((category) => {
        const categoryTrends = trends.filter((trend) => trend.category === category);

        return (
          <section key={category} aria-labelledby={`quiz-category-${category}`}>
            <div className="mb-4 flex items-end justify-between gap-4">
              <h2 id={`quiz-category-${category}`} className="text-[20px] font-semibold text-obsidian">
                {category}
              </h2>
              <span className="text-[12px] text-fog">{categoryTrends.length}개</span>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {categoryTrends.map((trend) => (
                <Link
                  key={trend.id}
                  href={`/quiz?trend=${trend.id}&entry=quiz_picker`}
                  className="surface-card group flex cursor-pointer flex-col transition-colors hover:border-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-obsidian"
                >
                  <div className="flex flex-1 flex-col gap-3 p-5">
                    <h3 className="text-[18px] font-semibold leading-snug text-obsidian transition-colors group-hover:text-graphite">
                      {trend.title}
                    </h3>
                    <p className="line-clamp-2 text-[14px] leading-relaxed text-fog">
                      {trend.summary}
                    </p>
                    <p className="mt-auto text-[12px] text-fog">표현 {trend.expressionCount}개</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
