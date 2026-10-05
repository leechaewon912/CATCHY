import "server-only";

import type { AllowedSource } from "@/lib/server/sources";
import type { ContentCandidate } from "@/lib/server/candidates";

export type TrendSource = {
  sourceName: string;
  originalTitle: string;
  originalUrl: string;
  publishedAt: string;
  licenseName: string;
  licenseUrl: string;
  usageNote: string;
};

export type Expression = {
  phrase: string;
  meaningKo: string;
  nuance: string;
  usageSituation: string;
  exampleEn: string;
  exampleKo: string;
};

export type QuizQuestion = {
  phrase: string;
  correctMeaningKo: string;
  optionsKo: string[];
};

export type Trend = {
  id: string;
  title: string;
  category: ContentCandidate["category"];
  englishSummary: string;
  koreanSummary: string;
  whyTrending: string;
  sources: TrendSource[];
  expressions: Expression[];
  quiz: QuizQuestion[];
  status: "draft" | "published";
  generatedAt: string;
  reviewedAt: string | null;
};

// 카테고리별 CATCHY 제목 템플릿. 원문 제목을 그대로 쓰지 않고 CATCHY가 새로
// 제목을 짓는다 — 실제 AI를 붙이면 이 테이블 대신 모델이 제목을 생성하게
// 교체할 수 있다.
const TITLE_TEMPLATES: Record<ContentCandidate["category"], string> = {
  "글로벌 이슈": "투표는 못 해도 거리로 나온 서아프리카 청년들",
  "디지털 권리": "부쿠레슈티 농민 시위, 온라인에서 더 커지고 더 뒤틀리다",
  "과학·우주": "아르테미스 계획, 또 한 번 달을 향해 나아가다",
};

// 영어 요약 템플릿. 이 학습 트렌드에서 가르치는 3개 표현을 자연스러운 문장
// 안에 원형 그대로 포함시켜, 아래 highlight 기능이 실제로 동작하게 한다.
const ENGLISH_SUMMARY_TEMPLATES: Record<
  ContentCandidate["category"],
  (sourceName: string) => string
> = {
  "글로벌 이슈": (sourceName) =>
    `${sourceName} recently reported on a story that can help shed light on youth political participation. In the wake of growing frustration, young people have taken to the streets, and the moment continues to spark debate across the region.`,
  "디지털 권리": (sourceName) =>
    `${sourceName} recently reported on how a local protest began to gain traction online. New evidence has started to call into question some of the claims being shared, and the accounts responsible are now under fire.`,
  "과학·우주": (sourceName) =>
    `${sourceName} continues to push the boundaries of space exploration. Supporters describe the latest milestone as a giant leap, one that could pave the way for future crewed missions.`,
};

const WHY_TRENDING_SUFFIX: Record<ContentCandidate["category"], string> = {
  "글로벌 이슈":
    "투표권은 없지만 목소리를 내는 청년들의 모습이 많은 사람들의 공감을 얻고 있어요.",
  "디지털 권리":
    "온라인에서 정보가 어떻게 왜곡되고 재해석되는지를 보여주는 사례로 주목받고 있어요.",
  "과학·우주":
    "유인 달 탐사 재개를 향한 구체적인 진전이라는 점에서 관심을 받고 있어요.",
};

const EXPRESSION_BANK: Record<ContentCandidate["category"], Expression[]> = {
  "글로벌 이슈": [
    {
      phrase: "shed light on",
      meaningKo: "~을 밝히다, 조명하다",
      nuance:
        "숨겨져 있던 문제나 상황을 더 잘 이해할 수 있게 드러낼 때 쓰는 표현이에요.",
      usageSituation: "뉴스 기사, 다큐멘터리 소개",
      exampleEn: "The report sheds light on how young activists are reshaping local politics.",
      exampleKo: "그 보고서는 젊은 활동가들이 지역 정치를 어떻게 바꾸고 있는지를 조명한다.",
    },
    {
      phrase: "in the wake of",
      meaningKo: "~의 여파로, ~직후에",
      nuance: "어떤 사건이 일어난 뒤 그 영향으로 다음 일이 벌어질 때 쓰는 표현이에요.",
      usageSituation: "뉴스 헤드라인, 시사 칼럼",
      exampleEn: "In the wake of the protests, several cities began reviewing their voting age laws.",
      exampleKo: "시위의 여파로 여러 도시가 투표 연령법을 재검토하기 시작했다.",
    },
    {
      phrase: "spark debate",
      meaningKo: "논쟁을 불러일으키다",
      nuance: "어떤 사건이나 발언이 사람들 사이에 찬반 논쟁을 촉발할 때 쓰는 표현이에요.",
      usageSituation: "시사 뉴스, 소셜 미디어 반응",
      exampleEn: "The new age limit proposal has sparked debate among young voters.",
      exampleKo: "새로운 연령 제한 제안이 젊은 유권자들 사이에서 논쟁을 불러일으켰다.",
    },
  ],
  "디지털 권리": [
    {
      phrase: "gain traction",
      meaningKo: "(점점) 주목받다, 확산되다",
      nuance:
        "어떤 아이디어나 이슈가 점점 더 많은 사람들에게 퍼지고 지지를 얻을 때 쓰는 표현이에요.",
      usageSituation: "온라인 트렌드, 캠페인 설명",
      exampleEn: "The exaggerated version of the story quickly gained traction online.",
      exampleKo: "과장된 버전의 이야기가 온라인에서 빠르게 퍼져나갔다.",
    },
    {
      phrase: "call into question",
      meaningKo: "~에 의문을 제기하다",
      nuance: "어떤 사실이나 주장이 정말 믿을 만한지 의심하게 만들 때 쓰는 표현이에요.",
      usageSituation: "팩트체크 기사, 시사 논평",
      exampleEn: "The mismatched photos called into question the accuracy of the viral post.",
      exampleKo: "일치하지 않는 사진들이 그 바이럴 게시물의 정확성에 의문을 제기했다.",
    },
    {
      phrase: "under fire",
      meaningKo: "비판을 받다, 공격받다",
      nuance: "어떤 사람이나 단체가 강한 비난이나 비판의 대상이 되고 있을 때 쓰는 표현이에요.",
      usageSituation: "뉴스 헤드라인",
      exampleEn: "The account that reshaped the story came under fire for spreading misinformation.",
      exampleKo: "그 이야기를 왜곡한 계정은 허위 정보를 퍼뜨렸다는 비판을 받았다.",
    },
  ],
  "과학·우주": [
    {
      phrase: "push the boundaries of",
      meaningKo: "~의 한계를 넓히다, 한계를 뛰어넘다",
      nuance: "기존에 가능하다고 여겨지던 범위를 더 확장할 때 쓰는 표현이에요.",
      usageSituation: "과학 뉴스, 기술 소개",
      exampleEn: "The mission continues to push the boundaries of human space exploration.",
      exampleKo: "이번 임무는 인간의 우주 탐사 한계를 계속 넓혀가고 있다.",
    },
    {
      phrase: "a giant leap",
      meaningKo: "커다란 도약, 비약적인 발전",
      nuance: "작은 변화가 아니라 매우 큰 진전을 의미할 때 쓰는 표현으로, 우주 탐사와 자주 연결돼요.",
      usageSituation: "과학 기사, 역사적 사건 설명",
      exampleEn: "Each successful test is seen as a giant leap toward returning astronauts to the Moon.",
      exampleKo: "매번 성공적인 테스트는 우주비행사를 달에 다시 보내기 위한 커다란 도약으로 여겨진다.",
    },
    {
      phrase: "pave the way for",
      meaningKo: "~을 위한 길을 닦다, 토대를 마련하다",
      nuance: "앞으로 있을 더 큰 일을 가능하게 만드는 준비 단계를 설명할 때 쓰는 표현이에요.",
      usageSituation: "과학/기술 뉴스",
      exampleEn: "This test flight paves the way for a future crewed landing.",
      exampleKo: "이번 시험 비행은 미래의 유인 착륙을 위한 길을 닦는다.",
    },
  ],
};

function slugFromUrl(url: string): string {
  const trimmed = url.replace(/\/+$/, "");
  const last = trimmed.split("/").pop() ?? "trend";
  return last.slice(0, 60);
}

function buildQuiz(expressions: Expression[]): QuizQuestion[] {
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

// 규칙 기반(rule-based) mock 생성기. 지금은 카테고리별 고정 템플릿 +
// factMemo를 조합해 콘텐츠를 만든다. 입력/출력 모양(TrendDraft)만 유지하면
// 나중에 이 함수 내부를 실제 AI API 호출로 교체할 수 있다.
export function generateTrendDraftFromCandidate(
  candidate: ContentCandidate,
  source: AllowedSource,
): Trend {
  const id = `${candidate.sourceId}-${slugFromUrl(candidate.originalUrl)}`;
  const expressions = EXPRESSION_BANK[candidate.category];

  return {
    id,
    title: TITLE_TEMPLATES[candidate.category],
    category: candidate.category,
    englishSummary: ENGLISH_SUMMARY_TEMPLATES[candidate.category](source.name),
    koreanSummary: candidate.factMemo,
    whyTrending: `${candidate.factMemo} ${WHY_TRENDING_SUFFIX[candidate.category]}`,
    sources: [
      {
        sourceName: source.name,
        originalTitle: candidate.originalTitle,
        originalUrl: candidate.originalUrl,
        publishedAt: candidate.publishedAt,
        licenseName: source.licenseName,
        licenseUrl: source.licenseUrl,
        usageNote: source.usageNote,
      },
    ],
    expressions,
    quiz: buildQuiz(expressions),
    status: "draft",
    generatedAt: new Date().toISOString(),
    reviewedAt: null,
  };
}
