import "server-only";

import type { Category, ExpressionSeed } from "@/lib/mock-data";
import type { GenerateTrendDraftOutput } from "@/lib/server/generate-trend-draft";
import { textContainsPhrase } from "@/lib/highlight-expressions";

// Metadata-only input — exactly title/sourceName/originalUrl/
// publishedAt per article, plus category/clusterKey. Never the article
// body: callers (collect-trends.ts) only ever have metadata to begin
// with, since src/lib/server/rss-collect.ts and gdelt.ts never fetch
// bodies either.
export type LlmArticleInput = {
  title: string;
  sourceName: string;
  originalUrl: string;
  publishedAt: string;
};

export type LlmTrendDraftInput = {
  category: Category;
  clusterKey: string;
  articles: LlmArticleInput[];
};

const OPENAI_CHAT_COMPLETIONS_ENDPOINT = "https://api.openai.com/v1/chat/completions";
const MODEL = "gpt-4o-mini";
const REQUEST_TIMEOUT_MS = 30_000;
const EXPECTED_EXPRESSION_COUNT = 3;
const MIN_ENGLISH_SUMMARY_SENTENCES = 5;
const MAX_ATTEMPTS = 3;

function countSentences(text: string): number {
  return text.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 0).length;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

async function callOpenAi(systemPrompt: string, userPrompt: string): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  let response: Response;
  try {
    response = await fetch(OPENAI_CHAT_COMPLETIONS_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        response_format: { type: "json_object" },
        temperature: 0.7,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    console.error("[llm] request failed", error);
    return null;
  }

  if (!response.ok) {
    console.error(`[llm] HTTP ${response.status}`);
    return null;
  }

  let payload: { choices?: Array<{ message?: { content?: string } }> };
  try {
    payload = await response.json();
  } catch {
    console.error("[llm] non-JSON response");
    return null;
  }

  return payload.choices?.[0]?.message?.content ?? null;
}

// ---------------------------------------------------------------------
// Step 1: summary generation (no expressions yet). Keeping phrase
// selection out of this step means the text gets written freely, with
// no need to engineer a sentence around a phrase picked in advance.
// ---------------------------------------------------------------------

type LlmSummaryOutput = {
  title: string;
  summary: string;
  englishSummary: string;
  koreanSummary: string;
  whyTrending: string;
};

type LlmSummaryJson = {
  title?: unknown;
  summary?: unknown;
  englishSummary?: unknown;
  koreanSummary?: unknown;
  whyTrending?: unknown;
};

const SUMMARY_SYSTEM_PROMPT = `당신은 CATCHY라는 한국어-영어 학습 서비스의 콘텐츠 작가입니다.
여러 출처에서 수집된 기사의 "제목/출처/링크/날짜" 메타데이터만 보고,
그 이슈를 설명하는 글을 새로 작성합니다.

반드시 지켜야 할 규칙:
1. 기사 본문은 제공되지 않습니다 — 제목/출처/날짜만으로 판단하세요. 모르는 세부 내용을 지어내지 마세요.
2. 원문 기사 문장을 그대로 복사하거나 어순만 살짝 바꿔 재구성하지 마세요. title/summary/englishSummary/koreanSummary/whyTrending은 모두 출처 기사들과는 **다른 문장 구조**로 당신이 새로 쓴 문장이어야 합니다 — 단순 번역이나 단어 몇 개만 바꾼 문장은 안 됩니다.
3. 작품명/인물명/팀명/행사명 같은 고유명사는 사실(fact)이지 저작권이 있는 "표현"이 아니므로, 여러 출처 제목에 공통으로 등장한다면 title/summary/설명 전체에서 명확하게 밝혀 써야 합니다. "화제작", "어떤 이슈"처럼 무엇에 대한 이야기인지 알 수 없게 얼버무리면 안 됩니다 — 사용자가 title과 summary만 읽어도 정확히 "누가/무엇이" 화제인지 알 수 있어야 합니다.
4. 여러 출처에서 공통으로 확인되는 사실만 설명하세요 — 한 출처에만 있을 법한 세부 내용(구체적인 수치, 인용문, 추측성 디테일)은 넣지 마세요. 하지만 "무엇에 대한 이야기인지"(고유명사, 핵심 사건)는 세부 내용이 아니라 이 트렌드의 핵심이므로 반드시 포함하세요.
5. englishSummary는 **최소 5문장 이상**의 영어 단락이어야 합니다 (4문장 이하는 안 됩니다). 고유명사를 포함해 구체적으로 쓰고, 각 문장이 사건의 다른 측면(누가/무엇이/언제/어디서/어떻게/왜 화제인지, 배경, 반응 등)을 설명하도록 해서 실질적인 정보량을 채우세요. 민감한 주제(건강, 분쟁, 사고 등)라도 보도된 사실을 담담하게 서술하세요 — 과도하게 모호한 추측형 문장으로만 채우지 마세요.
6. koreanSummary는 englishSummary와 **같은 내용**을 담은 한국어 문단이어야 합니다 — englishSummary에 쓴 내용을 자연스러운 한국어로 풀어서 설명하세요 (문장 대 문장으로 기계적으로 직역하지 말고, 한국어로 읽었을 때 자연스러운 문장 구조로 다시 쓰되, 같은 사실/내용을 모두 담아야 합니다). englishSummary에 없는 새로운 사실을 추가하거나 englishSummary에 있는 내용을 빼면 안 됩니다.
7. 언어는 필드마다 반드시 다음과 같이 쓰세요 — 섞어 쓰지 마세요:
   - 한국어로 쓸 것: title, summary, koreanSummary, whyTrending
   - 영어로 쓸 것: englishSummary
8. 다른 설명 없이, 아래 JSON 스키마와 정확히 일치하는 JSON 객체만 출력하세요.

JSON 스키마 (각 필드는 반드시 지정된 언어로 쓰세요):
{
  "title": "한국어 문장 (영어 아님)",
  "summary": "한국어 문장 (영어 아님)",
  "englishSummary": "English paragraph, 5+ sentences",
  "koreanSummary": "englishSummary를 한국어로 풀어 쓴 문단, 같은 내용 (영어 아님)",
  "whyTrending": "한국어 문장 (영어 아님)"
}`;

function buildSummaryUserPrompt(input: LlmTrendDraftInput, priorFailureReason?: string): string {
  const articleLines = input.articles
    .map(
      (a, i) =>
        `${i + 1}. title: "${a.title}" | source: ${a.sourceName} | published: ${a.publishedAt} | url: ${a.originalUrl}`,
    )
    .join("\n");

  const retryNote = priorFailureReason
    ? `\n\n[이전 시도 실패 — 다시 작성]\n바로 전 시도는 다음 이유로 거부되었습니다: ${priorFailureReason}\n같은 문제가 반복되지 않게 다시 쓰세요.`
    : "";

  return `카테고리: ${input.category}

아래는 같은 이슈를 다루는 것으로 판단되어 묶인 기사들의 메타데이터입니다 (기사 본문 없음):
${articleLines}

위 규칙을 지켜 JSON 객체 하나만 출력하세요.${retryNote}`;
}

function parseSummary(raw: LlmSummaryJson): LlmSummaryOutput | null {
  if (
    !isNonEmptyString(raw.title) ||
    !isNonEmptyString(raw.summary) ||
    !isNonEmptyString(raw.englishSummary) ||
    !isNonEmptyString(raw.koreanSummary) ||
    !isNonEmptyString(raw.whyTrending)
  ) {
    return null;
  }

  return {
    title: raw.title,
    summary: raw.summary,
    englishSummary: raw.englishSummary,
    koreanSummary: raw.koreanSummary,
    whyTrending: raw.whyTrending,
  };
}

type SummaryAttemptResult =
  | { ok: true; summary: LlmSummaryOutput }
  | { ok: false; reason: string };

async function attemptSummaryGeneration(
  input: LlmTrendDraftInput,
  attempt: number,
  priorFailureReason: string | undefined,
): Promise<SummaryAttemptResult> {
  const content = await callOpenAi(SUMMARY_SYSTEM_PROMPT, buildSummaryUserPrompt(input, priorFailureReason));
  if (!content) {
    console.error(`[llm] ${input.category}/${input.clusterKey}: summary attempt ${attempt} got no completion`);
    return { ok: false, reason: "응답을 받지 못했습니다" };
  }

  let raw: LlmSummaryJson;
  try {
    raw = JSON.parse(content) as LlmSummaryJson;
  } catch {
    console.error(`[llm] ${input.category}/${input.clusterKey}: summary attempt ${attempt} invalid JSON`);
    return { ok: false, reason: "응답이 유효한 JSON이 아니었습니다" };
  }

  const summary = parseSummary(raw);
  if (!summary) {
    console.error(`[llm] ${input.category}/${input.clusterKey}: summary attempt ${attempt} didn't match the expected shape`);
    return { ok: false, reason: "JSON 스키마와 맞지 않았습니다 (필드 누락 또는 빈 문자열)" };
  }

  if (countSentences(summary.englishSummary) < MIN_ENGLISH_SUMMARY_SENTENCES) {
    console.error(`[llm] ${input.category}/${input.clusterKey}: summary attempt ${attempt} has too few sentences`);
    return {
      ok: false,
      reason: `englishSummary가 ${MIN_ENGLISH_SUMMARY_SENTENCES}문장보다 적었습니다 — 문장을 더 추가해서 다시 쓰세요`,
    };
  }

  return { ok: true, summary };
}

// ---------------------------------------------------------------------
// Step 2: expression extraction from the already-written englishSummary.
// Selecting phrases from fixed text (instead of asking the model to
// pre-commit to a phrase and then write a sentence around it) is what
// makes the literal-match requirement actually reliable — there's
// nothing to reconcile, the phrase is just read out of text that
// already exists.
// ---------------------------------------------------------------------

type LlmExpressionJson = {
  phrase?: unknown;
  meaningKo?: unknown;
  nuance?: unknown;
  usageSituation?: unknown;
  exampleEn?: unknown;
  exampleKo?: unknown;
  comparisonPhrase?: unknown;
  comparisonNuanceDiff?: unknown;
};

type LlmExpressionsJson = {
  expressions?: unknown;
};

const EXPRESSIONS_SYSTEM_PROMPT = `당신은 CATCHY라는 한국어-영어 학습 서비스의 콘텐츠 작가입니다.
주어진 영어 단락(englishSummary) 안에서 실제로 쓰이는 자연스러운 영어 표현 정확히 3개를 "그 단락에 있는 그대로" 찾아내서 학습 콘텐츠로 만듭니다.

반드시 지켜야 할 규칙:
1. phrase는 주어진 영어 단락 안에 **단어 순서가 같은 문자열로 실제로 등장하는** 1~4단어 표현이어야 합니다. 단락에 없는 표현을 새로 만들어내면 안 됩니다 — 반드시 단락 안의 단어들을 그대로 가져와서 phrase로 쓰세요 (동사의 시제/단수복수 변화 정도는 허용되지만, 단어를 바꾸거나 추가/삭제하면 안 됩니다).
2. 세 표현은 서로 겹치지 않는 별개의 구간에서 골라야 합니다.
3. 각 표현마다 한국어 의미(meaningKo), 뉘앙스 설명(nuance), 어디서 쓰는지(usageSituation), 그 표현을 쓴 새로운 영어 예문(exampleEn, 단락의 문장을 그대로 복사하지 말고 새로 쓸 것), 한국어 해석(exampleKo), 헷갈리기 쉬운 비슷한 표현(comparisonPhrase)과 그 표현과의 뉘앙스 차이(comparisonNuanceDiff)를 채우세요.
4. 언어는 필드마다 반드시 다음과 같이 쓰세요 — 섞어 쓰지 마세요:
   - 한국어로 쓸 것: meaningKo, nuance, usageSituation, exampleKo, comparisonNuanceDiff
   - 영어로 쓸 것: phrase, exampleEn, comparisonPhrase
5. 다른 설명 없이, 아래 JSON 스키마와 정확히 일치하는 JSON 객체만 출력하세요.

JSON 스키마:
{
  "expressions": [
    {
      "phrase": "주어진 단락에 그대로 등장하는 English word/phrase",
      "meaningKo": "한국어 (영어 아님)",
      "nuance": "한국어 (영어 아님)",
      "usageSituation": "한국어 (영어 아님)",
      "exampleEn": "English sentence",
      "exampleKo": "한국어 (영어 아님)",
      "comparisonPhrase": "English word/phrase",
      "comparisonNuanceDiff": "한국어 (영어 아님)"
    }
  ]
}`;

function buildExpressionsUserPrompt(
  englishSummary: string,
  category: Category,
  priorFailureReason?: string,
): string {
  const retryNote = priorFailureReason
    ? `\n\n[이전 시도 실패 — 다시 선택]\n바로 전 시도는 다음 이유로 거부되었습니다: ${priorFailureReason}\n아래 단락 안에 실제로 등장하는 단어들만 그대로 사용해서 다시 고르세요.`
    : "";

  return `카테고리: ${category}

아래 영어 단락에서 표현 3개를 골라 JSON 객체 하나만 출력하세요:
"${englishSummary}"${retryNote}`;
}

function parseExpression(raw: LlmExpressionJson): ExpressionSeed | null {
  if (
    !isNonEmptyString(raw.phrase) ||
    !isNonEmptyString(raw.meaningKo) ||
    !isNonEmptyString(raw.nuance) ||
    !isNonEmptyString(raw.usageSituation) ||
    !isNonEmptyString(raw.exampleEn) ||
    !isNonEmptyString(raw.exampleKo)
  ) {
    return null;
  }

  const expression: ExpressionSeed = {
    phrase: raw.phrase,
    meaningKo: raw.meaningKo,
    nuance: raw.nuance,
    usageSituation: raw.usageSituation,
    exampleEn: raw.exampleEn,
    exampleKo: raw.exampleKo,
  };

  if (isNonEmptyString(raw.comparisonPhrase) && isNonEmptyString(raw.comparisonNuanceDiff)) {
    expression.comparison = {
      phrase: raw.comparisonPhrase,
      nuanceDiff: raw.comparisonNuanceDiff,
    };
  }

  return expression;
}

function parseExpressions(raw: LlmExpressionsJson): ExpressionSeed[] | null {
  if (!Array.isArray(raw.expressions) || raw.expressions.length !== EXPECTED_EXPRESSION_COUNT) {
    return null;
  }

  const expressions: ExpressionSeed[] = [];
  for (const rawExpression of raw.expressions) {
    const parsed = parseExpression(rawExpression as LlmExpressionJson);
    if (!parsed) return null;
    expressions.push(parsed);
  }

  return expressions;
}

type ExpressionsAttemptResult =
  | { ok: true; expressions: ExpressionSeed[] }
  | { ok: false; reason: string };

async function attemptExpressionsGeneration(
  input: LlmTrendDraftInput,
  englishSummary: string,
  attempt: number,
  priorFailureReason: string | undefined,
): Promise<ExpressionsAttemptResult> {
  const content = await callOpenAi(
    EXPRESSIONS_SYSTEM_PROMPT,
    buildExpressionsUserPrompt(englishSummary, input.category, priorFailureReason),
  );
  if (!content) {
    console.error(`[llm] ${input.category}/${input.clusterKey}: expressions attempt ${attempt} got no completion`);
    return { ok: false, reason: "응답을 받지 못했습니다" };
  }

  let raw: LlmExpressionsJson;
  try {
    raw = JSON.parse(content) as LlmExpressionsJson;
  } catch {
    console.error(`[llm] ${input.category}/${input.clusterKey}: expressions attempt ${attempt} invalid JSON`);
    return { ok: false, reason: "응답이 유효한 JSON이 아니었습니다" };
  }

  const expressions = parseExpressions(raw);
  if (!expressions) {
    console.error(`[llm] ${input.category}/${input.clusterKey}: expressions attempt ${attempt} didn't match the expected shape`);
    return {
      ok: false,
      reason: "JSON 스키마와 맞지 않았습니다 (필드 누락, 빈 문자열, 또는 expressions가 정확히 3개가 아님)",
    };
  }

  // The whole point of this two-step split: verify every phrase is
  // actually a literal substring of the paragraph it was supposedly
  // extracted from, using the exact same matcher the detail page's
  // highlighter uses (src/lib/highlight-expressions.tsx).
  for (const expression of expressions) {
    if (!textContainsPhrase(englishSummary, expression.phrase)) {
      console.error(
        `[llm] ${input.category}/${input.clusterKey}: expressions attempt ${attempt} phrase "${expression.phrase}" not found in englishSummary — rejecting`,
      );
      return {
        ok: false,
        reason: `선택한 표현 "${expression.phrase}"가 주어진 단락 안에 그대로 없었습니다`,
      };
    }
  }

  return { ok: true, expressions };
}

// Returns null (never throws) on missing key, or if either step fails
// every attempt — callers must treat null as "fall back to the
// template generator", not as a fatal error.
//
// Split into two independently-retried steps (summary, then
// expressions extracted from that fixed summary) rather than one call
// that has to get both right simultaneously: asking the model to
// pre-commit to a phrase and then write a sentence containing it
// verbatim was adversarial and didn't converge even after several
// retries with feedback, especially for sensitive topics (health,
// conflict) where the model tends to hedge its wording. Picking
// phrases out of text that's already fixed has nothing to reconcile,
// so it succeeds far more reliably.
export async function generateTrendDraftWithLlm(
  input: LlmTrendDraftInput,
): Promise<GenerateTrendDraftOutput | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }

  let summary: LlmSummaryOutput | null = null;
  let summaryFailureReason: string | undefined;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const result = await attemptSummaryGeneration(input, attempt, summaryFailureReason);
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
    const result = await attemptExpressionsGeneration(
      input,
      summary.englishSummary,
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
