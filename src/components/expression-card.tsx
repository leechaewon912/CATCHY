import Link from "next/link";

import { SaveExpressionButton } from "@/components/save-expression-button";
import { highlightPhraseInText } from "@/lib/highlight-expressions";
import { CATEGORY_BADGE_CLASS, type Expression } from "@/lib/mock-data";

export function ExpressionCard({
  expression,
  trendTitle,
}: {
  expression: Expression;
  trendTitle: string;
}) {
  return (
    <Link
      href={`/trend/${expression.trendId}#${expression.id}`}
      className="surface-card group flex w-72 shrink-0 cursor-pointer snap-start flex-col gap-4 p-5 transition-colors hover:border-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-obsidian"
    >
      <div className="flex items-center justify-between gap-2">
        <span className={CATEGORY_BADGE_CLASS}>{expression.category}</span>
        <SaveExpressionButton expression={expression} trendTitle={trendTitle} variant="icon" />
      </div>

      <p className="line-clamp-2 min-h-[50px] text-[20px] font-semibold leading-tight text-obsidian transition-colors group-hover:text-graphite">
        &ldquo;{expression.phrase}&rdquo;
      </p>

      <p className="line-clamp-2 min-h-10 text-[14px] font-medium leading-snug text-graphite">
        {expression.meaningKo}
      </p>

      <div className="h-px bg-cloud" />

      <div className="flex flex-col gap-2 text-[13px] leading-relaxed text-steel">
        <p className="line-clamp-2 min-h-[43px]">{expression.nuance}</p>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-[12px] text-fog">예문</span>
        <p className="line-clamp-2 min-h-[43px] text-[13px] font-medium leading-relaxed text-graphite">
          {highlightPhraseInText(
            expression.exampleEn,
            expression.phrase,
            "bg-transparent font-semibold text-ember",
          )}
        </p>
        <p className="line-clamp-2 min-h-10 text-[12px] leading-relaxed text-fog">
          {expression.exampleKo}
        </p>
      </div>
    </Link>
  );
}
