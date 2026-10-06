import type { Trend } from "@/lib/mock-data";

// 출처 2개 이상 — 기사 한 편을 재가공한 콘텐츠가 아니라, 여러 공개 출처에서
// 공통으로 확인되는 사실을 바탕으로 작성됐는지를 걸러내는 최소 기준.
export function hasEnoughSources(trend: Trend): boolean {
  return trend.sources.length >= 2;
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
export function isPublishableTrend(trend: Trend): boolean {
  return (
    trend.status === "published" &&
    hasEnoughSources(trend) &&
    hasOfficialOrPlatformSource(trend)
  );
}
