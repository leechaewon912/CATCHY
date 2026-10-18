import type { PreferredCategory } from "@/lib/server/local-test/google-trends-types";

// LOCAL TEST ONLY — not imported by any production route/page/DB code.
// Keyword-only classification (no LLM, no external lookup) — word-
// boundary matching, not bare substring (a naive includes() previously
// mis-tagged "aid" as "ai" in an earlier local test; this project's
// fix — see classify-and-summarize.ts — is reused here).

// Checked BEFORE the preferred-category allowlist, and wins on any
// match: explicitly excluded topics per this test's brief. Each list
// errs toward precision (specific terms) over recall, since a false
// negative here (an excluded topic that slips through) is worse than a
// false positive (a usable topic that gets excluded) for this use case.
const EXCLUDE_KEYWORDS = [
  // politics & elections
  "senator", "congress", "congressman", "congresswoman", "representative",
  "governor", "election", "president", "white house", "parliament",
  "campaign", "ballot", "impeachment",
  // crime & accidents
  "shooting", "stabbing", "homicide", "murder", "arrested", "crash",
  "explosion", "fire department", "missing person", "robbery", "assault",
  // weather & traffic
  "weather", "forecast", "storm", "hurricane", "traffic", "flight delay",
  "closure", "الطقس",
  // sports results / trade rumors
  "score", "scores", "final score", "trade rumors", "trade rumor",
  "standings", "playoff", "vs.", "box score",
  // stock & economic indicators
  "stock", "stocks", "nasdaq", "nyse", "dow jones", "shares", "ipo",
  "earnings report", "interest rate", "inflation rate", "gdp",
  // unconfirmed rumor language
  "rumor", "rumors", "alleged", "allegedly",
];

// Preferred-category allowlist — a term only becomes a candidate if it
// hits one of these AND no exclude keyword matched. Deliberately small
// and specific rather than broad, so the honest outcome for an
// unmatched term is exclusion (see classifyPreferredCategory's return),
// not a forced guess.
const CATEGORY_KEYWORDS: Record<PreferredCategory, string[]> = {
  Entertainment: [
    "album", "movie", "film", "trailer", "premiere", "actor", "actress",
    "singer", "rapper", "concert", "tour", "season finale", "episode",
    "series", "celebrity", "red carpet", "awards",
  ],
  "Fashion & Beauty": [
    "fashion week", "runway", "collection", "makeup", "skincare",
    "beauty brand", "lipstick", "perfume", "sneakers", "streetwear",
    "designer",
  ],
  "Internet Culture": [
    "meme", "viral", "tiktok", "trend challenge", "hashtag", "going viral",
    "internet", "reddit", "twitch", "streamer", "influencer",
  ],
  Lifestyle: [
    "black friday", "cyber monday", "holiday shopping", "dating app",
    "relationship", "wellness", "self-care", "home decor", "recipe",
    "travel deal",
  ],
  Technology: [
    "ai", "chatbot", "app launch", "smartphone", "gadget", "update",
    "software", "startup", "robot", "chip", "vr", "ar glasses",
  ],
};

function matchesAny(lower: string, keywords: string[]): string | null {
  for (const keyword of keywords) {
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // Non-ASCII keywords (e.g. "الطقس") can't use \b reliably, so those
    // fall back to a plain substring check; ASCII keywords use a real
    // word boundary so "ai" doesn't match inside "said"/"chair" etc.
    const isAscii = /^[\x00-\x7F]*$/.test(keyword);
    const re = isAscii ? new RegExp(`\\b${escaped}\\b`) : new RegExp(escaped);
    if (re.test(lower)) return keyword;
  }
  return null;
}

export type ClassifiedTrend = {
  category: PreferredCategory;
  matchedKeyword: string;
};

// Returns null for anything excluded OR not matching any preferred
// category — callers must drop the term rather than guess a category
// for it (see build-google-trends-content.ts).
export function classifyPreferredCategory(term: string): ClassifiedTrend | null {
  const lower = term.toLowerCase();

  const excludeHit = matchesAny(lower, EXCLUDE_KEYWORDS);
  if (excludeHit) return null;

  for (const category of Object.keys(CATEGORY_KEYWORDS) as PreferredCategory[]) {
    const hit = matchesAny(lower, CATEGORY_KEYWORDS[category]);
    if (hit) return { category, matchedKeyword: hit };
  }

  return null;
}
