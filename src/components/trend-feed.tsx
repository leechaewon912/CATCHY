"use client";

import { useState, type ReactNode } from "react";
import type { Category } from "@/lib/mock-data";

// mock-data.ts는 "server-only"라 클라이언트 컴포넌트에서 값을 import할 수
// 없다. 카테고리 목록은 Category 타입과 나란히 여기서도 직접 유지한다.
const filters: (Category | "전체")[] = [
  "전체",
  "음악",
  "영화·시리즈",
  "밈·인터넷",
  "라이프스타일",
  "테크·게임",
  "스포츠",
  "글로벌 이슈",
];

export function TrendFeed({
  trends,
  children,
}: {
  trends: { id: string; category: Category }[];
  children: ReactNode[];
}) {
  const [selected, setSelected] = useState<Category | "전체">("전체");
  const visibleIndexes = trends
    .map((_, index) => index)
    .filter((index) => selected === "전체" || trends[index].category === selected);

  return (
    <section className="mx-auto max-w-6xl px-5 pt-16 sm:px-8" aria-labelledby="trend-feed-heading">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <h2 id="trend-feed-heading" className="text-xl font-black tracking-tight text-white sm:text-2xl">오늘의 글로벌 트렌드</h2>
        <span className="text-xs text-white/50" role="status" aria-live="polite">{selected} · {visibleIndexes.length}개 트렌드</span>
      </div>
      <div className="-mx-5 mb-6 flex gap-2 overflow-x-auto px-5 pb-2 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="트렌드 카테고리">
        {filters.map((category) => (
          <button key={category} type="button" aria-pressed={selected === category} aria-controls="trend-results" onClick={() => setSelected(category)}
            className={`shrink-0 cursor-pointer rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0b] ${selected === category ? "border-lime-300 bg-lime-300 text-black hover:bg-lime-200" : "border-white/15 text-white/60 hover:border-white/40 hover:bg-white/5 hover:text-white"}`}>
            {category}
          </button>
        ))}
      </div>
      <div id="trend-results" className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visibleIndexes.map((index) => children[index])}
        {visibleIndexes.length === 0 && <p className="col-span-full py-12 text-center text-white/50">아직 이 카테고리의 트렌드가 없어요.</p>}
      </div>
    </section>
  );
}
