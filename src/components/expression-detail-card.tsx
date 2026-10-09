"use client";

import { useEffect, useState } from "react";

import { SaveExpressionButton } from "@/components/save-expression-button";
import { highlightPhraseInText } from "@/lib/highlight-expressions";
import type { Expression } from "@/lib/mock-data";

export function ExpressionDetailCard({
  expression,
  trendTitle,
}: {
  expression: Expression;
  trendTitle: string;
}) {
  const [isTarget, setIsTarget] = useState(false);

  useEffect(() => {
    function check() {
      setIsTarget(window.location.hash === `#${expression.id}`);
    }
    check();
    window.addEventListener("hashchange", check);
    return () => window.removeEventListener("hashchange", check);
  }, [expression.id]);

  return (
    <article
      id={expression.id}
      className={[
        "surface-card scroll-mt-24 p-6 transition-shadow sm:p-8",
        isTarget ? "border-ember ring-2 ring-ember ring-offset-2 ring-offset-paper" : "",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[32px] font-semibold leading-tight text-obsidian">
            &ldquo;{expression.phrase}&rdquo;
          </p>
          <p className="mt-2 text-[16px] font-medium text-graphite">
            {expression.meaningKo}
          </p>
        </div>
        <SaveExpressionButton expression={expression} trendTitle={trendTitle} />
      </div>

      <div className="my-5 h-px bg-cloud" />

      <div className="flex flex-col gap-4 text-[14px] leading-relaxed text-steel">
        <p>
          <span className="mr-2 text-[12px] text-fog">뉘앙스</span>
          {expression.nuance}
        </p>
        {expression.comparison && (
          <div className="surface-card-subtle p-4">
            <span className="mb-2 block text-[12px] text-fog">비슷하지만 다른 표현</span>
            <p className="font-medium text-graphite">&ldquo;{expression.comparison.phrase}&rdquo;</p>
            <p className="mt-1 text-fog">{expression.comparison.nuanceDiff}</p>
          </div>
        )}
        <div className="surface-card-subtle p-4">
          <span className="mb-2 block text-[12px] text-fog">예문</span>
          <p className="font-medium text-graphite">
            {highlightPhraseInText(expression.exampleEn, expression.phrase)}
          </p>
          <p className="mt-1 text-fog">{expression.exampleKo}</p>
        </div>
        {expression.dailyExampleEn && expression.dailyExampleKo && (
          <div className="surface-card-subtle p-4">
            <span className="mb-2 block text-[12px] text-fog">일상 속 예문</span>
            <p className="font-medium text-graphite">
              {highlightPhraseInText(expression.dailyExampleEn, expression.phrase)}
            </p>
            <p className="mt-1 text-fog">{expression.dailyExampleKo}</p>
          </div>
        )}
      </div>
    </article>
  );
}
