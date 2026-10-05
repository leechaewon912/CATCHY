import "server-only";

export type AllowedSource = {
  id: string;
  name: string;
  homepageUrl: string;
  licenseName: string;
  licenseUrl: string;
  usageNote: string;
  allowed: boolean;
  requiresAttribution: boolean;
  allowsCommercialUse: boolean;
  allowsAdaptation: boolean;
};

// Static allowlist, defined in code — never fetched or expanded automatically.
// Adding a source here requires completing the checklist in
// docs/news-source-licensing.md first.
const ALLOWED_SOURCES: AllowedSource[] = [
  {
    id: "global-voices",
    name: "Global Voices",
    homepageUrl: "https://globalvoices.org/",
    licenseName: "CC BY 3.0",
    licenseUrl: "https://globalvoices.org/about/global-voices-attribution-policy/",
    usageNote:
      "자체 저작 기사(제3자 사진·영상 제외)에 한해 상업적 이용, 번역, 요약, 각색이 허용됨. 저작자 표시 필요.",
    allowed: true,
    requiresAttribution: true,
    allowsCommercialUse: true,
    allowsAdaptation: true,
  },
  {
    id: "nasa",
    name: "NASA",
    homepageUrl: "https://www.nasa.gov/",
    licenseName: "NASA Media Usage Guidelines",
    licenseUrl: "https://www.nasa.gov/nasa-brand-center/images-and-media/",
    usageNote:
      "NASA가 직접 작성한 텍스트는 미국 연방정부 저작물로 원칙적으로 저작권이 없어 교육·상업 목적 재사용이 가능함. 로고·휘장, 식별 가능한 인물, 제3자 제공 영상은 별도 제한이 있을 수 있어 사용하지 않음.",
    allowed: true,
    requiresAttribution: true,
    allowsCommercialUse: true,
    allowsAdaptation: true,
  },
];

export function getAllowedSources(): AllowedSource[] {
  return ALLOWED_SOURCES;
}
