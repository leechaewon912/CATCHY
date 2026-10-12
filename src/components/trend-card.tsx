"use client";

import Link from "next/link";

import { trackTrendClicked } from "@/lib/mixpanel-client";
import type { Trend } from "@/lib/mock-data";

// mock-data.ts is "server-only", so this client component can't import
// its CATEGORY_BADGE_CLASS value — it's just this one static utility
// class name (see .badge-outline in globals.css), safe to inline here
// (same workaround already used by src/app/quiz/quiz-entry-client.tsx).
const CATEGORY_BADGE_CLASS = "badge-outline";

// `position` is this card's 1-based rank among what's *currently
// displayed* in src/components/trend-feed.tsx — after the category/day
// filters there, not this trend's rank in the unfiltered feed — so
// trackTrendClicked always matches what the user actually sees.
export function TrendCard({ trend, position }: { trend: Trend; position: number }) {
  function handleClick() {
    trackTrendClicked({
      trend_id: trend.id,
      category: trend.category,
      position,
    });
  }

  return (
    <Link
      href={`/trend/${trend.id}`}
      onClick={handleClick}
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
      </div>
    </Link>
  );
}
