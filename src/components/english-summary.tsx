"use client";

import { highlightExpressionsInText } from "@/lib/highlight-expressions";
import { trackExpressionClicked } from "@/lib/mixpanel-client";
import type { Category, Expression } from "@/lib/mock-data";

// Thin client wrapper around highlightExpressionsInText purely so the
// highlighted phrase links can carry an onClick — a Server Component
// (src/app/trend/[id]/page.tsx) can't pass a closure as a prop into
// elements it renders directly, since event handlers can't cross the
// server/client boundary. Markup/classes are identical to what used to
// be inlined directly in the page.
export function EnglishSummary({
  text,
  expressions,
  trendId,
  category,
}: {
  text: string;
  expressions: Expression[];
  trendId: string;
  category: Category;
}) {
  function handlePhraseClick(expression: Expression) {
    trackExpressionClicked({
      expression_id: expression.id,
      trend_id: trendId,
      category,
      interaction_type: "highlighted_phrase",
    });
  }

  // whitespace-pre-line: englishSummary may contain literal "\n\n"
  // paragraph breaks (culture editorials, hand-written or GPT-generated)
  // — without this, consecutive newlines collapse under normal HTML
  // whitespace handling and the text reads as one run-on block.
  // Single-paragraph content (no newlines) renders identically either
  // way, so this is safe for existing RSS-sourced summaries.
  return (
    <p lang="en" className="whitespace-pre-line text-body leading-8 text-graphite sm:text-body-lg">
      {highlightExpressionsInText(text, expressions, handlePhraseClick)}
    </p>
  );
}
