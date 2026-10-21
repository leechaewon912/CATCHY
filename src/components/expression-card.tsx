"use client";

import Link from "next/link";

import { SaveExpressionButton } from "@/components/save-expression-button";
import { CATEGORY_DISPLAY_LABELS } from "@/lib/category-display";
import { highlightPhraseInText } from "@/lib/highlight-expressions";
import { trackExpressionClicked } from "@/lib/mixpanel-client";
import type { Expression } from "@/lib/mock-data";

// mock-data.ts is "server-only", so this client component can't import
// its CATEGORY_BADGE_CLASS value — it's just this one static utility
// class name (see .badge-outline in globals.css), safe to inline here
// (same workaround already used by src/components/trend-card.tsx).
const CATEGORY_BADGE_CLASS = "badge-outline";

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

      <p className="line-clamp-2 min-h-[50px] text-[20px] font-semibold leading-tight text-obsidian transition-colors group-hover:text-graphite">
        {expression.phrase}
      </p>

      <p className="text-kr-body line-clamp-2 min-h-10 text-[14px] text-graphite">
        {expression.meaningKo}
      </p>

      <div className="h-px bg-cloud" />

      {expression.nuance && (
        <div className="text-kr-body flex flex-col gap-2 text-[13px] text-steel">
          <p className="line-clamp-2 min-h-[43px]">{expression.nuance}</p>
        </div>
      )}

      <div className="flex flex-col gap-1">
        <span className="text-[12px] text-fog">예문</span>
        <p className="line-clamp-2 min-h-[43px] text-[13px] font-medium leading-relaxed text-graphite">
          {highlightPhraseInText(
            expression.exampleEn,
            expression.phrase,
            "bg-transparent font-semibold text-ember",
          )}
        </p>
        <p className="text-kr-body line-clamp-2 min-h-10 text-[12px] text-fog">
          {expression.exampleKo}
        </p>
      </div>
    </Link>
  );
}
