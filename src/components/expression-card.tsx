import Link from "next/link";

import { CATEGORY_BADGE_CLASS, type Expression } from "@/lib/mock-data";

export function ExpressionCard({ expression }: { expression: Expression }) {
  return (
    <Link
      href={`/trend/${expression.trendId}#${expression.id}`}
      className="surface-card group flex w-72 shrink-0 cursor-pointer snap-start flex-col gap-4 p-5 transition-colors hover:border-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-obsidian"
    >
      <div className="flex items-center justify-between">
        <span className={CATEGORY_BADGE_CLASS}>{expression.category}</span>
      </div>

      <p className="text-[20px] font-semibold leading-tight text-obsidian transition-colors group-hover:text-graphite">
        &ldquo;{expression.phrase}&rdquo;
      </p>

      <p className="text-[14px] font-medium text-graphite">{expression.meaningKo}</p>

      <div className="h-px bg-cloud" />

      <div className="flex flex-col gap-2 text-[13px] leading-relaxed text-steel">
        <p>
          <span className="text-[12px] text-fog">뉘앙스 </span>
          {expression.nuance}
        </p>
      </div>
    </Link>
  );
}
