"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { ArrowUpRightIcon } from "@/components/icons";
import { CATEGORY_DISPLAY_LABELS } from "@/lib/category-display";
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
      <p className="text-kr-body mt-10 text-[14px] text-fog">
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

  return (
    <div className="mt-8 flex flex-col gap-10">
      {/* src/components/quiz-banner.tsx(홈 화면 "방금 배운 표현, 기억하고
          있나요?" 배너)와 동일한 UI — surface-card, eyebrow, 제목/설명,
          btn-solid-black CTA. 이전엔 surface-dark(어두운 배경) 카드였다. */}
      <div className="surface-card flex flex-col items-start justify-between gap-6 p-6 sm:flex-row sm:items-center sm:p-10">
        <div className="flex flex-col gap-3">
          <span className="text-[12px] font-medium text-ember">
            {featuredIsRecent ? "최근 본 이야기로 퀴즈 풀기" : "오늘의 주요 트렌드로 퀴즈 풀기"}
          </span>
          <h2 className="max-w-md break-keep text-[24px] font-semibold leading-snug text-obsidian sm:text-[32px] sm:leading-tight">
            {featuredTrend.title}
          </h2>
          <p className="text-kr-body max-w-md break-keep text-[14px] text-fog">{featuredTrend.summary}</p>
        </div>

        <Link
          href={`/quiz?trend=${featuredTrend.id}&entry=quiz_picker`}
          className="btn-solid-black group shrink-0"
        >
          퀴즈 풀기
          <ArrowUpRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>

      {otherTrends.length > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {otherTrends.map((trend) => (
            <Link
              key={trend.id}
              href={`/quiz?trend=${trend.id}&entry=quiz_picker`}
              className="surface-card group flex cursor-pointer flex-col transition-colors hover:border-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-obsidian"
            >
              <div className="p-5 pb-0">
                <span className={CATEGORY_BADGE_CLASS}>{CATEGORY_DISPLAY_LABELS[trend.category]}</span>
              </div>

              <div className="flex flex-1 flex-col gap-3 p-5">
                <h3 className="text-[18px] font-semibold leading-snug text-obsidian transition-colors group-hover:text-graphite">
                  {trend.title}
                </h3>
                <p className="text-kr-body line-clamp-2 text-[14px] text-fog">
                  {trend.summary}
                </p>
                <p className="mt-auto text-[12px] text-fog">
                  표현 {trend.expressionCount}개
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
