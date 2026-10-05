import "server-only";

// 이 파일은 더 이상 손으로 쓴 데모 데이터를 담고 있지 않다. 실제로는
// src/lib/server의 허용 목록 기반 콘텐츠 파이프라인(getAllowedSources →
// getDailyContentCandidates → validateContentCandidate →
// generateTrendDraftFromCandidate → getPublishedTrends)이 만든 결과를
// 그대로 내보내는 얇은 어댑터 레이어다. 기존 페이지/컴포넌트의 import 경로를
// 바꾸지 않기 위해 파일명은 유지했다.
import { getPublishedTrends, type Trend as PipelineTrend } from "@/lib/server/trends";

export type Category = "글로벌 이슈" | "디지털 권리" | "과학·우주";

export type { TrendSource } from "@/lib/server/trends";
export type Trend = PipelineTrend;

export type Expression = PipelineTrend["expressions"][number] & {
  id: string;
  trendId: string;
  category: Category;
};

export const categoryStyles: Record<Category, { gradient: string; tag: string }> = {
  "글로벌 이슈": {
    gradient: "from-indigo-500 to-blue-500",
    tag: "bg-indigo-300",
  },
  "디지털 권리": {
    gradient: "from-cyan-500 to-sky-400",
    tag: "bg-cyan-300",
  },
  "과학·우주": {
    gradient: "from-violet-500 via-fuchsia-500 to-rose-500",
    tag: "bg-fuchsia-300",
  },
};

export const trends: Trend[] = getPublishedTrends();
export const allTrends: Trend[] = trends;
export const heroTrend: Trend = trends[0];

function attachContext(trend: Trend): Expression[] {
  return trend.expressions.map((expression, index) => ({
    ...expression,
    id: `${trend.id}-expr-${index}`,
    trendId: trend.id,
    category: trend.category,
  }));
}

export function getTrendById(id: string): Trend | undefined {
  return trends.find((trend) => trend.id === id);
}

export function getExpressionsByTrendId(trendId: string): Expression[] {
  const trend = getTrendById(trendId);
  return trend ? attachContext(trend) : [];
}

export const featuredExpressions: Expression[] = trends.flatMap((trend) => {
  const [first] = attachContext(trend);
  return first ? [first] : [];
});

export const quizStats = {
  questionCount: 3,
  estimatedMinutes: 1,
  reviewDue: trends.length * 3,
  streakDays: 5,
};

export type QuizQuestion = {
  id: string;
  phrase: string;
  correctMeaning: string;
  options: string[];
};

export function buildQuizQuestions(params?: {
  trendId?: string;
  count?: number;
}): QuizQuestion[] {
  const pool = params?.trendId
    ? trends.filter((trend) => trend.id === params.trendId)
    : trends;

  const allQuestions: QuizQuestion[] = pool.flatMap((trend) =>
    trend.quiz.map((question, index) => ({
      id: `${trend.id}-quiz-${index}`,
      phrase: question.phrase,
      correctMeaning: question.correctMeaningKo,
      options: question.optionsKo,
    })),
  );

  const count = params?.count ?? allQuestions.length;
  return allQuestions.slice(0, count);
}
