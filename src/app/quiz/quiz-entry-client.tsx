"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type { Category } from "@/lib/mock-data";
import { readRecentTrendIds } from "@/lib/recent-trends";

export type QuizPickerTrend = {
  id: string;
  title: string;
  category: Category;
  summary: string;
  expressionCount: number;
};

// mock-data.ts is "server-only", so this client component can't import
// its CATEGORY_BADGE_CLASS value — it's just this one static utility
// class name (see .badge-outline in globals.css), safe to inline here.
const CATEGORY_BADGE_CLASS = "badge-outline";

// Same order as the category filter pills on the home trend feed (see
// CATEGORY_FILTERS in trend-feed.tsx) — mock-data.ts's Category type is
// server-only and can't be imported here for an authoritative list, so
// this is duplicated rather than derived.
const CATEGORY_ORDER: Category[] = [
  "음악",
  "영화·시리즈",
  "밈·인터넷",
  "라이프스타일",
  "테크·게임",
  "스포츠",
  "글로벌 이슈",
];

export function QuizEntryClient({ trends }: { trends: QuizPickerTrend[] }) {
  const [recentTrendId, setRecentTrendId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Reading localStorage must happen post-mount, not during render, so
    // the server-rendered markup (no window) and first client paint match.
    const recentIds = readRecentTrendIds();
    const match = recentIds.find((id) => trends.some((trend) => trend.id === id));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRecentTrendId(match ?? null);
    setHydrated(true);
  }, [trends]);

  if (trends.length === 0) {
    return (
      <p className="mt-10 text-[14px] text-fog">
        오늘 생성된 트렌드가 아직 없어요. 잠시 후 다시 확인해주세요.
      </p>
    );
  }

  // Before hydration (and whenever there's no matching recent trend),
  // today's top trend (the feed's first item) is the featured pick —
  // same priority order the home page's hero section uses.
  const featuredTrend =
    (hydrated && recentTrendId && trends.find((trend) => trend.id === recentTrendId)) ||
    trends[0];
  const featuredIsRecent = hydrated && recentTrendId === featuredTrend.id;
  const otherTrends = trends.filter((trend) => trend.id !== featuredTrend.id);

  // Grouped by category, in CATEGORY_ORDER, instead of one flat mixed
  // grid — categories with no remaining trends are dropped rather than
  // rendered as an empty section.
  const otherTrendsByCategory = CATEGORY_ORDER.map((category) => ({
    category,
    trends: otherTrends.filter((trend) => trend.category === category),
  })).filter((group) => group.trends.length > 0);

  return (
    <div className="mt-8 flex flex-col gap-10">
      <div>
        <p className="mb-3 text-[13px] font-medium text-ember">
          {featuredIsRecent ? "최근 본 트렌드로 퀴즈 풀기" : "오늘의 주요 트렌드로 퀴즈 풀기"}
        </p>
        <Link
          href={`/quiz?trend=${featuredTrend.id}&entry=quiz_picker`}
          className="surface-dark group flex cursor-pointer flex-col gap-3 p-6 transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-paper focus-visible:ring-snow sm:p-8"
        >
          <span className="badge-filled self-start">{featuredTrend.category}</span>
          <h2 className="text-[24px] font-semibold leading-snug text-snow sm:text-[28px]">
            {featuredTrend.title}
          </h2>
          <p className="text-[14px] leading-relaxed text-mist">{featuredTrend.summary}</p>
          <span className="mt-2 text-[12px] text-ash">표현 {featuredTrend.expressionCount}개</span>
        </Link>
      </div>

      {otherTrendsByCategory.length > 0 && (
        <div className="flex flex-col gap-8">
          {otherTrendsByCategory.map(({ category, trends: categoryTrends }) => (
            <div key={category}>
              <p className="mb-3 text-[13px] font-medium text-fog">{category}</p>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {categoryTrends.map((trend) => (
                  <Link
                    key={trend.id}
                    href={`/quiz?trend=${trend.id}&entry=quiz_picker`}
                    className="surface-card group flex cursor-pointer flex-col transition-colors hover:border-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-obsidian"
                  >
                    <div className="p-5 pb-0">
                      <span className={CATEGORY_BADGE_CLASS}>{trend.category}</span>
                    </div>

                    <div className="flex flex-1 flex-col gap-3 p-5">
                      <h3 className="text-[18px] font-semibold leading-snug text-obsidian transition-colors group-hover:text-graphite">
                        {trend.title}
                      </h3>
                      <p className="line-clamp-2 text-[14px] leading-relaxed text-fog">
                        {trend.summary}
                      </p>
                      <p className="mt-auto text-[12px] text-fog">
                        표현 {trend.expressionCount}개
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
