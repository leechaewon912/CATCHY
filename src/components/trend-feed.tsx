"use client";

import { useState, type ReactNode } from "react";
import type { Category } from "@/lib/mock-data";

// mock-data.ts는 "server-only"라 클라이언트 컴포넌트에서 값을 import할 수
// 없다. 카테고리 목록은 Category 타입과 나란히 여기서도 직접 유지한다.
const CATEGORY_FILTERS: (Category | "전체")[] = [
  "전체",
  "음악",
  "영화·시리즈",
  "밈·인터넷",
  "라이프스타일",
  "테크·게임",
  "스포츠",
  "글로벌 이슈",
];

const DAY_FILTERS = ["전체", "월", "화", "수", "목", "금", "토", "일"] as const;
export type DayFilter = (typeof DAY_FILTERS)[number];

export function TrendFeed({
  trends,
  defaultDay,
  children,
}: {
  // dayOfWeek is the Korean weekday label (월~일) for a trend generated
  // within the current Mon-Sun week (KST), or null if it falls outside
  // that week — see weekdayLabelIfThisWeek in src/app/page.tsx. "전체"
  // excludes null entries too, not just the individual day tabs, since
  // "전체" means "this week", not "every trend ever".
  trends: { id: string; category: Category; dayOfWeek: string | null }[];
  // Today's weekday label — the day filter opens on this instead of
  // "전체" so visitors land on today's trends first.
  defaultDay: DayFilter;
  children: ReactNode[];
}) {
  const [selectedCategory, setSelectedCategory] = useState<Category | "전체">("전체");
  const [selectedDay, setSelectedDay] = useState<DayFilter>(defaultDay);

  const visibleIndexes = trends
    .map((_, index) => index)
    .filter((index) => {
      const trend = trends[index];
      if (trend.dayOfWeek === null) return false;
      const categoryMatches = selectedCategory === "전체" || trend.category === selectedCategory;
      const dayMatches = selectedDay === "전체" || trend.dayOfWeek === selectedDay;
      return categoryMatches && dayMatches;
    });

  return (
    <section className="mx-auto max-w-6xl px-5 pt-16 sm:px-8" aria-labelledby="trend-feed-heading">
      <div className="mb-6">
        <h2 id="trend-feed-heading" className="text-[32px] font-semibold leading-[1.5] text-obsidian">이번 주 트렌드</h2>
        <p className="mt-1 text-[13px] text-fog" role="status" aria-live="polite">
          {selectedDay} · {selectedCategory} · {visibleIndexes.length}개 트렌드
        </p>
      </div>

      {/* 요일 필터 — 텍스트 탭 + 언더라인, 카테고리 필터보다 가볍게 */}
      <div className="scrollbar-hide -mx-5 mb-4 flex gap-5 overflow-x-auto px-5 sm:mx-0 sm:px-0" role="group" aria-label="요일 필터">
        {DAY_FILTERS.map((day) => {
          const isSelected = selectedDay === day;
          return (
            <button
              key={day}
              type="button"
              aria-pressed={isSelected}
              aria-controls="trend-results"
              onClick={() => setSelectedDay(day)}
              className={[
                "shrink-0 cursor-pointer border-b-2 pb-2 text-[14px] transition-colors focus-visible:outline-none",
                isSelected
                  ? "border-obsidian font-semibold text-obsidian"
                  : "border-transparent font-normal text-ash hover:text-graphite",
              ].join(" ")}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* 카테고리 필터 — 버튼/칩 형태, 기존 디자인 그대로 */}
      <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="트렌드 카테고리">
        {CATEGORY_FILTERS.map((category) => (
          <button key={category} type="button" aria-pressed={selectedCategory === category} aria-controls="trend-results" onClick={() => setSelectedCategory(category)}
            className={`shrink-0 cursor-pointer rounded-pills border px-4 py-2.5 text-[14px] font-normal transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-obsidian focus-visible:ring-offset-2 focus-visible:ring-offset-paper ${selectedCategory === category ? "border-obsidian bg-obsidian text-snow" : "border-cloud bg-snow text-iron hover:border-ash hover:text-graphite"}`}>
            {category}
          </button>
        ))}
      </div>
      <div className="mb-6 h-px bg-cloud" />

      <div id="trend-results" className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visibleIndexes.map((index) => children[index])}
        {visibleIndexes.length === 0 && <p className="col-span-full py-12 text-center text-fog">아직 이 조건에 맞는 트렌드가 없어요.</p>}
      </div>
    </section>
  );
}
