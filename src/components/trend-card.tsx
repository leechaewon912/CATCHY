"use client";

import Image from "next/image";
import Link from "next/link";

import { ArrowUpRightIcon } from "@/components/icons";
import { CATEGORY_BADGE_CLASS, CATEGORY_DISPLAY_LABELS } from "@/lib/category-display";
import { trackTrendClicked } from "@/lib/mixpanel-client";
import type { Trend } from "@/lib/mock-data";
import { resolveTrendImage } from "@/lib/trend-image";

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
      className="surface-card group flex cursor-pointer flex-col overflow-hidden transition-transform hover:-translate-y-1 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-obsidian"
    >
      {/* Trends don't have a real image column yet (mock-data.ts / the
          DB schema), so this shows a deterministic Midjourney mock photo
          per trend id — see resolveTrendImage's doc comment. Once a real
          per-trend image exists, passing it through as that function's
          second argument takes over automatically, no JSX change here. */}
      <div className="relative h-36 shrink-0 sm:h-40">
        <Image
          src={resolveTrendImage(trend)}
          alt=""
          fill
          sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
        />
        <span className={`${CATEGORY_BADGE_CLASS} absolute left-3 top-3 bg-snow/90`}>
          {CATEGORY_DISPLAY_LABELS[trend.category]}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="text-body-lg font-semibold leading-snug text-obsidian transition-colors group-hover:text-graphite">
            {trend.englishTitle ?? trend.title}
          </h3>
          <p className="mt-1 line-clamp-1 text-label text-fog">{trend.englishSummary}</p>
        </div>

        <p className="line-clamp-2 type-body-kr text-fog">{trend.summary}</p>

        <span className="mt-auto inline-flex items-center gap-1 text-label font-medium text-obsidian">
          이야기 읽기
          <ArrowUpRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </Link>
  );
}
