import "server-only";

import type { AllowedSource } from "@/lib/server/sources";
import type { ContentCandidate } from "@/lib/server/candidates";

// factMemo는 기사 본문이 아니라 짧은 사실 메모여야 한다. 이 길이를 넘으면
// 사실상 원문 요약/복제에 가까워진 것으로 보고 제외한다.
const MAX_FACT_MEMO_LENGTH = 300;

export type ValidationResult =
  | { valid: true }
  | { valid: false; reason: string };

export function validateContentCandidate(
  candidate: ContentCandidate,
  allowedSources: AllowedSource[],
): ValidationResult {
  const source = allowedSources.find((s) => s.id === candidate.sourceId);

  if (!source) {
    return { valid: false, reason: `허용 목록에 없는 출처입니다: ${candidate.sourceId}` };
  }
  if (!source.allowed) {
    return { valid: false, reason: `출처가 허용되지 않음: ${source.id}` };
  }
  if (!source.allowsCommercialUse) {
    return { valid: false, reason: `상업적 이용이 허용되지 않는 출처: ${source.id}` };
  }
  if (!source.allowsAdaptation) {
    return { valid: false, reason: `2차 저작물 작성이 허용되지 않는 출처: ${source.id}` };
  }
  if (!candidate.originalUrl) {
    return { valid: false, reason: "originalUrl이 비어 있습니다." };
  }
  if (!candidate.originalTitle) {
    return { valid: false, reason: "originalTitle이 비어 있습니다." };
  }
  if (candidate.factMemo.length > MAX_FACT_MEMO_LENGTH) {
    return {
      valid: false,
      reason: `factMemo가 너무 깁니다 (${candidate.factMemo.length}자) — 기사 본문처럼 길면 안 됩니다.`,
    };
  }

  return { valid: true };
}
