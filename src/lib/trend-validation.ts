import type { Trend } from "@/lib/mock-data";

// 출처 2개 이상 — 기사 한 편을 재가공한 콘텐츠가 아니라, 여러 공개 출처에서
// 공통으로 확인되는 사실을 바탕으로 작성됐는지를 걸러내는 최소 기준.
//
// 단, 출처가 정확히 1개뿐이고 그 출처가 공식 기관(sourceType "official")인
// 경우는 통과시킨다. collect-trends.ts의 singleSourceEligible 게이트가
// "sourceType이 official이면서 라이선스 레지스트리에서 상업적 이용이
// 확인된 출처"만 1개-출처 트렌드로 저장하므로, 여기서 다시 레지스트리를
// 조회하지 않고 sourceType만 확인해도 안전하다 — 그 조합(출처 1개 +
// official)은 애초에 그 게이트를 통과한 트렌드에서만 나타난다. 일반 매체
// (media)·플랫폼(platform) 출처는 여전히 2개 이상이 필요하다.
export function hasEnoughSources(trend: Trend): boolean {
  if (trend.sources.length >= 2) return true;
  return trend.sources.length === 1 && trend.sources[0].sourceType === "official";
}

// 공식(official) 또는 플랫폼/차트(platform) 출처가 최소 1개 있어야 한다.
// 보조 매체(media) 출처만으로는 충분하지 않다.
export function hasOfficialOrPlatformSource(trend: Trend): boolean {
  return trend.sources.some(
    (source) => source.sourceType === "official" || source.sourceType === "platform",
  );
}

// status가 published여도, 사람이 editorial 단계에서 실수로 기준을 충족하지
// 못한 콘텐츠를 published로 표시했다면 여기서 다시 걸러낸다 — status 필드를
// 그대로 신뢰하지 않는다.
//
// contentOrigin이 "gpt_editorial"인 콘텐츠(RSS 그라운딩 없이 GPT가 자체
// 창작한 컬처 에디토리얼)는 출처 교차 확인 자체가 성립하지 않는 콘텐츠라
// 아래 출처 요건을 면제한다 — RSS 기반 콘텐츠(contentOrigin이 "rss" 또는
// 비어있음)는 기존 요건을 그대로 적용한다.
export function isPublishableTrend(trend: Trend): boolean {
  if (trend.status !== "published") return false;
  if (trend.contentOrigin === "gpt_editorial") return true;
  return hasEnoughSources(trend) && hasOfficialOrPlatformSource(trend);
}
