// LOCAL TEST ONLY — not imported by any production route/page/DB code.
// A small, hand-written EN phrase -> Korean gloss dictionary used only
// to build expression cards for the local EU Press Corner preview
// (src/app/local-test/eu-preview/page.tsx) without an LLM. Every entry's
// meaningKo/nuance/usageSituation/example* is general language-learning
// knowledge about the phrase itself (dictionary-level), never a claim
// about facts from a specific article — only the `phrase` value needs to
// be a literal substring of a given title for extractKnownPhrases to use
// it, and example sentences here are deliberately generic/illustrative,
// not descriptions of any particular real event.

export type GlossaryExpression = {
  phrase: string;
  meaningKo: string;
  nuance: string;
  usageSituation: string;
  exampleEn: string;
  exampleKo: string;
  comparisonPhrase?: string;
  comparisonNuanceDiff?: string;
};

export const PHRASE_GLOSSARY: GlossaryExpression[] = [
  {
    phrase: "international conference",
    meaningKo: "국제 회의",
    nuance: "여러 국가의 대표가 모여 공식적으로 논의하는 규모 있는 회의를 가리킬 때 써요.",
    usageSituation: "공식 외교·정책 발표 뉴스",
    exampleEn: "The ministers gathered at an international conference to discuss climate policy.",
    exampleKo: "장관들은 기후 정책을 논의하기 위해 국제 회의에 모였다.",
    comparisonPhrase: "summit",
    comparisonNuanceDiff:
      "summit은 보통 정상(최고위급) 간의 회담을 뜻하고, international conference는 꼭 정상급이 아니어도 여러 나라 대표가 모이는 공식 회의 전반을 가리켜요.",
  },
  {
    phrase: "aid workers",
    meaningKo: "구호 활동가",
    nuance: "재난이나 분쟁 지역에서 인도주의적 지원을 제공하는 사람들을 가리키는 표현이에요.",
    usageSituation: "인도주의·국제기구 뉴스",
    exampleEn: "Aid workers risked their lives to deliver supplies to the region.",
    exampleKo: "구호 활동가들은 그 지역에 물자를 전달하기 위해 목숨을 걸었다.",
    comparisonPhrase: "volunteers",
    comparisonNuanceDiff:
      "volunteers는 자발적으로 돕는 사람 전반을 뜻하고, aid workers는 보통 인도주의 기구 소속으로 재난·분쟁 현장에서 전문적으로 활동하는 사람을 가리켜요.",
  },
  {
    phrase: "disaster risk management",
    meaningKo: "재해 위험 관리",
    nuance: "자연재해나 위기 상황에 대비하고 대응하는 체계를 가리키는 정책 용어예요.",
    usageSituation: "정책·공공안전 뉴스",
    exampleEn: "The agency invested in disaster risk management technology.",
    exampleKo: "그 기관은 재해 위험 관리 기술에 투자했다.",
  },
  {
    phrase: "strengthen",
    meaningKo: "강화하다",
    nuance: "기존의 것을 더 튼튼하고 효과적으로 만든다는 뜻이에요.",
    usageSituation: "정책 발표, 협력 강화 뉴스",
    exampleEn: "The two countries agreed to strengthen their cooperation.",
    exampleKo: "두 나라는 협력을 강화하기로 합의했다.",
    comparisonPhrase: "improve",
    comparisonNuanceDiff:
      "improve는 그냥 더 나아진다는 일반적인 뜻이고, strengthen은 이미 있던 기반·관계를 더 견고하게 만든다는 느낌이 강해요.",
  },
  {
    phrase: "lasting contributions",
    meaningKo: "지속적인 기여",
    nuance: "오래도록 영향을 미치는 중요한 공헌을 가리켜요.",
    usageSituation: "시상식, 성과 발표 뉴스",
    exampleEn: "Her research made lasting contributions to the field.",
    exampleKo: "그녀의 연구는 그 분야에 지속적인 기여를 했다.",
  },
  {
    phrase: "space technologies",
    meaningKo: "우주 기술",
    nuance: "위성·우주 탐사 등 우주 공간을 활용하는 과학·산업 기술 전반을 가리켜요.",
    usageSituation: "과학기술·산업 뉴스",
    exampleEn: "The project uses space technologies to monitor natural disasters.",
    exampleKo: "그 프로젝트는 자연재해를 모니터링하기 위해 우주 기술을 활용한다.",
  },
  {
    phrase: "high level session",
    meaningKo: "고위급 회의",
    nuance: "정부나 기관의 고위 인사들이 참여하는 회의를 가리켜요.",
    usageSituation: "외교·국제기구 뉴스",
    exampleEn: "Leaders attended a high level session on trade.",
    exampleKo: "지도자들은 무역에 관한 고위급 회의에 참석했다.",
  },
];

// Up to `limit` entries whose `phrase` literally appears in `title`
// (case-insensitive substring match), ordered by where they first
// appear in the title. Returns fewer than `limit` (even zero) if the
// title just doesn't contain enough glossary phrases — callers must
// handle that honestly (see build-eu-preview-trend.ts), not pad with
// invented ones.
export function extractKnownPhrases(title: string, limit = 3): GlossaryExpression[] {
  const lower = title.toLowerCase();
  const matches = PHRASE_GLOSSARY.map((entry) => ({
    entry,
    index: lower.indexOf(entry.phrase.toLowerCase()),
  })).filter((m) => m.index !== -1);

  matches.sort((a, b) => a.index - b.index);
  return matches.slice(0, limit).map((m) => m.entry);
}
