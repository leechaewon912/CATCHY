import Link from "next/link";

import { CATEGORY_BADGE_CLASS, type Trend } from "@/lib/mock-data";

export function TrendCard({ trend }: { trend: Trend }) {
  return (
    <Link
      href={`/trend/${trend.id}`}
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
