import Link from "next/link";

import { categoryStyles, type Expression } from "@/lib/mock-data";

export function ExpressionCard({ expression }: { expression: Expression }) {
  const style = categoryStyles[expression.category];

  return (
    <Link
      href={`/trend/${expression.trendId}#${expression.id}`}
      className="group flex w-72 shrink-0 cursor-pointer snap-start flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-300"
    >
      <div className="flex items-center justify-between">
        <span
          className={`rounded-full px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-widest text-black ${style.tag}`}
        >
          {expression.category}
        </span>
      </div>

      <p className="text-2xl font-black leading-tight text-white transition-colors group-hover:text-lime-200">
        &ldquo;{expression.phrase}&rdquo;
      </p>

      <p className="text-sm font-semibold text-lime-300">
        {expression.meaningKo}
      </p>

      <div className="h-px bg-white/10" />

      <div className="flex flex-col gap-2 text-sm leading-relaxed text-white/60">
        <p>
          <span className="font-mono text-[11px] uppercase tracking-widest text-white/35">
            사용 상황{" "}
          </span>
          {expression.usageSituation}
        </p>
        <p>
          <span className="font-mono text-[11px] uppercase tracking-widest text-white/35">
            뉘앙스{" "}
          </span>
          {expression.nuance}
        </p>
      </div>
    </Link>
  );
}
