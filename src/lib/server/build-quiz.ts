import "server-only";

import type { ExpressionSeed, QuizQuestionSeed } from "@/lib/mock-data";

// Shared by the hand-written mock trends (src/lib/mock-data.ts) and the
// GDELT-collected trends (src/lib/server/db/read-trends.ts) so both
// produce quiz questions the same way — quiz rows aren't stored in
// Supabase, they're derived from expressions at read time.
export function buildQuizFromExpressions(expressions: ExpressionSeed[]): QuizQuestionSeed[] {
  return expressions.map((expression, index) => {
    const distractorPool = expressions
      .filter((_, i) => i !== index)
      .map((e) => e.meaningKo);
    const options = [expression.meaningKo, ...distractorPool];
    const rotation = index % options.length;
    const optionsKo = [...options.slice(rotation), ...options.slice(0, rotation)];
    return {
      phrase: expression.phrase,
      correctMeaningKo: expression.meaningKo,
      optionsKo,
    };
  });
}
