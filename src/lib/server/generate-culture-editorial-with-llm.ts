import "server-only";

import type { Category, ExpressionSeed } from "@/lib/mock-data";
import { textContainsPhrase } from "@/lib/highlight-expressions";
import { callOpenAi } from "@/lib/server/generate-trend-with-llm";

// ============================================================================
// GPT-4o-mini 기반 "컬처 에디토리얼" 생성기 — RSS/GDELT 뉴스 수집과는 완전히
// 분리된 별도 경로다. generate-trend-with-llm.ts의 callOpenAi()(HTTP 호출
// 껍데기, 뉴스 프롬프트/입력 타입과 무관)만 재사용하고, 이 파일의 시스템
// 프롬프트·입력 타입·검증 기준은 전부 새로 작성했다 — 뉴스 전용 프롬프트
// (기사 메타데이터 그라운딩, 고유명사 요구 등)는 에디토리얼과 전제가
// 반대라 그대로 재사용할 수 없었다(자세한 이유는 대화 기록 참고).
//
// 호출부(아직 미구현 — 향후 정기 자동화 단계에서 작성)는 이 함수가 null을
// 반환하면 "생성 실패"로 처리해야 한다. generate-trend-draft.ts의 뉴스용
// 스텁 템플릿(VARIANT_BANK)으로 대체하면 안 된다 — 그 템플릿은 "오늘 여러
// 매체에서 다뤄진 이슈" 같은 뉴스 말투라 에디토리얼 톤과 맞지 않는다.
// ============================================================================

export type CultureEditorialTopic = {
  category: Category;
  englishTitle: string;
  koreanTitle: string;
  // 모델이 주제를 벗어나지 않도록 잡아주는 한 줄 소재 설명 — "이미 제안된
  // 7개 주제"처럼 주제 선정을 사람이 먼저 확정해둔 경우를 위한 것이다.
  topicBrief: string;
  // 이 주제에서 우선적으로 활용했으면 하는 관용구/구어체 후보 — 본문에
  // 자연스럽게 녹아들 때만 쓰도록 안내할 뿐, 억지로 끼워 넣게 강제하지는
  // 않는다("요청하신 '억지로 끼워 넣지 않기' 원칙" 때문에 프로그램 차원의
  // 필수 검증은 걸지 않고, 프롬프트 안내로만 유도한다).
  preferredExpressions?: string[];
  // 문체·구성에 대한 주제별 추가 지시 — 공통 규칙만으로는 부족한, 이
  // 주제에만 해당하는 요구사항(예: JOMO/FOMO 대비 설명, 구체적 생활 장면
  // 중심 서술)을 담는다.
  styleNote?: string;
};

export type GenerateCultureEditorialOutput = {
  title: string;
  englishTitle: string;
  summary: string;
  englishSummary: string;
  koreanSummary: string;
  expressions: ExpressionSeed[];
};

const EXPECTED_EXPRESSION_COUNT = 3;
const MIN_ENGLISH_SUMMARY_WORDS = 130;
const MAX_ENGLISH_SUMMARY_WORDS = 160;
const MAX_ATTEMPTS = 3;

// 호출 횟수/대략적인 토큰 사용량 계측 — callOpenAi() 자체(뉴스 파이프라인과
// 공유)는 건드리지 않고, 이 파일에서 callOpenAi를 호출하는 지점만 감싸서
// 집계한다. 정확한 토큰 수는 OpenAI 응답의 usage 필드를 받아야 알 수 있는데,
// callOpenAi가 content 문자열만 반환하므로 여기서는 프롬프트/응답 문자 수
// 기반 근사치(영어 기준 약 4자≈1토큰)만 제공한다 — 콘솔/보고용 추정치이지
// 정확한 과금 수치가 아니다.
let callCount = 0;
let promptCharsTotal = 0;
let responseCharsTotal = 0;

export function getEditorialLlmUsageStats() {
  return {
    callCount,
    estimatedPromptTokens: Math.ceil(promptCharsTotal / 4),
    estimatedCompletionTokens: Math.ceil(responseCharsTotal / 4),
  };
}

export function resetEditorialLlmUsageStats(): void {
  callCount = 0;
  promptCharsTotal = 0;
  responseCharsTotal = 0;
}

async function trackedCallOpenAi(systemPrompt: string, userPrompt: string): Promise<string | null> {
  callCount += 1;
  promptCharsTotal += systemPrompt.length + userPrompt.length;
  const content = await callOpenAi(systemPrompt, userPrompt);
  if (content) responseCharsTotal += content.length;
  return content;
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

// 기존 표현/제목과의 중복 여부를 비교할 때 쓰는 느슨한 정규화 — 대소문자
// 차이와 "[something]"류 플레이스홀더 차이만으로 서로 다른 표현처럼
// 보이는 걸 막는다. highlight-expressions.tsx의 하이라이팅 매칭과는
// 목적이 달라(이쪽은 "같은 표현인가" 판별용) 별도로 둔다.
function normalizePhrase(phrase: string): string {
  return phrase
    .toLowerCase()
    .replace(/\[[a-z]+\]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// 카테고리별 오프닝 전략 — "You...", "Have you ever...", "Picture this..."
// 같은 패턴이 카테고리와 무관하게 반복되는 문제를 막기 위해, 카테고리마다
// 다른 구체적 장면 유형을 지정한다. buildEditorialSummaryUserPrompt가 이걸
// 해당 카테고리에 대한 지시로 프롬프트에 그대로 꽂아 넣는다.
const CATEGORY_OPENING_GUIDANCE: Record<Category, string> = {
  "음악": "특정 청취 상황·소리·리듬·기억에서 시작하세요 — 예: 특정 노래가 흘러나오는 순간, 이어폰 너머로 들리는 소리, 어떤 리듬에 몸이 반응하는 순간.",
  "영화·시리즈": "시청 중인 구체적 장면, 등장인물의 대사, 또는 스포일러를 피하려는 상황에서 시작하세요.",
  "밈·인터넷": "친구와 실제로 메시지(문자·DM·단톡방)를 주고받는 구체적 상황에서 시작하세요.",
  "라이프스타일": "어떤 행동이나 습관이 달라지는 구체적 순간에서 시작하세요.",
  "테크·게임": "기기·앱·게임을 실제로 사용하는 구체적 순간에서 시작하세요.",
  "스포츠": "경기장 안 장면, 관중의 반응, 또는 팬의 구체적 행동에서 시작하세요.",
  "글로벌 이슈": "사람들이 실제로 그 변화를 마주하는 구체적 순간(거리, 모임, 대화 등)에서 시작하세요.",
};

// 카테고리에 상관없이 반복되는 정형화된 오프닝 — 첫 문장이 이 패턴으로
// 시작하면 attemptEditorialSummaryGeneration이 바로 재시도시킨다(프롬프트
// 지시만으로는 모델이 가끔 다시 쓰는 걸 막기 위한 하드 게이트).
const BANNED_OPENING_PATTERNS: RegExp[] = [
  /^you'?re\b/i,
  /^you\b/i,
  /^have you ever\b/i,
  /^picture this\b/i,
  /^imagine\b/i,
  /^in today'?s\b/i,
  /^these days\b/i,
  /^there'?s something\b/i,
  /^when was the last time\b/i,
];

function extractFirstSentence(text: string): string {
  return text.trim().split(/(?<=[.!?])\s+/)[0]?.trim() ?? "";
}

function matchedBannedOpeningPattern(firstSentence: string): string | null {
  const match = BANNED_OPENING_PATTERNS.find((pattern) => pattern.test(firstSentence));
  return match ? match.source : null;
}

// 임베딩 없이 "같은 패턴으로 시작했는가"를 근사하는 가벼운 휴리스틱 —
// 첫 문장 앞쪽 몇 단어의 토큰 겹침 비율로 판단한다. 완벽한 의미 유사도
// 판별기는 아니지만 "You + 동사" 같은 구조 반복, 같은 주어로 시작하는
// 패턴을 효과적으로 잡아낸다.
function openingTokens(sentence: string): string[] {
  return sentence
    .toLowerCase()
    .replace(/[^a-z\s']/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 8);
}

function openingSimilarityScore(a: string, b: string): number {
  const tokensA = openingTokens(a);
  const tokensB = openingTokens(b);
  if (tokensA.length === 0 || tokensB.length === 0) return 0;
  const setB = new Set(tokensB);
  const overlap = tokensA.filter((token) => setB.has(token)).length;
  return overlap / Math.min(tokensA.length, tokensB.length);
}

const OPENING_SIMILARITY_THRESHOLD = 0.5;

function findTooSimilarOpening(firstSentence: string, existingOpenings: string[]): string | null {
  return existingOpenings.find((existing) => openingSimilarityScore(firstSentence, existing) >= OPENING_SIMILARITY_THRESHOLD) ?? null;
}

// 기존 7개 컬처 에디토리얼의 제목 — mock-data.culture-editorials.ts를
// import하지 않고 여기 직접 적어둔다. 그 파일은 손으로 쓴 7개 콘텐츠를
// "보존"해야 하는 대상이라, 이 생성기 쪽에서 실수로 건드리거나 의존성을
// 만들지 않도록 완전히 분리해 둔 것 — 제목 목록이 바뀌면 여기도 함께
// 손으로 갱신해야 한다.
const EXISTING_EDITORIAL_TITLES: { englishTitle: string; koreanTitle: string }[] = [
  { englishTitle: "Your Playlist Is Your Personality Now", koreanTitle: "이제 플레이리스트가 나를 소개하는 방법이 됐다" },
  { englishTitle: "Why We Keep Rewatching the Same Shows", koreanTitle: "결말을 아는데도 같은 작품을 다시 보는 이유" },
  { englishTitle: "It's Giving: The Internet's Favorite Way to Describe a Vibe", koreanTitle: "설명보다 느낌이 중요한 인터넷 언어, It's giving" },
  { englishTitle: "The Joy of Being Offline for a While", koreanTitle: "잠시 연결을 끊는 것만으로 달라지는 하루" },
  { englishTitle: "What If You Could Build an App Just by Describing It?", koreanTitle: "말로 설명한 아이디어가 실제 앱이 된다면?" },
  { englishTitle: "More Than a Game: Why Being a Fan Feels Personal", koreanTitle: "스포츠 팬이 된다는 건 단순히 승리를 응원하는 일이 아니다" },
  { englishTitle: "Can Small Everyday Choices Really Make a Difference?", koreanTitle: "일상 속 작은 선택이 정말 세상을 바꿀 수 있을까?" },
];

// 기존 7개가 이미 쓴 표현 21개 — 새로 생성되는 표현이 이것들과 겹치지
// 않게 하는 용도. 위와 같은 이유로 import 대신 직접 나열한다.
const EXISTING_EDITORIAL_PHRASES: string[] = [
  "On repeat", "My kind of vibe", "Do the talking",
  "Comfort watch", "Know [something] by heart", "At our fingertips",
  "[something] giving", "Main character energy", "Straight out of",
  "Unplug", "Slow down", "Recharge",
  "Bring [something] to life", "Game changer", "From scratch",
  "Root for", "Die-hard fan", "Stay loyal to",
  "Make a difference", "Small steps", "Think twice",
];

// 아래 2건은 실제 생성 호출이 쓸, 사람이 먼저 확정해둔 7개 주제(테크·게임
// 제목은 사용자가 지정한 대로 반영) — 아직 어디서도 호출하지 않는다
// (지금 단계는 생성 함수/프롬프트 구현까지만).
export const CULTURE_EDITORIAL_CANDIDATE_TOPICS: CultureEditorialTopic[] = [
  {
    category: "음악",
    englishTitle: "Why Is This Song Stuck in My Head?",
    koreanTitle: "귀에서 맴도는 노래, 이어웜의 정체",
    topicBrief: "한 번 들으면 멜로디가 계속 머릿속에서 맴도는 '이어웜(earworm)' 현상",
    preferredExpressions: ["earworm"],
    styleNote: "이전 생성에서 earworm이 잘 작동했으니 이번에도 표현 3개 중 하나로 유지하세요.",
  },
  {
    category: "영화·시리즈",
    englishTitle: "The Race to Watch It Before You Get Spoiled",
    koreanTitle: "스포일러 전에 봐야 한다는 압박",
    topicBrief: "SNS에서 스포일러를 보기 전에 서둘러 작품을 챙겨 보는 문화",
    preferredExpressions: ["No spoilers!", "Binge-watch", "Go in blind"],
    styleNote:
      "이 세 표현이 모두 본문 흐름에 자연스럽게 등장하도록 글을 구성하고, 가능하면 표현 3개로 그대로 선택하세요 — 단, 억지로 끼워 넣지 말고 자연스러울 때만.",
  },
  {
    category: "밈·인터넷",
    englishTitle: "Sending Memes Is How We Say \"I Thought of You\"",
    koreanTitle: "밈을 보내는 것, 애정을 표현하는 방식",
    topicBrief: "친구에게 밈을 보내는 것이 요즘 애정과 유대감을 표현하는 방식이 된 인터넷 문화",
    preferredExpressions: ["This is so you", "I thought of you", "Tag someone"],
    styleNote:
      "이 세 표현이 모두 본문 흐름에 자연스럽게 등장하도록 글을 구성하고, 가능하면 표현 3개로 그대로 선택하세요 — 단, 억지로 끼워 넣지 말고 자연스러울 때만.",
  },
  {
    category: "라이프스타일",
    englishTitle: "Why Staying In Feels Like Winning",
    koreanTitle: "약속 대신 집을 선택하는 게 승리처럼 느껴지는 이유",
    topicBrief: "JOMO(joy of missing out) — 약속을 거절하고 집에 머무는 선택에 죄책감을 느끼지 않는 문화",
    preferredExpressions: ["JOMO"],
    styleNote:
      "JOMO를 표현 3개 중 하나로 선택하고, 그 비교 표현(comparisonPhrase)은 반드시 FOMO로 쓰세요. 뉘앙스 설명(comparisonNuanceDiff)에 'FOMO는 놓치는 것에 대한 불안, JOMO는 놓치는 것을 오히려 즐기는 마음'이라는 차이를 분명히 담으세요.",
  },
  {
    category: "테크·게임",
    englishTitle: "The Appeal of Cozy Games: Playing Without Pressure",
    koreanTitle: "경쟁하지 않아도 괜찮아, 코지 게임의 매력",
    topicBrief: "승패나 경쟁 없이 편안하게 즐기는 '코지 게임(cozy game)' 장르의 인기",
  },
  {
    category: "스포츠",
    englishTitle: "The Friendly Rivalry of Fantasy Sports Leagues",
    koreanTitle: "친구들과의 판타지 스포츠, 우정 섞인 경쟁",
    topicBrief: "친구들끼리 팀을 꾸려 즐기는 판타지 스포츠 리그의 우호적인 경쟁 문화",
    preferredExpressions: ["what a game", "down to the wire", "bragging rights"],
    styleNote:
      "'sense of camaraderie', 'lasting memories' 같은 사전적 명사구 대신, 실제 스포츠 팬들이 경기를 보면서 쓰는 감탄사·구어체 표현을 우선 고려하세요 (옆의 preferredExpressions는 예시일 뿐 — 본문 흐름에 더 자연스러운 다른 구어체 표현이 있다면 그것으로 대체해도 됩니다).",
  },
  {
    // 구 "글로벌 이슈"(문화) — 카테고리 통합으로 라이프스타일에 편입.
    // 이미 생성 완료된 과거 실행 기록이라 이 항목의 토픽 내용(아래
    // topicBrief/styleNote)은 그대로 두고 category만 갱신했다 — 앞으로
    // 이 배열을 다시 쓸 때도 더 이상 "글로벌 이슈"를 생성 대상으로
    // 쓰지 않기 위함.
    category: "라이프스타일",
    englishTitle: "Why \"Where You Work\" No Longer Means \"Where You Live\"",
    koreanTitle: "일하는 곳과 사는 곳이 분리되는 시대",
    topicBrief: "디지털 노마드처럼 일하는 장소와 생활 근거지가 분리되는 삶의 방식",
    styleNote:
      "'new cultural landscape', 'work-life balance' 같은 포괄적 개념어로 설명을 끝내지 말고, 노트북 하나로 카페를 옮겨 다니거나 시차 때문에 새벽에 화상회의를 하는 등 구체적인 하루 장면을 중심으로 본문을 구성하세요.",
  },
];

// ---------------------------------------------------------------------
// Step 1: 본문 생성 (뉴스 그라운딩 없음 — 주어진 topic만으로 작성).
// ---------------------------------------------------------------------

type EditorialSummaryOutput = {
  title: string;
  englishTitle: string;
  summary: string;
  englishSummary: string;
  koreanSummary: string;
};

type EditorialSummaryJson = {
  title?: unknown;
  englishTitle?: unknown;
  summary?: unknown;
  englishSummary?: unknown;
  koreanSummary?: unknown;
};

// 문체 참고용 예시 2개(기존 에디토리얼의 축약 발췌, 오프닝 패턴을 다르게
// 가져감 — 상황 묘사형 하나, "Imagine" 장면형 하나) — 톤과 분량만
// 참고하게 하고, 그대로 베끼지 말라고 규칙에서 명시한다.
const STYLE_REFERENCE_EXAMPLES = `예시 1 (상황 묘사로 시작, 2문단 — 문체·분량·문단 구성 참고용, 내용 베끼지 말 것):
영문 제목: Why We Keep Rewatching the Same Shows
영어 본문: "You open your streaming app, scroll through dozens of new releases, and somehow end up watching the same show for the fifth time. With endless movies and series available at our fingertips, you might think we'd always be looking for something new. But sometimes, the most appealing option is a story we already know by heart.

That's the beauty of a comfort watch. You know exactly what happens, which characters you'll fall in love with, and which scenes will make you laugh. There's no pressure to follow a complicated plot or worry about an unexpected ending — and that's exactly the point."

예시 2 (관찰·단정으로 시작, 3문단 — 질문형이 아닌 오프닝 참고용, 내용 베끼지 말 것):
영문 제목: It's Giving: The Internet's Favorite Way to Describe a Vibe
영어 본문: "Your friend shows up wearing sunglasses, a dramatic coat, and an outfit that looks straight out of a movie. Instead of saying, 'You look really confident and stylish,' you simply say, 'It's giving main character energy.'

Welcome to the world of 'It's giving,' an expression used across social media to describe the mood, aesthetic, or impression something creates. The beauty of this phrase is how flexible it is.

A cozy café might be 'giving Paris in the fall,' while someone's colorful outfit could be 'giving early 2000s pop star.' Once you start using it, it's hard to stop."

두 예시 모두 사전적 정의("X is a phenomenon known as...")로 시작하지 않고, 독자가 바로 그려볼 수 있는 장면이나 단정적 관찰로 문을 엽니다. 문장도 짧고 구어체에 가깝습니다. 둘 다 빈 줄(문단 구분)로 나뉜 2~3개 문단 구조라는 점도 참고하세요 — 예시 1은 질문형 문장이 전혀 없다는 점에, 예시 2는 마지막 문단이 감성적 성찰이 아니라 가벼운 코멘트로 끝난다는 점에 주목하세요.`;

const EDITORIAL_SUMMARY_SYSTEM_PROMPT = `당신은 CATCHY라는 한국어-영어 학습 서비스의 콘텐츠 작가입니다.
지금 쓰는 글은 특정 뉴스 기사를 요약하는 것이 아니라, CATCHY가 자체 기획한 "컬처 에디토리얼"입니다 — 이미 널리 알려져 있고 검증된 문화 현상이나 관용 표현을 소재로, 가볍고 친근한 에세이 스타일 글을 새로 씁니다. 교과서나 AI가 쓴 설명문처럼 딱딱하게 읽히면 안 됩니다 — 친구에게 이야기하듯 써야 합니다.

반드시 지켜야 할 규칙:
1. 아래 "작성할 주제"에서 벗어나지 말고, 그 주제에 대해서만 쓰세요. 주제를 임의로 바꾸거나 다른 소재를 섞지 마세요.
2. 특정 인물, 특정 작품명, 특정 사건, 특정 날짜의 실제 뉴스를 인용하거나 마치 사실인 것처럼 쓰지 마세요. 검증되지 않은 "최신" 유행처럼 포장하지 말고, 보편적으로 이미 널리 통용되는 문화 현상 설명에 집중하세요. "Research suggests...", "Studies show..." 같은 가짜 권위를 빌리는 문장도 쓰지 마세요 — 근거 없는 주장이 됩니다.
3. 외부 뉴스 기사를 그대로 복제하거나 요약한 것처럼 보이면 안 됩니다 — 완전히 새로 쓴 문장이어야 합니다.
4. "X is a phenomenon known as...", "In today's digital age, the concept of...", "In a world where..." 같은 사전적 정의형·일반론형 문장으로 시작하지 마세요. **아래 "이 카테고리의 오프닝 전략" 지시를 따라 이 주제에 맞는 구체적 장면으로 시작하세요** — 질문형으로 시작하지 말고(질문형은 다른 방식이 전혀 안 어울릴 때만 아주 가끔), 짧은 가상 대화·인용으로 여는 것도 가능합니다.
   **절대 다음 단어/구문으로 문장을 시작하지 마세요 (카테고리와 무관하게 금지)**: "You", "You're", "Have you ever", "Picture this", "Imagine", "In today's", "These days", "There's something", "When was the last time". 이 표현들은 이미 너무 많이 반복됐습니다 — 주어부터 다르게 쓰세요(예: 소리·장면·사물·행동을 주어로 시작).
   **아래 "최근 사용된 오프닝 문장들"과 첫 문장의 구조(주어, 문장 패턴, 장면 묘사 방식)가 비슷해서도 안 됩니다** — 겹치면 다른 방식으로 다시 쓰세요.
5. 글 전체에서 추상적인 일반론("this reflects our desire to...", "this phenomenon highlights...")을 최소화하고, 구체적인 행동·장면·대사로 보여주세요. 설명하지 말고 보여주세요. **마지막 문장도 매번 감성적 성찰("Maybe we just want...", "어쩌면 우리는...")로 끝내지 마세요** — 가벼운 코멘트, 구체적 예시로의 복귀, 실용적인 한마디 등으로 마무리를 다양화하세요. 감성적 성찰형 마무리는 가끔만 쓰세요.
6. englishSummary는 **정확히 130~160단어** 분량이어야 합니다 (130단어보다 적거나 160단어보다 많으면 안 됨). **자연스럽게 2~3개 문단으로 나누고, 문단 사이는 빈 줄 하나("\n\n")로 구분하세요** — 한 문단으로 쭉 이어 쓰지 마세요. 각 문단은 최소 2문장 이상이어야 합니다.
7. koreanSummary는 englishSummary와 **같은 내용을 담은** 자연스러운 한국어 번역이어야 합니다 — 문장 대 문장으로 기계적으로 직역하지 말고, 문장 순서나 접속사를 한국어답게 재구성해도 됩니다(내용 추가·누락은 금지). 번역투("~것입니다", "~라고 할 수 있습니다"의 과도한 반복)를 피하고 친근한 구어체로 쓰세요. **englishSummary와 동일하게 빈 줄("\n\n")로 나눈 같은 개수의 문단 구조를 유지하세요** — 한국어에서는 한 문단으로 합치지 마세요. **koreanSummary는 반드시 해요체로만 쓰세요(문장이 "~해요", "~예요", "~이에요", "~네요" 등으로 끝나야 합니다) — "~한다", "~이다", "~합니다", "~입니다", "~하십시오" 같은 문어체·격식체 종결어미는 절대 쓰지 마세요.**
8. title/summary/koreanSummary는 한국어로, englishTitle/englishSummary는 영어로 쓰세요. 섞어 쓰지 마세요. **summary(한 줄 요약)가 완전한 문장으로 끝난다면 koreanSummary와 같은 기준으로 해요체를 쓰세요. title은 "느림의 미학"처럼 명사구로 끝내도 되지만, 문장형 제목을 쓸 경우 해요체로 끝내고("~하는 이유예요" 등) "~한다/~이다"체로 끝내지 마세요 — 제목들끼리 종결 방식이 들쭉날쭉하지 않게 하세요.**
9. 아래 "이미 존재하는 기존 제목들"과 주제·소재가 겹치면 안 됩니다.
10. 아래 "이 주제에서 활용하면 좋은 표현"이 주어졌다면, 그 표현들이 본문 흐름에 자연스럽게 등장하도록 글을 구성해 보세요 — 다만 문장이 어색해질 정도로 억지로 끼워 넣지는 마세요. 자연스럽게 안 들어가면 빼도 됩니다.
11. ${STYLE_REFERENCE_EXAMPLES}
12. 다른 설명 없이, 아래 JSON 스키마와 정확히 일치하는 JSON 객체만 출력하세요.

JSON 스키마:
{
  "title": "한국어 제목",
  "englishTitle": "English title",
  "summary": "한국어 한 줄 요약 (카드에 쓰이는 짧은 문장)",
  "englishSummary": "English paragraph, 130-160 words",
  "koreanSummary": "englishSummary를 자연스럽게 옮긴 한국어 전체 번역"
}`;

function buildEditorialSummaryUserPrompt(
  topic: CultureEditorialTopic,
  existingTitles: { englishTitle: string; koreanTitle: string }[],
  existingOpenings: string[],
  priorFailureReason?: string,
): string {
  const existingTitleLines = existingTitles
    .map((t) => `- ${t.englishTitle} / ${t.koreanTitle}`)
    .join("\n");

  const existingOpeningLines = existingOpenings.length
    ? existingOpenings.map((o) => `- ${o}`).join("\n")
    : "(아직 없음)";

  const preferredExpressionsLine = topic.preferredExpressions?.length
    ? `\n이 주제에서 활용하면 좋은 표현 (자연스러울 때만 — 억지로 끼워 넣지 마세요): ${topic.preferredExpressions.join(", ")}`
    : "";

  const styleNoteLine = topic.styleNote ? `\n추가 지시: ${topic.styleNote}` : "";

  const retryNote = priorFailureReason
    ? `\n\n[이전 시도 실패 — 다시 작성]\n바로 전 시도는 다음 이유로 거부되었습니다: ${priorFailureReason}\n같은 문제가 반복되지 않게 다시 쓰세요.`
    : "";

  return `카테고리: ${topic.category}

이 카테고리의 오프닝 전략 (첫 문장은 반드시 이 방향을 따르세요): ${CATEGORY_OPENING_GUIDANCE[topic.category]}

작성할 주제:
- 영문 제목(참고용 — 그대로 쓰거나 자연스럽게 다듬어도 됨): ${topic.englishTitle}
- 한글 제목(참고용 — 그대로 쓰거나 자연스럽게 다듬어도 됨): ${topic.koreanTitle}
- 소재 설명: ${topic.topicBrief}${preferredExpressionsLine}${styleNoteLine}

이미 존재하는 기존 제목들 (주제가 겹치면 안 됩니다):
${existingTitleLines}

최근 사용된 오프닝 문장들 (첫 문장의 구조·주어·장면 묘사 방식이 이것들과 겹치면 안 됩니다):
${existingOpeningLines}

위 규칙을 지켜 JSON 객체 하나만 출력하세요.${retryNote}`;
}

function parseEditorialSummary(raw: EditorialSummaryJson): EditorialSummaryOutput | null {
  if (
    !isNonEmptyString(raw.title) ||
    !isNonEmptyString(raw.englishTitle) ||
    !isNonEmptyString(raw.summary) ||
    !isNonEmptyString(raw.englishSummary) ||
    !isNonEmptyString(raw.koreanSummary)
  ) {
    return null;
  }

  return {
    title: raw.title,
    englishTitle: raw.englishTitle,
    summary: raw.summary,
    englishSummary: raw.englishSummary,
    koreanSummary: raw.koreanSummary,
  };
}

type EditorialSummaryAttemptResult =
  | { ok: true; summary: EditorialSummaryOutput }
  | { ok: false; reason: string };

async function attemptEditorialSummaryGeneration(
  topic: CultureEditorialTopic,
  existingTitles: { englishTitle: string; koreanTitle: string }[],
  existingOpenings: string[],
  attempt: number,
  priorFailureReason: string | undefined,
): Promise<EditorialSummaryAttemptResult> {
  const content = await trackedCallOpenAi(
    EDITORIAL_SUMMARY_SYSTEM_PROMPT,
    buildEditorialSummaryUserPrompt(topic, existingTitles, existingOpenings, priorFailureReason),
  );
  if (!content) {
    console.error(`[llm/editorial] ${topic.category}/"${topic.englishTitle}": summary attempt ${attempt} got no completion`);
    return { ok: false, reason: "응답을 받지 못했습니다" };
  }

  let raw: EditorialSummaryJson;
  try {
    raw = JSON.parse(content) as EditorialSummaryJson;
  } catch {
    console.error(`[llm/editorial] ${topic.category}/"${topic.englishTitle}": summary attempt ${attempt} invalid JSON`);
    return { ok: false, reason: "응답이 유효한 JSON이 아니었습니다" };
  }

  const summary = parseEditorialSummary(raw);
  if (!summary) {
    console.error(`[llm/editorial] ${topic.category}/"${topic.englishTitle}": summary attempt ${attempt} didn't match the expected shape`);
    return { ok: false, reason: "JSON 스키마와 맞지 않았습니다 (필드 누락 또는 빈 문자열)" };
  }

  const wordCount = countWords(summary.englishSummary);
  if (wordCount < MIN_ENGLISH_SUMMARY_WORDS || wordCount > MAX_ENGLISH_SUMMARY_WORDS) {
    console.error(`[llm/editorial] ${topic.category}/"${topic.englishTitle}": summary attempt ${attempt} word count ${wordCount} out of range`);
    return {
      ok: false,
      reason: `englishSummary가 ${wordCount}단어였습니다 — ${MIN_ENGLISH_SUMMARY_WORDS}~${MAX_ENGLISH_SUMMARY_WORDS}단어 범위에 맞게 다시 쓰세요`,
    };
  }

  // 모바일 가독성을 위한 2~3문단 요구사항 — "\n\n"(빈 줄)으로 나뉜 문단
  // 개수를 직접 세어 강제한다. 프롬프트 지시만으로는 모델이 가끔 한
  // 문단으로 통째로 쓰는 경우가 있어, 재시도로 이어지는 하드 게이트를 둔다.
  const paragraphCount = summary.englishSummary
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean).length;
  if (paragraphCount < 2 || paragraphCount > 3) {
    console.error(
      `[llm/editorial] ${topic.category}/"${topic.englishTitle}": summary attempt ${attempt} has ${paragraphCount} paragraph(s), expected 2-3`,
    );
    return {
      ok: false,
      reason: `englishSummary가 ${paragraphCount}개 문단이었습니다 — 빈 줄("\\n\\n")로 구분된 2~3개 문단으로 다시 나눠 쓰세요`,
    };
  }

  // 오프닝 반복 방지 — 카테고리와 무관하게 쓰이는 정형화된 시작 패턴
  // ("You...", "Have you ever..." 등)을 먼저 하드 차단하고, 통과했더라도
  // 최근 생성분과 첫 문장 구조가 너무 비슷하면 재시도시킨다.
  const firstSentence = extractFirstSentence(summary.englishSummary);
  const bannedPattern = matchedBannedOpeningPattern(firstSentence);
  if (bannedPattern) {
    console.error(
      `[llm/editorial] ${topic.category}/"${topic.englishTitle}": summary attempt ${attempt} opening matched banned pattern ${bannedPattern} ("${firstSentence}")`,
    );
    return {
      ok: false,
      reason: `첫 문장("${firstSentence}")이 금지된 시작 패턴을 썼습니다 — "${CATEGORY_OPENING_GUIDANCE[topic.category]}" 방향으로, 전혀 다른 주어와 구조로 다시 시작하세요`,
    };
  }

  const similarOpening = findTooSimilarOpening(firstSentence, existingOpenings);
  if (similarOpening) {
    console.error(
      `[llm/editorial] ${topic.category}/"${topic.englishTitle}": summary attempt ${attempt} opening too similar to "${similarOpening}"`,
    );
    return {
      ok: false,
      reason: `첫 문장("${firstSentence}")이 최근 오프닝("${similarOpening}")과 구조가 너무 비슷합니다 — 다른 장면·주어·문장 구조로 다시 쓰세요`,
    };
  }

  return { ok: true, summary };
}

// ---------------------------------------------------------------------
// Step 2: 표현 추출. generate-trend-with-llm.ts와 같은 "이미 쓰여진 본문
// 에서 그대로 골라내기" 방식을 그대로 따르되, 비교 표현(comparison)을
// 필수로 바꾸고 usageSituation은 뺐다 — 기존 7개 에디토리얼의 구성과
// 동일하게 맞추기 위함.
// ---------------------------------------------------------------------

type EditorialExpressionJson = {
  phrase?: unknown;
  meaningKo?: unknown;
  nuance?: unknown;
  exampleEn?: unknown;
  exampleKo?: unknown;
  comparisonPhrase?: unknown;
  comparisonNuanceDiff?: unknown;
};

type EditorialExpressionsJson = {
  expressions?: unknown;
};

const EDITORIAL_EXPRESSIONS_SYSTEM_PROMPT = `당신은 CATCHY라는 한국어-영어 학습 서비스의 콘텐츠 작가입니다.
주어진 영어 단락(englishSummary) 안에서 실제로 쓰이는 자연스러운 영어 표현 정확히 3개를 "그 단락에 있는 그대로" 찾아내서 학습 콘텐츠로 만듭니다.

반드시 지켜야 할 규칙:
1. phrase는 주어진 영어 단락 안에 **단어 순서가 같은 문자열로 실제로 등장하는** 1~4단어 표현이어야 합니다. 단락에 없는 표현을 새로 만들어내면 안 됩니다 (동사의 시제/단수복수 변화 정도는 허용되지만, 단어를 바꾸거나 추가/삭제하면 안 됩니다).
2. 세 표현은 서로 겹치지 않는 별개의 구간에서 골라야 합니다.
3. 아래 "이미 사용 중인 기존 표현" 목록과 같거나 사실상 같은 표현은 고르지 마세요.
4. **표현 선정 우선순위**: 일상 회화, SNS, 영화·드라마 대화에서 실제로 자주 쓰이는 구동사(phrasal verb)·숙어(idiom)·연어(collocation)를 최우선으로 고르세요 (예: "take ... by storm", "give it a shot", "blow up", "come out ahead"). 아래 두 종류는 피하세요:
   - "sense of ~", "fear of ~", "new ~", "a feeling of ~"처럼 사전적으로 조합한 일반 명사구, 그리고 "the fear of", "a sense of"처럼 **전치사로 끝나 그 자체로 뜻이 완결되지 않는 조각** (phrase는 그것만 따로 떼어 봐도 뜻이 통하는 독립적인 표현이어야 함)
   - "a beautiful pause", "a quiet moment", "a gentle reminder"처럼 **문법적으로는 자연스럽지만 실제 대화·SNS에서 거의 안 쓰이는, 글쓰기용 문학적·시적 형용사+명사 조합** — 사전 찾아봤을 때 "관용구"로 안 뜨고, 그냥 수식어+명사일 뿐인 표현
   단락 안에 구동사·숙어가 있다면 그것을 고르고, 위 두 종류는 다른 대안이 전혀 없을 때만 고르세요.
5. 각 표현마다 반드시 다음을 모두 채우세요: 한국어 의미(meaningKo), 뉘앙스 설명(nuance), 그 표현을 쓴 새로운 영어 예문(exampleEn — 단락의 문장을 그대로 복사하지 말고 새로 쓸 것), 한국어 해석(exampleKo), 헷갈리기 쉬운 비슷한 표현(comparisonPhrase)과 그 표현과의 뉘앙스 차이(comparisonNuanceDiff). comparisonPhrase/comparisonNuanceDiff는 선택이 아니라 **반드시 채워야 하는 필수 필드**입니다.
6. **exampleEn은 그 표현이 단락 안에서 쓰인 것과 같은 의미·맥락으로 써야 합니다.** 같은 단어라도 단락과 다른 뜻으로 예문을 만들면 안 됩니다 (예: 단락에서 "스포일러로 놀라움을 잃는 것"을 뜻했다면, 예문도 "경기에서 지는 것" 같은 다른 뜻으로 바꿔 쓰면 안 됩니다).
7. 언어는 필드마다 반드시 다음과 같이 쓰세요 — 섞어 쓰지 마세요:
   - 한국어로 쓸 것: meaningKo, nuance, exampleKo, comparisonNuanceDiff
   - 영어로 쓸 것: phrase, exampleEn, comparisonPhrase
   **meaningKo는 완결된 문장이 아니라 "아침 일과"처럼 뜻만 담은 간결한 구로 쓰세요** — 명사형(예: "공동체 의식")이나 동사 기본형(예: "참여하다")으로 끝내고, "~라는 뜻이에요", "~을 의미해요"처럼 풀어서 문장으로 만들지 마세요.
   **nuance와 comparisonNuanceDiff는 예외 없이 친절한 해요체(존댓말)로 쓰세요** — "~해요", "~예요", "~이에요", "~네요"처럼 독자에게 직접 설명하듯 끝내고, 다음은 절대 쓰지 마세요: "~한다/~이다"(문어체), "~합니다/~입니다/~니다"(격식체), "~것./~함./~임./~음."처럼 명사형으로 문장을 끝맺는 방식.
8. 다른 설명 없이, 아래 JSON 스키마와 정확히 일치하는 JSON 객체만 출력하세요.

JSON 스키마:
{
  "expressions": [
    {
      "phrase": "주어진 단락에 그대로 등장하는 English word/phrase",
      "meaningKo": "한국어, 간결한 명사형/동사 기본형 구 (영어 아님)",
      "nuance": "한국어, 해요체 문장 (영어 아님)",
      "exampleEn": "English sentence",
      "exampleKo": "한국어 (영어 아님)",
      "comparisonPhrase": "English word/phrase",
      "comparisonNuanceDiff": "한국어, 해요체 문장 (영어 아님)"
    }
  ]
}`;

function buildEditorialExpressionsUserPrompt(
  englishSummary: string,
  topic: CultureEditorialTopic,
  existingPhrases: string[],
  priorFailureReason?: string,
): string {
  const preferredExpressionsLine = topic.preferredExpressions?.length
    ? `\n이 단락에 등장했다면 우선적으로 선택할 후보 표현: ${topic.preferredExpressions.join(", ")}`
    : "";

  const styleNoteLine = topic.styleNote ? `\n추가 지시: ${topic.styleNote}` : "";

  const retryNote = priorFailureReason
    ? `\n\n[이전 시도 실패 — 다시 선택]\n바로 전 시도는 다음 이유로 거부되었습니다: ${priorFailureReason}\n아래 단락 안에 실제로 등장하는 단어들만 그대로 사용해서, 기존 표현과 겹치지 않게 다시 고르세요.`
    : "";

  return `카테고리: ${topic.category}

이미 사용 중인 기존 표현 (이것들과 같거나 거의 같은 표현은 고르지 마세요):
${existingPhrases.join(", ")}${preferredExpressionsLine}${styleNoteLine}

아래 영어 단락에서 표현 3개를 골라 JSON 객체 하나만 출력하세요:
"${englishSummary}"${retryNote}`;
}

function parseEditorialExpression(raw: EditorialExpressionJson): ExpressionSeed | null {
  if (
    !isNonEmptyString(raw.phrase) ||
    !isNonEmptyString(raw.meaningKo) ||
    !isNonEmptyString(raw.nuance) ||
    !isNonEmptyString(raw.exampleEn) ||
    !isNonEmptyString(raw.exampleKo) ||
    !isNonEmptyString(raw.comparisonPhrase) ||
    !isNonEmptyString(raw.comparisonNuanceDiff)
  ) {
    return null;
  }

  return {
    phrase: raw.phrase,
    meaningKo: raw.meaningKo,
    nuance: raw.nuance,
    exampleEn: raw.exampleEn,
    exampleKo: raw.exampleKo,
    comparison: {
      phrase: raw.comparisonPhrase,
      nuanceDiff: raw.comparisonNuanceDiff,
    },
  };
}

function parseEditorialExpressions(raw: EditorialExpressionsJson): ExpressionSeed[] | null {
  if (!Array.isArray(raw.expressions) || raw.expressions.length !== EXPECTED_EXPRESSION_COUNT) {
    return null;
  }

  const expressions: ExpressionSeed[] = [];
  for (const rawExpression of raw.expressions) {
    const parsed = parseEditorialExpression(rawExpression as EditorialExpressionJson);
    if (!parsed) return null;
    expressions.push(parsed);
  }

  return expressions;
}

type EditorialExpressionsAttemptResult =
  | { ok: true; expressions: ExpressionSeed[] }
  | { ok: false; reason: string };

async function attemptEditorialExpressionsGeneration(
  topic: CultureEditorialTopic,
  englishSummary: string,
  existingPhrases: string[],
  attempt: number,
  priorFailureReason: string | undefined,
): Promise<EditorialExpressionsAttemptResult> {
  const content = await trackedCallOpenAi(
    EDITORIAL_EXPRESSIONS_SYSTEM_PROMPT,
    buildEditorialExpressionsUserPrompt(englishSummary, topic, existingPhrases, priorFailureReason),
  );
  if (!content) {
    console.error(`[llm/editorial] ${topic.category}/"${topic.englishTitle}": expressions attempt ${attempt} got no completion`);
    return { ok: false, reason: "응답을 받지 못했습니다" };
  }

  let raw: EditorialExpressionsJson;
  try {
    raw = JSON.parse(content) as EditorialExpressionsJson;
  } catch {
    console.error(`[llm/editorial] ${topic.category}/"${topic.englishTitle}": expressions attempt ${attempt} invalid JSON`);
    return { ok: false, reason: "응답이 유효한 JSON이 아니었습니다" };
  }

  const expressions = parseEditorialExpressions(raw);
  if (!expressions) {
    console.error(`[llm/editorial] ${topic.category}/"${topic.englishTitle}": expressions attempt ${attempt} didn't match the expected shape`);
    return {
      ok: false,
      reason: "JSON 스키마와 맞지 않았습니다 (필드 누락, 빈 문자열, comparison 누락, 또는 expressions가 정확히 3개가 아님)",
    };
  }

  // 1) 본문에 실제로 등장하는지 — 하이라이터와 동일한 매처로 검증.
  for (const expression of expressions) {
    if (!textContainsPhrase(englishSummary, expression.phrase)) {
      console.error(
        `[llm/editorial] ${topic.category}/"${topic.englishTitle}": expressions attempt ${attempt} phrase "${expression.phrase}" not found in englishSummary — rejecting`,
      );
      return {
        ok: false,
        reason: `선택한 표현 "${expression.phrase}"가 주어진 단락 안에 그대로 없었습니다`,
      };
    }
  }

  // 2) 기존 21개 표현 및 같은 호출 안 3개 서로 간의 중복 여부.
  const normalizedExisting = new Set(existingPhrases.map(normalizePhrase));
  const seenInThisBatch = new Set<string>();
  for (const expression of expressions) {
    const normalized = normalizePhrase(expression.phrase);
    if (normalizedExisting.has(normalized) || seenInThisBatch.has(normalized)) {
      console.error(
        `[llm/editorial] ${topic.category}/"${topic.englishTitle}": expressions attempt ${attempt} phrase "${expression.phrase}" duplicates an existing/already-picked expression — rejecting`,
      );
      return {
        ok: false,
        reason: `선택한 표현 "${expression.phrase}"가 기존 표현 또는 이번에 이미 고른 다른 표현과 겹쳤습니다`,
      };
    }
    seenInThisBatch.add(normalized);
  }

  // 3) 한국어 문체 검증 — meaningKo는 간결한 명사형/동사 기본형 구,
  //    nuance·comparisonNuanceDiff는 해요체여야 한다. 프롬프트 지시만으로는
  //    가끔 새어나가는 걸 실제로 관찰했으므로(문어체/격식체/명사형 종결,
  //    또는 meaningKo가 완결된 문장이 되는 경우), 저장 전에 정규식으로
  //    한 번 더 걸러 재시도를 유도한다.
  for (const expression of expressions) {
    const violation = findKoreanStyleViolation(expression);
    if (violation) {
      console.error(
        `[llm/editorial] ${topic.category}/"${topic.englishTitle}": expressions attempt ${attempt} style violation — ${violation}`,
      );
      return { ok: false, reason: violation };
    }
  }

  return { ok: true, expressions };
}

// meaningKo는 "~이에요/~해요/~예요/~네요"로 끝나는 완결된 해요체 문장이면
// 안 된다(간결한 명사형/동사 기본형 구여야 함, 예: "아침 일과"). nuance·
// comparisonNuanceDiff는 반대로 문어체("~한다/~이다"), 격식체("~합니다/
// ~입니다/~니다"), 또는 명사형으로 끝맺는 문장("~것./~함./~임./~음.")이면
// 안 된다(해요체여야 함).
const MEANING_SENTENCE_ENDING = /(이에요|해요|예요|네요)\.?['"]?$/;
const WRITTEN_OR_FORMAL_ENDING = /(한다|이다|합니다|입니다|니다|것|함|임|음)\.?['"]?$/;

function findKoreanStyleViolation(expression: ExpressionSeed): string | null {
  // parseEditorialExpression already requires nuance/comparison to be
  // non-empty strings before constructing this object (see
  // isNonEmptyString checks above) — the `?? ""` here is only to satisfy
  // ExpressionSeed's generally-optional typing, not a real fallback path.
  const nuance = expression.nuance ?? "";
  const comparisonNuanceDiff = expression.comparison?.nuanceDiff ?? "";

  if (MEANING_SENTENCE_ENDING.test(expression.meaningKo.trim())) {
    return `표현 "${expression.phrase}"의 meaningKo("${expression.meaningKo}")가 완결된 해요체 문장입니다 — 명사형/동사 기본형의 간결한 구로 다시 쓰세요`;
  }
  if (WRITTEN_OR_FORMAL_ENDING.test(nuance.trim())) {
    return `표현 "${expression.phrase}"의 nuance("${nuance}")가 문어체·격식체·명사형으로 끝났습니다 — 해요체로 다시 쓰세요`;
  }
  if (WRITTEN_OR_FORMAL_ENDING.test(comparisonNuanceDiff.trim())) {
    return `표현 "${expression.phrase}"의 comparisonNuanceDiff("${comparisonNuanceDiff}")가 문어체·격식체·명사형으로 끝났습니다 — 해요체로 다시 쓰세요`;
  }
  return null;
}

// ---------------------------------------------------------------------
// Step 0: 자율 주제 선정. 사람이 미리 써둔 CultureEditorialTopic 없이,
// 카테고리만 주어졌을 때 GPT가 스스로 소재를 고르게 한다 — 매일 자동
// 실행되는 /api/cron/daily-editorial가 이 단계부터 호출한다. 고른 결과를
// CultureEditorialTopic으로 포장해 Step 1(본문 생성)에 그대로 넘기므로,
// 본문·표현 생성 로직(위 Step 1/2)은 전혀 바꾸지 않는다.
// ---------------------------------------------------------------------

type EditorialTopicPick = {
  englishTitle: string;
  koreanTitle: string;
  topicBrief: string;
};

type EditorialTopicJson = {
  englishTitle?: unknown;
  koreanTitle?: unknown;
  topicBrief?: unknown;
};

const EDITORIAL_TOPIC_SYSTEM_PROMPT = `당신은 CATCHY라는 한국어-영어 학습 서비스의 콘텐츠 기획자입니다.
주어진 카테고리 안에서 "컬처 에디토리얼" 콘텐츠로 쓸 새로운 소재를 하나 선정하세요 — 특정 뉴스 기사를 요약하는 게 아니라, 이미 널리 알려져 있고 보편적으로 검증된 문화 현상이나 관용 표현을 소재로 삼아야 합니다.

반드시 지켜야 할 규칙:
1. 검증되지 않은 "최신" 사건, 특정 인물, 특정 작품명, 특정 날짜의 실제 뉴스를 소재로 삼지 마세요 — 시점에 상관없이 보편적으로 통용되는 문화 현상이나 관용 표현만 선택하세요.
2. 아래 "이미 다룬 주제들"과 소재·주제가 겹치면 안 됩니다. 같은 소재를 다른 제목으로 재탕하지 마세요.
3. 학습자가 실생활에서 바로 쓸 수 있는 영어 표현(관용구, 구동사, 구어체 표현)이 본문에 자연스럽게 등장할 수 있는 소재를 고르세요.
4. topicBrief는 한국어로 1~2문장, 이 소재가 정확히 무엇인지 설명하세요 — 이후 본문을 쓸 작가가 topicBrief만 보고 바로 글을 쓸 수 있을 만큼 구체적이어야 합니다.
5. 다른 설명 없이, 아래 JSON 스키마와 정확히 일치하는 JSON 객체만 출력하세요.

JSON 스키마:
{
  "englishTitle": "English title",
  "koreanTitle": "한국어 제목",
  "topicBrief": "한국어 1~2문장 소재 설명"
}`;

function buildEditorialTopicUserPrompt(
  category: Category,
  existingTitles: { englishTitle: string; koreanTitle: string }[],
  priorFailureReason?: string,
): string {
  const existingTitleLines = existingTitles.map((t) => `- ${t.englishTitle} / ${t.koreanTitle}`).join("\n");

  const retryNote = priorFailureReason
    ? `\n\n[이전 시도 실패 — 다시 선정]\n바로 전 시도는 다음 이유로 거부되었습니다: ${priorFailureReason}\n같은 문제가 반복되지 않게 다른 소재를 다시 고르세요.`
    : "";

  return `카테고리: ${category}

이미 다룬 주제들 (겹치면 안 됩니다):
${existingTitleLines}

위 규칙을 지켜 새로운 소재를 하나 선정하고 JSON 객체 하나만 출력하세요.${retryNote}`;
}

function parseEditorialTopic(raw: EditorialTopicJson): EditorialTopicPick | null {
  if (!isNonEmptyString(raw.englishTitle) || !isNonEmptyString(raw.koreanTitle) || !isNonEmptyString(raw.topicBrief)) {
    return null;
  }
  return { englishTitle: raw.englishTitle, koreanTitle: raw.koreanTitle, topicBrief: raw.topicBrief };
}

type EditorialTopicAttemptResult = { ok: true; topic: EditorialTopicPick } | { ok: false; reason: string };

async function attemptTopicSelection(
  category: Category,
  existingTitles: { englishTitle: string; koreanTitle: string }[],
  attempt: number,
  priorFailureReason: string | undefined,
): Promise<EditorialTopicAttemptResult> {
  const content = await trackedCallOpenAi(
    EDITORIAL_TOPIC_SYSTEM_PROMPT,
    buildEditorialTopicUserPrompt(category, existingTitles, priorFailureReason),
  );
  if (!content) {
    console.error(`[llm/editorial] ${category}: topic selection attempt ${attempt} got no completion`);
    return { ok: false, reason: "응답을 받지 못했습니다" };
  }

  let raw: EditorialTopicJson;
  try {
    raw = JSON.parse(content) as EditorialTopicJson;
  } catch {
    console.error(`[llm/editorial] ${category}: topic selection attempt ${attempt} invalid JSON`);
    return { ok: false, reason: "응답이 유효한 JSON이 아니었습니다" };
  }

  const topic = parseEditorialTopic(raw);
  if (!topic) {
    console.error(`[llm/editorial] ${category}: topic selection attempt ${attempt} didn't match the expected shape`);
    return { ok: false, reason: "JSON 스키마와 맞지 않았습니다 (필드 누락 또는 빈 문자열)" };
  }

  const normalizedPickedTitle = normalizePhrase(topic.englishTitle);
  const isDuplicate = existingTitles.some((existing) => normalizePhrase(existing.englishTitle) === normalizedPickedTitle);
  if (isDuplicate) {
    console.error(`[llm/editorial] ${category}: topic selection attempt ${attempt} picked a duplicate title "${topic.englishTitle}"`);
    return { ok: false, reason: `"${topic.englishTitle}"는 이미 다룬 주제와 겹칩니다 — 다른 소재를 고르세요` };
  }

  return { ok: true, topic };
}

// 호출부(/api/cron/daily-editorial)가 카테고리만 넘기면 된다 — 주제 선정부터
// 본문·표현 생성까지 이 함수 하나로 끝난다. existingTitles/existingPhrases는
// Supabase에서 조회한 최근 게시 에디토리얼(fetchRecentEditorialContext)을
// 그대로 넘기면 되고, 하드코딩된 EXISTING_EDITORIAL_TITLES/PHRASES(기존
// 7개)는 이 함수와 generateCultureEditorialWithLlm 양쪽에서 항상 자동으로
// 함께 고려된다. 재시도를 모두 소진하면 null을 반환한다(throw하지 않음) —
// 호출부는 해당 카테고리만 건너뛰고 나머지를 계속 진행해야 한다.
export async function generateDailyCultureEditorial(
  category: Category,
  context: {
    existingTitles?: { englishTitle: string; koreanTitle: string }[];
    existingPhrases?: string[];
    existingOpenings?: string[];
  } = {},
): Promise<GenerateCultureEditorialOutput | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const existingTitlesForTopicPick = [...EXISTING_EDITORIAL_TITLES, ...(context.existingTitles ?? [])];

  let topicPick: EditorialTopicPick | null = null;
  let topicFailureReason: string | undefined;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const result = await attemptTopicSelection(category, existingTitlesForTopicPick, attempt, topicFailureReason);
    if (result.ok) {
      topicPick = result.topic;
      break;
    }
    topicFailureReason = result.reason;
  }
  if (!topicPick) return null;

  const topic: CultureEditorialTopic = { category, ...topicPick };
  return generateCultureEditorialWithLlm(topic, {
    existingTitles: context.existingTitles,
    existingPhrases: context.existingPhrases,
    existingOpenings: context.existingOpenings,
  });
}

// ---------------------------------------------------------------------
// 공개 진입점
// ---------------------------------------------------------------------

// 재시도를 모두 소진하면 null을 반환한다 — 절대 throw하지 않는다(호출부가
// "생성 실패"를 명확한 값으로 처리할 수 있도록). null을 받은 호출부는
// 뉴스용 스텁 템플릿으로 대체하지 말 것 — 파일 상단 설명 참고.
export async function generateCultureEditorialWithLlm(
  topic: CultureEditorialTopic,
  options: {
    existingTitles?: { englishTitle: string; koreanTitle: string }[];
    existingPhrases?: string[];
    existingOpenings?: string[];
  } = {},
): Promise<GenerateCultureEditorialOutput | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }

  const existingTitles = [...EXISTING_EDITORIAL_TITLES, ...(options.existingTitles ?? [])];
  const existingPhrases = [...EXISTING_EDITORIAL_PHRASES, ...(options.existingPhrases ?? [])];
  const existingOpenings = options.existingOpenings ?? [];

  let summary: EditorialSummaryOutput | null = null;
  let summaryFailureReason: string | undefined;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const result = await attemptEditorialSummaryGeneration(topic, existingTitles, existingOpenings, attempt, summaryFailureReason);
    if (result.ok) {
      summary = result.summary;
      break;
    }
    summaryFailureReason = result.reason;
  }
  if (!summary) return null;

  let expressions: ExpressionSeed[] | null = null;
  let expressionsFailureReason: string | undefined;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const result = await attemptEditorialExpressionsGeneration(
      topic,
      summary.englishSummary,
      existingPhrases,
      attempt,
      expressionsFailureReason,
    );
    if (result.ok) {
      expressions = result.expressions;
      break;
    }
    expressionsFailureReason = result.reason;
  }
  if (!expressions) return null;

  return { ...summary, expressions };
}

// ---------------------------------------------------------------------
// 백필: 이미 저장된 gpt_editorial 행의 오프닝 반복/한국어 문체 문제를
// 고치는 재작성 진입점. generateCultureEditorialWithLlm과 달리 새 주제를
// 고르지 않는다 — 기존 title/카테고리/영어 표현(phrase)은 그대로 두고
// (1) 영어 본문 오프닝만 다시 쓰고 (2) 한국어 필드의 종결 어미를 통일한다
// (meaningKo는 간결한 명사형/동사 기본형, 나머지는 해요체). scripts/ 아래
// 일회성 백필 스크립트 전용 — 자동 cron에서는 호출하지 않는다.
// ---------------------------------------------------------------------

export type EditorialRewriteInput = {
  category: Category;
  title: string;
  englishTitle: string;
  summary: string;
  englishSummary: string;
  expressions: { phrase: string; exampleEn: string; comparisonPhrase: string }[];
};

export type EditorialRewriteOutput = {
  title: string;
  summary: string;
  englishSummary: string;
  koreanSummary: string;
  expressions: { phrase: string; meaningKo: string; nuance: string; exampleKo: string; comparisonNuanceDiff: string }[];
};

type EditorialRewriteJson = {
  title?: unknown;
  summary?: unknown;
  englishSummary?: unknown;
  koreanSummary?: unknown;
  expressions?: unknown;
};

type EditorialRewriteExpressionJson = {
  phrase?: unknown;
  meaningKo?: unknown;
  nuance?: unknown;
  exampleKo?: unknown;
  comparisonNuanceDiff?: unknown;
};

const EDITORIAL_REWRITE_SYSTEM_PROMPT = `당신은 CATCHY라는 한국어-영어 학습 서비스의 콘텐츠 편집자입니다.
이미 게시된 "컬처 에디토리얼" 글 하나를 받아서, 아래 두 가지만 고칩니다 — 그 외 내용·주제·사실관계는 바꾸지 않습니다:

1. 영어 본문(englishSummary)의 **오프닝(첫 문장~첫 문단)만** 자연스럽게 다시 씁니다. 나머지 문장/문단은 가능한 한 그대로 유지하되, 오프닝이 바뀌면서 앞뒤가 어색해지지 않도록 필요한 최소한의 연결만 다듬으세요.
2. 한국어 쪽(title/summary/koreanSummary/표현 카드의 한국어 필드)의 종결 어미를 통일합니다 — meaningKo는 간결한 명사형/동사 기본형 구로, 나머지는 해요체로.

반드시 지켜야 할 규칙:
1. 주제, 핵심 메시지, 카테고리는 절대 바꾸지 마세요 — 완전히 다른 글이 되면 안 됩니다.
2. **아래 "반드시 본문에 남아있어야 하는 표현"에 적힌 영어 표현은 전부 새 englishSummary 안에 단어 순서 그대로 다시 등장해야 합니다.** 이 표현들은 절대 삭제·변형하지 마세요(시제/단수복수 정도의 변화는 허용).
3. "이 카테고리의 오프닝 전략"을 따라 새 오프닝을 쓰고, "You", "You're", "Have you ever", "Picture this", "Imagine", "In today's", "These days", "There's something", "When was the last time"로 시작하지 마세요. "최근/다른 글의 오프닝들"과도 구조가 겹치면 안 됩니다.
4. englishSummary는 기존과 비슷한 분량(130~160단어)과 문단 구성(빈 줄로 구분된 2~3문단)을 유지하세요.
5. koreanSummary는 새 englishSummary 전체와 같은 내용을 담은 자연스러운 번역이어야 하고, **반드시 해요체로 쓰세요**("~해요", "~예요", "~이에요", "~네요" 등) — "~한다", "~이다", "~합니다", "~입니다"체는 쓰지 마세요. englishSummary와 같은 문단 수로 나누세요.
6. title은 기존 제목의 핵심 의미를 유지하면서 자연스럽게 다듬어도 됩니다 — 완전히 다른 제목으로 바꾸지 마세요. 문장형이면 해요체로 끝내세요(명사구는 그대로 둬도 됩니다). summary(한 줄 요약)도 완전한 문장이면 해요체로 쓰세요.
7. expressions 배열은 입력받은 순서·개수를 그대로 유지하고, 각 항목의 phrase는 입력받은 영어 표현을 **토씨 하나 바꾸지 말고 그대로** 돌려주세요. meaningKo/nuance/exampleKo/comparisonNuanceDiff만 다시 쓰되, 의미는 바꾸지 마세요. **meaningKo는 "아침 일과"처럼 간결한 명사형/동사 기본형 구로 쓰세요** — "~라는 뜻이에요"처럼 문장으로 풀어 쓰지 마세요. **nuance와 comparisonNuanceDiff는 예외 없이 친절한 해요체(존댓말)로** 쓰세요 — "~한다/~이다/~합니다/~입니다"(문어체·격식체)나 "~것./~함./~임./~음."(명사형 종결)으로 끝내지 마세요.
8. 다른 설명 없이, 아래 JSON 스키마와 정확히 일치하는 JSON 객체만 출력하세요.

JSON 스키마:
{
  "title": "한국어 제목",
  "summary": "한국어 한 줄 요약",
  "englishSummary": "English paragraph, 130-160 words, 2-3 paragraphs separated by a blank line",
  "koreanSummary": "englishSummary의 해요체 한국어 번역",
  "expressions": [
    { "phrase": "입력받은 영어 표현 그대로", "meaningKo": "간결한 명사형/동사 기본형 한국어", "nuance": "해요체 한국어", "exampleKo": "해요체 한국어", "comparisonNuanceDiff": "해요체 한국어" }
  ]
}`;

function buildEditorialRewriteUserPrompt(
  input: EditorialRewriteInput,
  existingOpenings: string[],
  priorFailureReason?: string,
): string {
  const requiredPhrasesLines = input.expressions.map((e) => `- ${e.phrase} (예문: ${e.exampleEn})`).join("\n");
  const existingOpeningLines = existingOpenings.length ? existingOpenings.map((o) => `- ${o}`).join("\n") : "(없음)";
  const retryNote = priorFailureReason
    ? `\n\n[이전 시도 실패 — 다시 작성]\n바로 전 시도는 다음 이유로 거부되었습니다: ${priorFailureReason}\n같은 문제가 반복되지 않게 다시 쓰세요.`
    : "";

  return `카테고리: ${input.category}

이 카테고리의 오프닝 전략: ${CATEGORY_OPENING_GUIDANCE[input.category]}

기존 제목: ${input.title} / ${input.englishTitle}
기존 한 줄 요약: ${input.summary}
기존 영어 본문:
"${input.englishSummary}"

반드시 본문에 그대로 남아있어야 하는 표현:
${requiredPhrasesLines}

최근/다른 글의 오프닝들 (구조가 겹치면 안 됨):
${existingOpeningLines}

위 규칙을 지켜 JSON 객체 하나만 출력하세요.${retryNote}`;
}

function parseEditorialRewrite(raw: EditorialRewriteJson, expectedCount: number): EditorialRewriteOutput | null {
  if (
    !isNonEmptyString(raw.title) ||
    !isNonEmptyString(raw.summary) ||
    !isNonEmptyString(raw.englishSummary) ||
    !isNonEmptyString(raw.koreanSummary) ||
    !Array.isArray(raw.expressions) ||
    raw.expressions.length !== expectedCount
  ) {
    return null;
  }

  const expressions: EditorialRewriteOutput["expressions"] = [];
  for (const rawExpression of raw.expressions) {
    const e = rawExpression as EditorialRewriteExpressionJson;
    if (
      !isNonEmptyString(e.phrase) ||
      !isNonEmptyString(e.meaningKo) ||
      !isNonEmptyString(e.nuance) ||
      !isNonEmptyString(e.exampleKo) ||
      !isNonEmptyString(e.comparisonNuanceDiff)
    ) {
      return null;
    }
    expressions.push({
      phrase: e.phrase,
      meaningKo: e.meaningKo,
      nuance: e.nuance,
      exampleKo: e.exampleKo,
      comparisonNuanceDiff: e.comparisonNuanceDiff,
    });
  }

  return {
    title: raw.title,
    summary: raw.summary,
    englishSummary: raw.englishSummary,
    koreanSummary: raw.koreanSummary,
    expressions,
  };
}

// 재시도를 모두 소진하면 null을 반환한다(throw하지 않음) — 호출부(백필
// 스크립트)는 null을 받으면 해당 행을 건너뛰고 기존 데이터를 그대로 둬야
// 한다. 영어 표현(phrase)이 결과에서 바뀌었거나 본문에서 사라졌으면 그
// 자체로 재시도 사유가 되므로, 반환된 결과는 항상 검증을 통과한 것이다.
export async function rewriteEditorialForVariety(
  input: EditorialRewriteInput,
  existingOpenings: string[] = [],
): Promise<EditorialRewriteOutput | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const expectedPhrases = input.expressions.map((e) => e.phrase);
  let failureReason: string | undefined;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const content = await trackedCallOpenAi(
      EDITORIAL_REWRITE_SYSTEM_PROMPT,
      buildEditorialRewriteUserPrompt(input, existingOpenings, failureReason),
    );
    if (!content) {
      console.error(`[llm/editorial-rewrite] ${input.title}: attempt ${attempt} got no completion`);
      failureReason = "응답을 받지 못했습니다";
      continue;
    }

    let raw: EditorialRewriteJson;
    try {
      raw = JSON.parse(content) as EditorialRewriteJson;
    } catch {
      console.error(`[llm/editorial-rewrite] ${input.title}: attempt ${attempt} invalid JSON`);
      failureReason = "응답이 유효한 JSON이 아니었습니다";
      continue;
    }

    const parsed = parseEditorialRewrite(raw, expectedPhrases.length);
    if (!parsed) {
      console.error(`[llm/editorial-rewrite] ${input.title}: attempt ${attempt} didn't match the expected shape`);
      failureReason = "JSON 스키마와 맞지 않았습니다 (필드 누락, expressions 개수 불일치 등)";
      continue;
    }

    const phraseMismatchIndex = parsed.expressions.findIndex(
      (e, i) => normalizePhrase(e.phrase) !== normalizePhrase(expectedPhrases[i]),
    );
    if (phraseMismatchIndex !== -1) {
      console.error(
        `[llm/editorial-rewrite] ${input.title}: attempt ${attempt} phrase[${phraseMismatchIndex}] changed from "${expectedPhrases[phraseMismatchIndex]}" to "${parsed.expressions[phraseMismatchIndex].phrase}"`,
      );
      failureReason = "expressions의 phrase가 입력받은 것과 달라졌습니다 — phrase는 절대 바꾸지 말고 그대로 돌려주세요";
      continue;
    }

    const wordCount = countWords(parsed.englishSummary);
    if (wordCount < MIN_ENGLISH_SUMMARY_WORDS || wordCount > MAX_ENGLISH_SUMMARY_WORDS) {
      console.error(`[llm/editorial-rewrite] ${input.title}: attempt ${attempt} word count ${wordCount} out of range`);
      failureReason = `englishSummary가 ${wordCount}단어였습니다 — ${MIN_ENGLISH_SUMMARY_WORDS}~${MAX_ENGLISH_SUMMARY_WORDS}단어로 다시 쓰세요`;
      continue;
    }

    const missingPhrase = expectedPhrases.find((phrase) => !textContainsPhrase(parsed.englishSummary, phrase));
    if (missingPhrase) {
      console.error(`[llm/editorial-rewrite] ${input.title}: attempt ${attempt} phrase "${missingPhrase}" missing from new englishSummary`);
      failureReason = `표현 "${missingPhrase}"가 새 영어 본문에서 사라졌습니다 — 반드시 그대로 다시 포함시켜 쓰세요`;
      continue;
    }

    const firstSentence = extractFirstSentence(parsed.englishSummary);
    const bannedPattern = matchedBannedOpeningPattern(firstSentence);
    if (bannedPattern) {
      console.error(`[llm/editorial-rewrite] ${input.title}: attempt ${attempt} still matched banned pattern ${bannedPattern}`);
      failureReason = `첫 문장("${firstSentence}")이 여전히 금지된 시작 패턴을 썼습니다 — 완전히 다른 방식으로 다시 쓰세요`;
      continue;
    }

    const similarOpening = findTooSimilarOpening(firstSentence, existingOpenings);
    if (similarOpening) {
      console.error(`[llm/editorial-rewrite] ${input.title}: attempt ${attempt} still too similar to "${similarOpening}"`);
      failureReason = `첫 문장("${firstSentence}")이 다른 글의 오프닝("${similarOpening}")과 여전히 비슷합니다 — 다시 쓰세요`;
      continue;
    }

    return parsed;
  }

  return null;
}
