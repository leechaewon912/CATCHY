"use client";

import { useEffect, useState } from "react";
import { ChevronDownIcon } from "@/components/icons";
import { TrendCard } from "@/components/trend-card";
import type { Category, Trend } from "@/lib/mock-data";

// "전체" 카테고리에서는 모든 카테고리의 카드가 합쳐져 한 번에 너무 많이
// 쌓일 수 있어, 처음엔 이만큼만 보여주고 "더보기"로 나머지를 펼친다.
// 특정 카테고리를 선택하면(이미 카테고리당 최대 6개로 발행이 제한돼
// 있으므로) 이 제한을 적용할 필요가 없다.
const ALL_CATEGORIES_VISIBLE_LIMIT = 6;

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

// Mon→Sun order, matching src/app/page.tsx's weekdayLabelIfThisWeek
// output and this component's own day-tab order (DAY_FILTERS minus
// "전체") — used to tell whether a selected day tab is later this week
// than "today" (Case 2) or is "today" itself (Case 1).
const WEEKDAY_ORDER = DAY_FILTERS.slice(1);

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const RELEASE_HOUR_KST = 9;

// Same "shift by +9h, read back with UTC getters" trick as
// src/app/page.tsx's toKstWallClock/computeThisWeek — kept local to
// this file rather than shared, matching how every other file with KST
// logic in this codebase (src/app/page.tsx, src/app/quiz/page.tsx)
// already does its own small inline version instead of a shared util.
function kstTodayLabel(now: Date): DayFilter {
  const kst = new Date(now.getTime() + KST_OFFSET_MS);
  return WEEKDAY_ORDER[(kst.getUTCDay() + 6) % 7];
}

function kstHour(now: Date): number {
  return new Date(now.getTime() + KST_OFFSET_MS).getUTCHours();
}

export type TrendFeedEmptyState = { title: string; description: string };

// Pure and synchronous specifically so it's unit-testable by passing an
// explicit `now` — see the "검증 시에는 실제 시스템 시간을 변경하지 말고
// 테스트용 시간 주입 등의 방법을 사용" requirement this was written
// against. `dayHasAnyContent` must already reflect the selected day
// *ignoring* the category filter — see resolveDayHasAnyContent below —
// so a day that has content in some other category still falls through
// to `null` (the existing generic per-category empty message) instead
// of claiming the whole day isn't live yet.
export function resolveTrendFeedEmptyState({
  selectedDay,
  dayHasAnyContent,
  now,
}: {
  selectedDay: DayFilter;
  dayHasAnyContent: boolean;
  now: Date;
}): TrendFeedEmptyState | null {
  if (dayHasAnyContent) return null;

  if (selectedDay !== "전체") {
    const todayLabel = kstTodayLabel(now);
    const todayIndex = WEEKDAY_ORDER.indexOf(todayLabel);
    const selectedIndex = WEEKDAY_ORDER.indexOf(selectedDay);

    if (selectedIndex > todayIndex) {
      // Case 2 — a day later this week than today.
      return {
        title: `${selectedDay}요일의 트렌드를 준비하고 있어요.`,
        description: `새로운 콘텐츠는 ${selectedDay}요일 오전 9시에 공개돼요.`,
      };
    }

    if (selectedIndex === todayIndex && kstHour(now) < RELEASE_HOUR_KST) {
      // Case 1 — today, before the daily 9am KST release.
      return {
        title: "오늘의 트렌드를 준비하고 있어요.",
        description: "새로운 콘텐츠는 오전 9시에 공개돼요.",
      };
    }
  }

  // Case 3 — today after 9am with nothing yet (collection/generation
  // running late or failed), a past day that never got content, or
  // "전체" with nothing at all this week.
  return {
    title: "아직 새로운 트렌드가 없어요.",
    description: "새로운 콘텐츠가 준비되면 이곳에서 확인할 수 있어요.",
  };
}

export function TrendFeed({
  items,
  defaultDay,
}: {
  // Full trend + its precomputed dayOfWeek (the Korean weekday label
  // for a trend generated within the current Mon-Sun week in KST, or
  // null if it falls outside that week — see weekdayLabelIfThisWeek in
  // src/app/page.tsx). "전체" excludes null entries too, not just the
  // individual day tabs, since "전체" means "this week", not "every
  // trend ever".
  //
  // TrendFeed renders <TrendCard> itself (rather than taking pre-built
  // cards as children, which this used to do) specifically so each
  // card's `position` prop can be computed fresh every render from its
  // rank in the *currently filtered/displayed* list — trackTrendClicked
  // needs that, not the trend's rank in the unfiltered feed.
  items: { trend: Trend; dayOfWeek: string | null }[];
  // Today's weekday label — the day filter opens on this instead of
  // "전체" so visitors land on today's trends first.
  defaultDay: DayFilter;
}) {
  const [selectedCategory, setSelectedCategory] = useState<Category | "전체">("전체");
  const [selectedDay, setSelectedDay] = useState<DayFilter>(defaultDay);
  const [showAll, setShowAll] = useState(false);

  // Drives resolveTrendFeedEmptyState's Case 1/2/3 wording — ticks every
  // minute so a tab left open across the 9am release or past midnight
  // re-evaluates on its own, without a reload. This only changes which
  // *message* an already-empty state shows; it never assumes content
  // exists — that's still read from `items`, which stays whatever this
  // page load's server-rendered props were (src/app/page.tsx's
  // `force-dynamic` already covers getting fresh data on reload/revisit).
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const visibleItems = items.filter((item) => {
    if (item.dayOfWeek === null) return false;
    const categoryMatches = selectedCategory === "전체" || item.trend.category === selectedCategory;
    const dayMatches = selectedDay === "전체" || item.dayOfWeek === selectedDay;
    return categoryMatches && dayMatches;
  });

  // Whether the *selected day* has any content at all, ignoring the
  // category filter — resolveTrendFeedEmptyState needs this to tell "day
  // not live yet" (Case 1/2/3) apart from "day is live, this one
  // category just has nothing" (existing generic message).
  const dayHasAnyContent =
    selectedDay === "전체"
      ? items.some((item) => item.dayOfWeek !== null)
      : items.some((item) => item.dayOfWeek === selectedDay);

  const emptyState =
    visibleItems.length === 0
      ? resolveTrendFeedEmptyState({ selectedDay, dayHasAnyContent, now })
      : null;

  const isAllCategorySelected = selectedCategory === "전체";
  const canExpandOrCollapse =
    isAllCategorySelected && visibleItems.length > ALL_CATEGORIES_VISIBLE_LIMIT;
  const shouldTruncate = canExpandOrCollapse && !showAll;
  const displayedItems = shouldTruncate
    ? visibleItems.slice(0, ALL_CATEGORIES_VISIBLE_LIMIT)
    : visibleItems;

  return (
    <section className="mx-auto max-w-6xl px-5 pt-10 sm:px-8" aria-labelledby="trend-feed-heading">
      <div className="mb-6">
        <h2 id="trend-feed-heading" className="text-[32px] font-semibold leading-[1.5] text-obsidian">이번 주 트렌드</h2>
        <p className="mt-1 text-[13px] text-fog" role="status" aria-live="polite">
          {selectedDay} · {selectedCategory} · {visibleItems.length}개 트렌드
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
              onClick={() => {
                setSelectedDay(day);
                setShowAll(false);
              }}
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
          <button key={category} type="button" aria-pressed={selectedCategory === category} aria-controls="trend-results" onClick={() => {
              setSelectedCategory(category);
              setShowAll(false);
            }}
            className={`shrink-0 cursor-pointer rounded-pills border px-4 py-2.5 text-[14px] font-normal transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-obsidian focus-visible:ring-offset-2 focus-visible:ring-offset-paper ${selectedCategory === category ? "border-obsidian bg-obsidian text-snow" : "border-cloud bg-snow text-iron hover:border-ash hover:text-graphite"}`}>
            {category}
          </button>
        ))}
      </div>
      <div className="mb-6 h-px bg-cloud" />

      <div id="trend-results" className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {displayedItems.map((item, displayPosition) => (
          <TrendCard key={item.trend.id} trend={item.trend} position={displayPosition + 1} />
        ))}
        {visibleItems.length === 0 &&
          (emptyState ? (
            <div className="col-span-full flex flex-col items-center gap-1 py-12 text-center">
              <p className="text-[16px] font-semibold text-obsidian">{emptyState.title}</p>
              <p className="text-[14px] text-fog">{emptyState.description}</p>
            </div>
          ) : (
            <p className="col-span-full py-12 text-center text-fog">아직 이 조건에 맞는 트렌드가 없어요.</p>
          ))}
      </div>

      {canExpandOrCollapse && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => setShowAll((prev) => !prev)}
            className="flex cursor-pointer items-center gap-1.5 rounded-pills border border-cloud bg-snow px-5 py-2.5 text-[14px] font-medium text-iron transition-colors hover:border-ash hover:text-graphite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-obsidian focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
          >
            {showAll ? "접기" : "더보기"}
            <ChevronDownIcon className={`h-4 w-4 transition-transform ${showAll ? "rotate-180" : ""}`} />
          </button>
        </div>
      )}
    </section>
  );
}
