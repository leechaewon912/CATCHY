import "server-only";

import { euPressCornerAdapter } from "@/lib/server/sources/eu-presscorner-adapter";
import { classifyAndSummarize } from "@/lib/server/local-test/classify-and-summarize";
import { extractKnownPhrases } from "@/lib/server/local-test/phrase-glossary";
import { inferRegionTags, NEW_CATEGORY_IMAGE, type NewCategory } from "@/lib/server/local-test/new-category-types";
import { KNOWN_TITLE_TRANSLATIONS } from "@/lib/server/local-test/known-title-translations";

// LOCAL TEST ONLY — not imported by any production route/page/DB code,
// never writes to Supabase. Builds a Trend-shaped object (matching the
// real app's src/lib/mock-data.ts Trend/Expression/TrendSource field
// names so the real trend/[id]/page.tsx markup can render it unchanged)
// entirely from one real EU Press Corner article's title/url/domain/
// publishedAt. No body text, RSS description, image, or thumbnail is
// ever fetched for this — see sources/eu-presscorner-adapter.ts.
export type LocalPreviewExpression = {
  id: string;
  trendId: string;
  category: NewCategory;
  phrase: string;
  meaningKo: string;
  nuance: string;
  usageSituation: string;
  exampleEn: string;
  exampleKo: string;
  comparison?: { phrase: string; nuanceDiff: string };
};

export type LocalPreviewTrend = {
  id: string;
  title: string;
  titleKo: string | null;
  category: NewCategory | "미분류";
  scope: "global";
  regionTags: string[];
  summary: string;
  englishSummary: string;
  koreanSummary: string;
  whyTrending: string;
  sources: Array<{
    sourceName: string;
    sourceType: "official";
    originalTitle: string;
    originalUrl: string;
    publishedAt: string;
  }>;
  expressions: LocalPreviewExpression[];
  expressionsAvailable: boolean;
  imagePath: string | null;
};

// Purely mechanical: wraps the real title's own words into one sentence
// instead of a bare headline fragment. Adds zero facts beyond what the
// title already states — no invented numbers, quotes, or outcomes.
function buildEnglishSummary(title: string): string {
  const trimmed = title.trim().replace(/\.+$/, "");
  return `${trimmed}.`;
}

// No translation attempted here (risking a wrong/invented nuance without
// an LLM) — states plainly, in Korean, what the English title says and
// where it's from, which is itself a fully verifiable fact.
function buildKoreanSummary(title: string, sourceName: string, publishedAt: string): string {
  const date = publishedAt.slice(0, 10);
  return `원문 제목: "${title}" (${sourceName}, ${date} 발표) — 로컬 테스트에서는 번역을 생성하지 않고 원문 제목을 그대로 밝힙니다.`;
}

export async function buildEuPreviewTrend(): Promise<LocalPreviewTrend | null> {
  // euPressCornerAdapter ignores its category argument (one shared feed,
  // see sources/eu-presscorner-adapter.ts) — cast only to satisfy its
  // production-Category-typed signature.
  const articles = await euPressCornerAdapter.fetchArticlesForCategory(
    "국제정치·외교" as unknown as Parameters<typeof euPressCornerAdapter.fetchArticlesForCategory>[0],
  );
  if (articles.length === 0) return null;

  // Scans real articles in feed order (not cherry-picked by content) for
  // the first one that both (a) classifies into one of the 7 real
  // categories by title keywords and (b) has at least 3 title phrases
  // this local-only glossary recognizes — so the demo can show a filled
  // expressions section rather than always landing on the disabled
  // state. If none qualify, the first article is used and the
  // expressions section is honestly marked unavailable (see
  // expressionsAvailable below) rather than forcing a worse match.
  let chosen: (typeof articles)[number] | null = null;
  let chosenCategory: NewCategory | "미분류" = "미분류";
  let chosenPhrases: ReturnType<typeof extractKnownPhrases> = [];

  for (const article of articles) {
    const { category } = await classifyAndSummarize({
      title: article.title,
      sourceName: article.domain,
      publishedAt: article.publishedAt,
    });
    const phrases = extractKnownPhrases(article.title, 3);
    if (category !== "미분류" && phrases.length >= 3) {
      chosen = article;
      chosenCategory = category;
      chosenPhrases = phrases;
      break;
    }
    if (!chosen) {
      // Keep the first article as a fallback in case nothing fully
      // qualifies, but keep scanning for a better one.
      chosen = article;
      chosenCategory = category;
      chosenPhrases = phrases;
    }
  }

  if (!chosen) return null;

  const trendId = "local-test-eu-preview";
  const regionTags = inferRegionTags(chosen.title, "eu-press-corner");
  const knownTranslation = KNOWN_TITLE_TRANSLATIONS[chosen.title];
  const expressions: LocalPreviewExpression[] = chosenPhrases.map((g, i) => ({
    id: `${trendId}-expr-${i}`,
    trendId,
    category: chosenCategory === "미분류" ? ("문화·교육" as NewCategory) : chosenCategory,
    phrase: g.phrase,
    meaningKo: g.meaningKo,
    nuance: g.nuance,
    usageSituation: g.usageSituation,
    exampleEn: g.exampleEn,
    exampleKo: g.exampleKo,
    comparison: g.comparisonPhrase
      ? { phrase: g.comparisonPhrase, nuanceDiff: g.comparisonNuanceDiff! }
      : undefined,
  }));

  return {
    id: trendId,
    title: chosen.title,
    titleKo: knownTranslation?.titleKo ?? null,
    category: chosenCategory,
    scope: "global",
    regionTags,
    summary: `${chosen.domain}에 게시된 공식 발표 — 로컬 테스트용 메타데이터 기반 콘텐츠입니다.`,
    englishSummary: knownTranslation?.englishSummary ?? buildEnglishSummary(chosen.title),
    koreanSummary: knownTranslation?.koreanSummary ?? buildKoreanSummary(chosen.title, chosen.domain, chosen.publishedAt),
    whyTrending: "공식 기관이 직접 발표한 내용이에요.",
    sources: [
      {
        sourceName: chosen.domain,
        sourceType: "official",
        originalTitle: chosen.title,
        originalUrl: chosen.url,
        publishedAt: chosen.publishedAt,
      },
    ],
    expressions,
    expressionsAvailable: expressions.length >= 3,
    imagePath: chosenCategory === "미분류" ? null : NEW_CATEGORY_IMAGE[chosenCategory],
  };
}
