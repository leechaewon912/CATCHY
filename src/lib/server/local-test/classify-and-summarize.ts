// LOCAL TEST ONLY — not imported by any API route, page, or DB code.
// Classifies an article into one of the 7 new categories and writes a
// 3-line factual summary, using ONLY title/domain/publishedAt as input —
// never body text, RSS description, or a GDELT snippet (the adapters
// this test uses never even fetch those fields, see
// sources/eu-presscorner-adapter.ts and local-test/gdelt-new-categories.ts).
//
// Tries a real OpenAI call first (same "metadata-only input" discipline
// as generate-trend-with-llm.ts), falls back to a deterministic
// keyword-based classifier + a title-only restatement when
// OPENAI_API_KEY isn't set — this project never generates API keys, and
// none is configured locally, so most runs of this test will use the
// fallback. Callers must record which path was used (see `usedLlm` on
// the result) so the test report is honest about it.

import type { NewCategory } from "@/lib/server/local-test/new-category-types";
import { NEW_CATEGORIES } from "@/lib/server/local-test/new-category-types";

export type ClassificationInput = {
  title: string;
  sourceName: string;
  publishedAt: string;
};

export type ClassificationResult = {
  category: NewCategory | "미분류";
  summary: string;
  usedLlm: boolean;
};

// ---------------------------------------------------------------------
// Keyword fallback — deliberately simple/deterministic, title-only.
// Unmatched titles report "미분류" rather than being forced into a
// category, per this test's explicit "분류가 불명확하면 임의로 넣지
// 말고 미분류로 보고한다" requirement.
// ---------------------------------------------------------------------
const CATEGORY_KEYWORDS: Record<NewCategory, string[]> = {
  "국제정치·외교": ["diplomacy", "summit", "treaty", "foreign minister", "president", "election", "parliament", "sanctions"],
  "경제·산업": ["economy", "trade", "market", "industry", "gdp", "inflation", "company", "stock", "export"],
  "기후·환경": ["climate", "environment", "emissions", "carbon", "warming", "wildfire", "pollution"],
  "과학·기술": ["science", "research", "technology", "ai", "study", "space", "nasa", "discovery"],
  "보건·사회": ["health", "hospital", "welfare", "disease", "vaccine", "social", "poverty"],
  "안보·인도주의": ["security", "conflict", "humanitarian", "refugee", "military", "attack", "war", "crisis"],
  "문화·교육": ["culture", "education", "heritage", "university", "art", "museum", "festival"],
};

// Word-boundary matching, not a bare substring check — a naive
// `.includes("ai")` previously matched "aid" inside "Aid Workers",
// misclassifying a humanitarian-affairs headline as 과학·기술 purely
// because "ai" is a substring of "aid". \b doesn't understand Unicode
// word boundaries perfectly, but every keyword here is plain ASCII, so
// it's reliable for this list.
function classifyByKeywords(title: string): NewCategory | "미분류" {
  const lower = title.toLowerCase();
  for (const category of NEW_CATEGORIES) {
    if (
      CATEGORY_KEYWORDS[category].some((keyword) =>
        new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(lower),
      )
    ) {
      return category;
    }
  }
  return "미분류";
}

// No body text exists to summarize — this is a plain, factual
// restatement of the title + metadata, never an invented/expanded
// description. Intentionally the least "summary-like" option available,
// since fabricating detail here would violate "추측·논평·새로운 사실을
// 추가하지 않는다".
function fallbackSummary(input: ClassificationInput): string {
  const date = input.publishedAt.slice(0, 10);
  return `${input.title} (${input.sourceName}, ${date})`;
}

// ---------------------------------------------------------------------
// LLM path — metadata-only prompt, 3-line cap, explicit anti-fabrication
// and anti-copying instructions. Returns null (never throws) on any
// failure, same fail-open contract as generate-trend-with-llm.ts.
// ---------------------------------------------------------------------
const OPENAI_CHAT_COMPLETIONS_ENDPOINT = "https://api.openai.com/v1/chat/completions";
const MODEL = "gpt-4o-mini";
const REQUEST_TIMEOUT_MS = 20_000;

const SYSTEM_PROMPT = `당신은 CATCHY 뉴스 분류·요약 테스트용 어시스턴트입니다.
주어진 기사의 "제목/출처/발행일" 메타데이터만 보고 작업합니다 — 본문은 제공되지 않습니다.

규칙:
1. 아래 7개 카테고리 중 하나로 분류하거나, 어디에도 명확히 속하지 않으면 "미분류"를 선택하세요: 국제정치·외교, 경제·산업, 기후·환경, 과학·기술, 보건·사회, 안보·인도주의, 문화·교육.
2. 제목만으로 분류가 애매하면 반드시 "미분류"를 선택하세요 — 추측으로 7개 중 하나에 억지로 넣지 마세요.
3. summary는 한국어 3줄 이내의 사실 중심 요약이어야 합니다. 제목에 없는 세부사항(수치, 인용문, 배경)을 지어내지 마세요 — 본문이 없으므로 제목과 출처/날짜에서 확인 가능한 사실만 쓰세요.
4. 원문 제목의 문장을 그대로 복사하거나 어순만 바꾸지 말고, 당신의 문장으로 새로 쓰세요.
5. 추측·논평·의견을 추가하지 마세요. 원문을 대체할 정도로 상세하게 쓰지 마세요 — 3줄 이내, 제목 수준의 정보량만 담으세요.
6. 다른 설명 없이 JSON 객체만 출력하세요: {"category": "...", "summary": "..."}`;

function buildUserPrompt(input: ClassificationInput): string {
  return `제목: ${input.title}\n출처: ${input.sourceName}\n발행일: ${input.publishedAt}`;
}

async function callOpenAi(input: ClassificationInput): Promise<ClassificationResult | null> {
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
        temperature: 0.3,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildUserPrompt(input) },
        ],
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    console.error("[local-test/classify] request failed", error);
    return null;
  }

  if (!response.ok) {
    console.error(`[local-test/classify] HTTP ${response.status}`);
    return null;
  }

  let payload: { choices?: Array<{ message?: { content?: string } }> };
  try {
    payload = await response.json();
  } catch {
    return null;
  }

  const content = payload.choices?.[0]?.message?.content;
  if (!content) return null;

  let raw: { category?: unknown; summary?: unknown };
  try {
    raw = JSON.parse(content);
  } catch {
    return null;
  }

  const category =
    typeof raw.category === "string" &&
    (NEW_CATEGORIES as string[]).includes(raw.category)
      ? (raw.category as NewCategory)
      : "미분류";
  const summary = typeof raw.summary === "string" && raw.summary.trim() ? raw.summary.trim() : fallbackSummary(input);

  return { category, summary, usedLlm: true };
}

export async function classifyAndSummarize(input: ClassificationInput): Promise<ClassificationResult> {
  const llmResult = await callOpenAi(input);
  if (llmResult) return llmResult;

  return {
    category: classifyByKeywords(input.title),
    summary: fallbackSummary(input),
    usedLlm: false,
  };
}
