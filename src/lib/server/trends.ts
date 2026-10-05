import "server-only";

import { getAllowedSources } from "@/lib/server/sources";
import { getDailyContentCandidates } from "@/lib/server/candidates";
import { validateContentCandidate } from "@/lib/server/validate-candidate";
import { generateTrendDraftFromCandidate, type Trend } from "@/lib/server/generate-trend-draft";

export type { Trend, TrendSource, Expression, QuizQuestion } from "@/lib/server/generate-trend-draft";

// 자동 게시는 하지 않는다. 사람이 수동으로 검토를 마친 후보의 원문 URL만
// 여기에 올려 published 처리한다 — 지금 단계에서는 별도 관리자 화면 없이
// 이 목록으로 수동 검토 결과를 흉내 낸다. (파생되는 trend.id는 slug 길이
// 제한 때문에 예측하기 쉽지 않으므로, 후보 자체를 식별하는 originalUrl을
// 기준으로 삼는다.)
const MANUALLY_REVIEWED_URLS = new Set<string>([
  "https://globalvoices.org/2026/10/05/too-young-to-run-old-enough-to-protest-west-africas-unfinished-democratic-bargain/",
  "https://www.nasa.gov/artemisprogram/",
]);
const REVIEWED_AT = "2026-10-06T00:00:00.000Z";

function buildAllTrends(): Trend[] {
  const sources = getAllowedSources();
  const candidates = getDailyContentCandidates();

  const drafts: Trend[] = [];
  for (const candidate of candidates) {
    const validation = validateContentCandidate(candidate, sources);
    if (!validation.valid) continue;

    const source = sources.find((s) => s.id === candidate.sourceId);
    if (!source) continue;

    const draft = generateTrendDraftFromCandidate(candidate, source);
    if (MANUALLY_REVIEWED_URLS.has(candidate.originalUrl)) {
      drafts.push({ ...draft, status: "published", reviewedAt: REVIEWED_AT });
    } else {
      drafts.push(draft);
    }
  }
  return drafts;
}

const ALL_TRENDS = buildAllTrends();

export function getPublishedTrends(): Trend[] {
  return ALL_TRENDS.filter((trend) => trend.status === "published");
}

export function getTrendById(id: string): Trend | undefined {
  return getPublishedTrends().find((trend) => trend.id === id);
}
