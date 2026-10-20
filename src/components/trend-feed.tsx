"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";
import { TrendCard } from "@/components/trend-card";
import { CATEGORY_DISPLAY_LABELS } from "@/lib/category-display";
import type { Category, Trend } from "@/lib/mock-data";

// Every filter combination (day × category) paginates the same way once
// it's past one page — see buildPageItems/TrendFeedPagination below.
const PAGE_SIZE = 6;

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
        title: `${selectedDay}요일의 이야기를 준비하고 있어요.`,
        description: `새로운 콘텐츠는 ${selectedDay}요일 오전 9시에 공개돼요.`,
      };
    }

    if (selectedIndex === todayIndex && kstHour(now) < RELEASE_HOUR_KST) {
      // Case 1 — today, before the daily 9am KST release.
      return {
        title: "오늘의 이야기를 준비하고 있어요.",
        description: "새로운 콘텐츠는 오전 9시에 공개돼요.",
      };
    }
  }

  // Case 3 — today after 9am with nothing yet (collection/generation
  // running late or failed), a past day that never got content, or
  // "전체" with nothing at all this week.
  return {
    title: "아직 새로운 이야기가 없어요.",
    description: "새로운 콘텐츠가 준비되면 이곳에서 확인할 수 있어요.",
  };
}

type PageItem = number | "ellipsis-start" | "ellipsis-end";

// Standard "1 … 4 5 6 … 12" windowing: first page, last page, the
// current page, and one sibling on each side — collapsed into an
// ellipsis once there's a gap, so the control stays a fixed width
// instead of growing with the trend count.
function buildPageItems(current: number, total: number): PageItem[] {
  const SIBLING_COUNT = 1;
  const minVisible = SIBLING_COUNT * 2 + 5; // first + last + current + 2 siblings + room for both ellipses

  if (total <= minVisible) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const leftSibling = Math.max(current - SIBLING_COUNT, 1);
  const rightSibling = Math.min(current + SIBLING_COUNT, total);
  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < total - 1;

  if (!showLeftEllipsis && showRightEllipsis) {
    const leftRange = Array.from({ length: 3 + SIBLING_COUNT * 2 }, (_, i) => i + 1);
    return [...leftRange, "ellipsis-end", total];
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    const rightCount = 3 + SIBLING_COUNT * 2;
    const rightRange = Array.from({ length: rightCount }, (_, i) => total - rightCount + 1 + i);
    return [1, "ellipsis-start", ...rightRange];
  }

  const middleRange = Array.from(
    { length: rightSibling - leftSibling + 1 },
    (_, i) => leftSibling + i,
  );
  return [1, "ellipsis-start", ...middleRange, "ellipsis-end", total];
}

function TrendFeedPagination({
  page,
  totalPages,
  onPageChange,
  navRef,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  navRef: RefObject<HTMLElement | null>;
}) {
  const pageButtonClass =
    "flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-pills text-[14px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-obsidian sm:h-9 sm:w-9";

  return (
    <nav
      ref={navRef}
      className="mt-8 flex flex-wrap items-center justify-center gap-1"
      aria-label="트렌드 목록 페이지"
    >
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        aria-label="이전 페이지"
        className={`${pageButtonClass} text-iron hover:bg-cloud disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent`}
      >
        <ChevronLeftIcon className="h-4 w-4" />
      </button>

      {buildPageItems(page, totalPages).map((item, index) =>
        typeof item === "number" ? (
          <button
            key={item}
            type="button"
            aria-current={item === page ? "page" : undefined}
            onClick={() => onPageChange(item)}
            className={`${pageButtonClass} ${item === page ? "bg-obsidian text-snow" : "text-iron hover:bg-cloud"}`}
          >
            {item}
          </button>
        ) : (
          <span
            key={`${item}-${index}`}
            aria-hidden
            className="flex h-8 w-8 shrink-0 items-center justify-center text-[14px] text-ash sm:h-9 sm:w-9"
          >
            …
          </span>
        ),
      )}

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        aria-label="다음 페이지"
        className={`${pageButtonClass} text-iron hover:bg-cloud disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent`}
      >
        <ChevronRightIcon className="h-4 w-4" />
      </button>
    </nav>
  );
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
  const [currentPage, setCurrentPage] = useState(1);
  const resultsRef = useRef<HTMLDivElement>(null);
  const paginationNavRef = useRef<HTMLElement>(null);
  // Screen-space (viewport-relative) top of the pagination nav right
  // before a desktop page change, so the layout effect below can
  // restore it afterward — see changePage's comment for why this is
  // needed on top of just leaving window.scrollY untouched.
  const pendingScrollAnchorRef = useRef<number | null>(null);

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

  const totalPages = Math.max(1, Math.ceil(visibleItems.length / PAGE_SIZE));
  // Defensive clamp only — currentPage is reset to 1 on every filter
  // change below, so this only matters if visibleItems' length changes
  // out from under an already-selected page some other way.
  const safePage = Math.min(currentPage, totalPages);
  const pageStartIndex = (safePage - 1) * PAGE_SIZE;
  const displayedItems = visibleItems.slice(pageStartIndex, pageStartIndex + PAGE_SIZE);
  const showPagination = visibleItems.length > PAGE_SIZE;

  function changePage(nextPage: number) {
    // PC (≥1024px, Tailwind's `lg` — same breakpoint the responsive
    // --radius-cards token uses) keeps the viewport exactly where it
    // was: the 3-column grid is short enough there that jumping to its
    // top on every page click read as a jarring "did the page just
    // reload" flash. Mobile/tablet's single-column grid is tall enough
    // that the jump is still worth keeping.
    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;

    if (isDesktop) {
      // Leaving window.scrollY untouched isn't actually enough on its
      // own: a day/category combo whose last page has fewer than
      // PAGE_SIZE cards (e.g. 8 results -> page 2 has only 2) makes the
      // grid shorter, so everything below it — pagination, the next
      // section — slides up into the still-unmoved viewport. That reads
      // as "the screen changed" even though scrollY never did. Record
      // where the pagination nav sits on screen now; the layout effect
      // below restores that exact position after the new page's shorter
      // (or taller) grid has reflowed it, so nothing visibly shifts.
      pendingScrollAnchorRef.current =
        paginationNavRef.current?.getBoundingClientRect().top ?? null;
    }

    setCurrentPage(nextPage);

    if (!isDesktop) {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  useLayoutEffect(() => {
    const anchorTop = pendingScrollAnchorRef.current;
    if (anchorTop === null) return;
    pendingScrollAnchorRef.current = null;

    const newTop = paginationNavRef.current?.getBoundingClientRect().top;
    if (newTop === undefined) return;

    const delta = newTop - anchorTop;
    if (delta !== 0) {
      window.scrollBy(0, delta);
    }
  }, [safePage]);

  return (
    <section className="mx-auto max-w-6xl px-5 pt-10 sm:px-8" aria-labelledby="trend-feed-heading">
      <div className="mb-6">
        <h2 id="trend-feed-heading" className="text-[32px] font-semibold leading-[1.5] text-obsidian">일상에 영감을 주는 이야기</h2>
        <p className="mt-1 text-[13px] text-fog" role="status" aria-live="polite">
          {selectedDay} ·{" "}
          {selectedCategory === "전체" ? selectedCategory : CATEGORY_DISPLAY_LABELS[selectedCategory]} ·{" "}
          {visibleItems.length}개 트렌드
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
                setCurrentPage(1);
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
              setCurrentPage(1);
            }}
            className={`shrink-0 cursor-pointer rounded-pills border px-4 py-2.5 text-[14px] font-normal transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-obsidian focus-visible:ring-offset-2 focus-visible:ring-offset-paper ${selectedCategory === category ? "border-obsidian bg-obsidian text-snow" : "border-cloud bg-snow text-iron hover:border-ash hover:text-graphite"}`}>
            {category === "전체" ? category : CATEGORY_DISPLAY_LABELS[category]}
          </button>
        ))}
      </div>
      <div className="mb-6 h-px bg-cloud" />

      <div
        id="trend-results"
        ref={resultsRef}
        className="grid scroll-mt-24 grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        {displayedItems.map((item, index) => (
          <TrendCard key={item.trend.id} trend={item.trend} position={pageStartIndex + index + 1} />
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

      {showPagination && (
        <TrendFeedPagination
          page={safePage}
          totalPages={totalPages}
          onPageChange={changePage}
          navRef={paginationNavRef}
        />
      )}
    </section>
  );
}
