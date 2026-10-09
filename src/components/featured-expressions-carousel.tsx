"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";

const NAV_BUTTON_CLASS =
  "flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-cloud bg-snow text-fog transition-colors hover:border-ash hover:text-graphite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-obsidian disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-cloud disabled:hover:text-fog";

// Renders its own header row (title + description + nav buttons) so the
// buttons live beside the heading instead of floating over the cards —
// that also means the scroller below gets zero extra margin/padding of
// its own, so its edges land exactly on the same max-w-6xl/px-5/px-8
// bounds as the heading above it.
//
// Takes pre-rendered <ExpressionCard> elements as children rather than
// the raw Expression data (same pattern as TrendFeed) — ExpressionCard
// imports from mock-data.ts, which is "server-only", so it has to keep
// being rendered in the server-component tree (page.tsx). Rendering it
// directly inside this "use client" module would pull mock-data.ts into
// the client bundle and fail the build.
export function FeaturedExpressionsCarousel({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode[];
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    // Boundary-based, not distance-based: "can we scroll further at
    // all" stays correct regardless of how many cards one click moves.
    setCanScrollPrev(el.scrollLeft > 4);
    setCanScrollNext(el.scrollLeft < maxScrollLeft - 4);
  }, []);

  useEffect(() => {
    updateScrollState();
    const el = scrollerRef.current;
    if (!el) return;

    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState]);

  // Moves by however many whole cards fit in the visible width (never a
  // fixed px distance), then scrolls exactly to that card's own
  // snap-start offset — so a click always lands fully on a card, never
  // half-cut-off. cardStep is measured from two real cards' offsets
  // rather than assumed, so it stays correct if card width/gap ever
  // change. Flooring (not rounding) keeps the moved distance within the
  // requested ~80-100% of the visible width: on mobile where only
  // ~1 card fits, this naturally moves 1 card; on desktop where 3-4
  // fit, it moves 3.
  function scrollToAdjacentGroup(direction: 1 | -1) {
    const el = scrollerRef.current;
    if (!el) return;

    const cards = Array.from(el.children).filter(
      (child): child is HTMLElement =>
        child instanceof HTMLElement && child.classList.contains("snap-start"),
    );
    if (cards.length < 2) return;

    const cardStep = cards[1].offsetLeft - cards[0].offsetLeft;
    const cardsPerMove = Math.max(1, Math.floor(el.clientWidth / cardStep));

    let currentIndex = 0;
    let closestDistance = Infinity;
    cards.forEach((card, index) => {
      const distance = Math.abs(card.offsetLeft - el.scrollLeft);
      if (distance < closestDistance) {
        closestDistance = distance;
        currentIndex = index;
      }
    });

    const nextIndex = Math.min(
      Math.max(currentIndex + direction * cardsPerMove, 0),
      cards.length - 1,
    );
    el.scrollTo({ left: cards[nextIndex].offsetLeft, behavior: "smooth" });
  }

  if (children.length === 0) return null;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-[32px] font-semibold leading-[1.5] text-obsidian">
            {title}
          </h2>
          <p className="mt-1 text-[14px] text-fog">{description}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="이전 표현 보기"
            disabled={!canScrollPrev}
            onClick={() => scrollToAdjacentGroup(-1)}
            className={NAV_BUTTON_CLASS}
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="다음 표현 보기"
            disabled={!canScrollNext}
            onClick={() => scrollToAdjacentGroup(1)}
            className={NAV_BUTTON_CLASS}
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* No extra margin/padding here on purpose — this box's edges
          must match the heading's above exactly. snap-mandatory (not
          just snap-x) guarantees a manual swipe/trackpad scroll also
          always settles on a full card, never half-cut-off. */}
      <div
        ref={scrollerRef}
        className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4"
      >
        {children}
      </div>
    </div>
  );
}
