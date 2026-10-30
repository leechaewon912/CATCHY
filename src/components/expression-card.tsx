"use client";

import Link from "next/link";

import { SaveExpressionButton } from "@/components/save-expression-button";
import { CATEGORY_BADGE_CLASS, CATEGORY_DISPLAY_LABELS } from "@/lib/category-display";
import { highlightPhraseInText } from "@/lib/highlight-expressions";
import { trackExpressionClicked } from "@/lib/mixpanel-client";
import type { Expression } from "@/lib/mock-data";

export function ExpressionCard({
  expression,
  trendTitle,
}: {
  expression: Expression;
  trendTitle: string;
}) {
  function handleClick() {
    trackExpressionClicked({
      expression_id: expression.id,
      trend_id: expression.trendId,
      category: expression.category,
      interaction_type: "home_card",
    });
  }

  return (
    <Link
      href={`/trend/${expression.trendId}#${expression.id}`}
      onClick={handleClick}
      className="surface-card group flex w-72 shrink-0 cursor-pointer snap-start flex-col gap-4 p-5 transition-colors hover:border-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-obsidian"
    >
      <div className="flex items-center justify-between gap-2">
        <span className={CATEGORY_BADGE_CLASS}>{CATEGORY_DISPLAY_LABELS[expression.category]}</span>
        <SaveExpressionButton expression={expression} trendTitle={trendTitle} variant="icon" />
      </div>

      <p className="line-clamp-2 min-h-[50px] text-subheading font-semibold leading-tight text-obsidian transition-colors group-hover:text-graphite">
        {expression.phrase}
      </p>

      <p className="line-clamp-2 min-h-10 type-body-kr text-graphite">
        {expression.meaningKo}
      </p>

      <div className="h-px bg-cloud" />

      {expression.nuance && (
        <div className="text-kr-body flex flex-col gap-2 text-label text-steel">
          <p className="line-clamp-2 min-h-[43px]">{expression.nuance}</p>
        </div>
      )}

      <div className="flex flex-col gap-1">
        <span className="type-caption text-fog">예문</span>
        <p className="line-clamp-2 min-h-[43px] text-label font-medium leading-relaxed text-graphite">
          {highlightPhraseInText(
            expression.exampleEn,
            expression.phrase,
            "bg-transparent font-semibold text-ember",
          )}
        </p>
        <p className="text-kr-body line-clamp-2 min-h-10 text-caption text-fog">
          {expression.exampleKo}
        </p>
      </div>
    </Link>
  );
}
