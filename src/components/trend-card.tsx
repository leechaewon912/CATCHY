import { BookmarkIcon } from "@/components/icons";
import { categoryStyles, type Trend } from "@/lib/mock-data";

export function TrendCard({ trend }: { trend: Trend }) {
  const style = categoryStyles[trend.category];

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition-colors hover:border-white/25">
      <div
        className={`relative flex h-36 items-start justify-between bg-gradient-to-br ${style.gradient} p-4`}
      >
        <span
          className={`rounded-full px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-widest text-black ${style.tag}`}
        >
          {trend.category}
        </span>
        <button
          type="button"
          aria-label="트렌드 저장"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-black/20 text-black/80 transition-colors hover:bg-black/30"
        >
          <BookmarkIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="text-lg font-bold leading-snug text-white">
          {trend.title}
        </h3>
        <p className="line-clamp-2 text-sm leading-relaxed text-white/55">
          {trend.summary}
        </p>

        <div className="mt-auto flex items-center justify-between pt-2 font-mono text-[11px] uppercase tracking-widest text-white/40">
          <span>{trend.sourcesCount}개 매체 종합</span>
          <span className="rounded-full border border-lime-300/40 px-2 py-1 text-lime-300">
            표현 {trend.expressionsCount}개
          </span>
        </div>
      </div>
    </article>
  );
}
