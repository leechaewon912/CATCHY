// LOCAL TEST ONLY — not imported by any production route/page/DB code.
// Second category scheme for the Google Trends local test (distinct from
// google-trends-types.ts's 5-category "preferred" scheme from the
// earlier run) — reclassifies the SAME frozen 16-item snapshot
// (google-trends-snapshot.ts) more permissively: almost everything gets
// a category, "기타" is a real bucket (not an exclusion), and only
// fragments/duplicates/obvious spam are dropped.
export type TrendCategoryV2 =
  | "국제·사회"
  | "경제·금융"
  | "기술·과학"
  | "엔터테인먼트·문화"
  | "스포츠"
  | "라이프스타일·인터넷"
  | "기타";

export const TREND_CATEGORIES_V2: TrendCategoryV2[] = [
  "국제·사회",
  "경제·금융",
  "기술·과학",
  "엔터테인먼트·문화",
  "스포츠",
  "라이프스타일·인터넷",
  "기타",
];

// Fixed 1:1 mapping onto existing mock assets only — no new images.
export const TREND_CATEGORY_V2_IMAGE: Record<TrendCategoryV2, string> = {
  "국제·사회": "/images/mock/global-01.jpg",
  "경제·금융": "/images/mock/tech-02.jpg",
  "기술·과학": "/images/mock/tech-01.jpg",
  "엔터테인먼트·문화": "/images/mock/film-02.jpg",
  스포츠: "/images/mock/sports-01.jpg",
  "라이프스타일·인터넷": "/images/mock/meme-01.jpg",
  기타: "/images/mock/lifestyle-02.jpg",
};

// A short, human-readable label for *what kind of thing* the term is —
// recorded alongside category (per this test's explicit `contentType`
// requirement) so the classification reasoning is visible, not just the
// end category.
export type ContentType =
  | "기업/주식 종목"
  | "스포츠 선수/이적"
  | "스포츠 정보 질의"
  | "정치인"
  | "쇼핑 이벤트"
  | "날씨 검색어"
  | "지역명"
  | "복권 관련 질의"
  | "온라인 크리에이터/스트리머"
  | "불확실";

type KeywordRule = { keyword: string; category: TrendCategoryV2; contentType: ContentType };

// Checked in order — first match wins. Word-boundary for ASCII keywords
// (same "ai" vs "aid" fix as the rest of this project's local-test
// classifiers), plain substring for non-ASCII (e.g. Arabic "الطقس").
const RULES: KeywordRule[] = [
  { keyword: "stock", category: "경제·금융", contentType: "기업/주식 종목" },
  { keyword: "stocks", category: "경제·금융", contentType: "기업/주식 종목" },
  { keyword: "nasdaq", category: "경제·금융", contentType: "기업/주식 종목" },
  { keyword: "ipo", category: "경제·금융", contentType: "기업/주식 종목" },
  { keyword: "black friday", category: "경제·금융", contentType: "쇼핑 이벤트" },
  { keyword: "cyber monday", category: "경제·금융", contentType: "쇼핑 이벤트" },

  { keyword: "trade rumors", category: "스포츠", contentType: "스포츠 선수/이적" },
  { keyword: "trade rumor", category: "스포츠", contentType: "스포츠 선수/이적" },
  { keyword: "nfl", category: "스포츠", contentType: "스포츠 정보 질의" },
  { keyword: "nba", category: "스포츠", contentType: "스포츠 정보 질의" },
  { keyword: "mlb", category: "스포츠", contentType: "스포츠 정보 질의" },
  { keyword: "start em sit em", category: "스포츠", contentType: "스포츠 정보 질의" },

  { keyword: "weather", category: "기타", contentType: "날씨 검색어" },
  { keyword: "forecast", category: "기타", contentType: "날씨 검색어" },
  { keyword: "الطقس", category: "기타", contentType: "날씨 검색어" },

  { keyword: "powerball", category: "기타", contentType: "복권 관련 질의" },
  { keyword: "lottery", category: "기타", contentType: "복권 관련 질의" },
  { keyword: "mega millions", category: "기타", contentType: "복권 관련 질의" },

  { keyword: "senator", category: "국제·사회", contentType: "정치인" },
  { keyword: "congress", category: "국제·사회", contentType: "정치인" },
  { keyword: "representative", category: "국제·사회", contentType: "정치인" },
  { keyword: "governor", category: "국제·사회", contentType: "정치인" },

  { keyword: "streamer", category: "라이프스타일·인터넷", contentType: "온라인 크리에이터/스트리머" },
  { keyword: "influencer", category: "라이프스타일·인터넷", contentType: "온라인 크리에이터/스트리머" },
  { keyword: "tiktok", category: "라이프스타일·인터넷", contentType: "온라인 크리에이터/스트리머" },
  { keyword: "twitch", category: "라이프스타일·인터넷", contentType: "온라인 크리에이터/스트리머" },

  { keyword: "ai", category: "기술·과학", contentType: "불확실" },
  { keyword: "nasa", category: "기술·과학", contentType: "불확실" },
  { keyword: "app launch", category: "기술·과학", contentType: "불확실" },

  { keyword: "movie", category: "엔터테인먼트·문화", contentType: "불확실" },
  { keyword: "album", category: "엔터테인먼트·문화", contentType: "불확실" },
  { keyword: "actor", category: "엔터테인먼트·문화", contentType: "불확실" },
];

// Specific real-world people recognized by name only (no keyword in the
// term itself hints at what they do) — a tiny hand-curated allowlist,
// not a general entity-recognition system. Each entry states only a
// well-known, stable role/fact, not time-sensitive claims.
const KNOWN_PEOPLE: Record<string, { category: TrendCategoryV2; contentType: ContentType }> = {
  "hasan piker": { category: "라이프스타일·인터넷", contentType: "온라인 크리에이터/스트리머" },
  "ashley hinson": { category: "국제·사회", contentType: "정치인" },
  "ronald acuña jr.": { category: "스포츠", contentType: "스포츠 선수/이적" },
  "alexander zverev": { category: "스포츠", contentType: "스포츠 선수/이적" },
};

export type ClassificationV2 =
  | { kind: "classified"; category: TrendCategoryV2; contentType: ContentType }
  | { kind: "excluded"; reason: string };

// Very small/degenerate queries (single short word, or a term that's
// almost entirely non-letters) are dropped as "단순 검색어 조각" — not
// by topic, only by shape. Obvious duplicates are handled by the
// caller's separate dedup step, not here.
function isFragment(term: string): boolean {
  const letters = term.replace(/[^\p{L}]/gu, "");
  return letters.length < 3;
}

export function classifyTrendV2(term: string): ClassificationV2 {
  if (isFragment(term)) {
    return { kind: "excluded", reason: "단순 검색어 조각(의미 있는 글자 수 부족)" };
  }

  const lower = term.toLowerCase();

  for (const [person, info] of Object.entries(KNOWN_PEOPLE)) {
    if (lower.includes(person)) {
      return { kind: "classified", category: info.category, contentType: info.contentType };
    }
  }

  for (const rule of RULES) {
    const isAscii = /^[\x00-\x7F]*$/.test(rule.keyword);
    const escaped = rule.keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = isAscii ? new RegExp(`\\b${escaped}\\b`) : new RegExp(escaped);
    if (re.test(lower)) {
      return { kind: "classified", category: rule.category, contentType: rule.contentType };
    }
  }

  // Per this test's explicit instruction: weather/location/lottery/
  // unclassifiable all land in "기타" rather than being excluded — a
  // term that matched nothing above but isn't a fragment/duplicate/spam
  // still gets content, just filed as "기타" with contentType "불확실".
  return { kind: "classified", category: "기타", contentType: "불확실" };
}
