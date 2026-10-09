import "server-only";

import type { Category, Trend } from "@/lib/mock-data";

export type AttachedExpression = Trend["expressions"][number] & {
  id: string;
  trendId: string;
  category: Category;
};

export function toExpressions(trend: Trend): AttachedExpression[] {
  return trend.expressions.map((expression, index) => ({
    ...expression,
    id: `${trend.id}-expr-${index}`,
    trendId: trend.id,
    category: trend.category,
  }));
}
