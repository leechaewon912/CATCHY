import { categoryStyles, type Expression } from "@/lib/mock-data";

export function ExpressionCard({ expression }: { expression: Expression }) {
  const style = categoryStyles[expression.sourceCategory];

  return (
    <article className="flex w-72 shrink-0 snap-start flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-center justify-between">
        <span
          className={`rounded-full px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-widest text-black ${style.tag}`}
        >
          {expression.sourceCategory}
        </span>
      </div>

      <p className="text-2xl font-black leading-tight text-white">
        &ldquo;{expression.phrase}&rdquo;
      </p>

      <p className="text-sm font-semibold text-lime-300">
        {expression.meaning}
      </p>

      <div className="h-px bg-white/10" />

      <div className="flex flex-col gap-2 text-sm leading-relaxed text-white/60">
        <p>
          <span className="font-mono text-[11px] uppercase tracking-widest text-white/35">
            사용 상황{" "}
          </span>
          {expression.situation}
        </p>
        <p>
          <span className="font-mono text-[11px] uppercase tracking-widest text-white/35">
            문화적 맥락{" "}
          </span>
          {expression.context}
        </p>
      </div>
    </article>
  );
}
