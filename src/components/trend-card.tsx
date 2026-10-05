import Link from "next/link";

import { BookmarkButton } from "@/components/bookmark-button";
import { categoryStyles, type Trend } from "@/lib/mock-data";

export function TrendCard({ trend }: { trend: Trend }) {
  const style = categoryStyles[trend.category];

  return (
    <Link
      href={`/trend/${trend.id}`}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition-colors hover:border-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-300"
    >
      <div
        className={`relative flex h-36 items-start justify-between bg-gradient-to-br ${style.gradient} p-4`}
      >
        <span
          className={`rounded-full px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-widest text-black ${style.tag}`}
        >
          {trend.category}
        </span>
        <BookmarkButton
          label="트렌드 저장"
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-black/20 text-black/80 transition-colors hover:bg-black/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
        />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="text-lg font-bold leading-snug text-white transition-colors group-hover:text-lime-200">
          {trend.title}
        </h3>
        <p className="line-clamp-2 text-sm leading-relaxed text-white/55">
          {trend.koreanSummary}
        </p>

        <div className="mt-auto flex items-center justify-between pt-2 font-mono text-[11px] uppercase tracking-widest text-white/40">
          <span>출처 {trend.sources.length}개</span>
          <span className="rounded-full border border-lime-300/40 px-2 py-1 text-lime-300">
            표현 {trend.expressions.length}개
          </span>
        </div>
      </div>
    </Link>
  );
}
