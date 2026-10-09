import type { ReactNode } from "react";

import type { Expression } from "@/lib/mock-data";

// Greedy and length-bounded: phrases like "it's giving [something]" have
// nothing after the wildcard, so a non-greedy `+?` would match only one
// character. Apostrophes are allowed through (not excluded like other
// punctuation) since the wildcard often lands on a possessive — "the
// country's streaming industry" — not just a straight noun phrase.
const WILDCARD_PATTERN = '[^.,!?;:"]{1,40}';

// Phrases use context-appropriate placeholders — [something]/[someone]/
// [somewhere] — instead of a single generic [x].
const PLACEHOLDER_PATTERN = /\[(?:something|someone|somewhere)\]/;

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Irregular past-tense forms don't share a prefix with their base form
// at all ("take" vs "took"), unlike regular verbs ("climb" vs
// "climbed"/"climbing") — those need to be matched explicitly, or
// natural example sentences silently fail to highlight. Covers every
// irregular verb used in this app's phrase bank (mock-data.ts +
// generate-trend-draft.ts).
const IRREGULAR_VERB_FORMS: Record<string, string> = {
  take: "take|takes|taking|took|taken",
  give: "give|gives|giving|gave|given",
  break: "break|breaks|breaking|broke|broken",
  steal: "steal|steals|stealing|stole|stolen",
  come: "come|comes|coming|came",
  keep: "keep|keeps|keeping|kept",
  blow: "blow|blows|blowing|blew|blown",
  make: "make|makes|making|made",
  catch: "catch|catches|catching|caught",
  go: "go|goes|going|went|gone",
  have: "have|has|having|had",
  shake: "shake|shakes|shaking|shook|shaken",
  see: "see|sees|seeing|saw|seen",
  // Not irregular, but "carry" -> "carries" is a y-to-ies spelling
  // change, so plain suffix matching (carry\w*) doesn't cover it either
  // — carr[y] vs carr[ies] diverge at that last letter, not just add one.
  carry: "carry|carries|carrying|carried",
};

// A regular verb/noun matching only its exact base spelling still fails
// against a phrase with 2+ words: "climb the charts" as a literal,
// space-joined pattern can't match "climbing the charts", because the
// "ing" inserted after "climb" breaks the fixed "climb" + " " + "the"
// adjacency the old code required. Appending \w* lets each word absorb
// a suffix (-s/-ed/-ing/etc.) before the next literal word has to match.
function wordToRegexSource(word: string): string {
  if (word === "") return "";
  const forms = IRREGULAR_VERB_FORMS[word.toLowerCase()];
  const base = forms ? `(?:${forms})` : escapeRegExp(word);
  return `${base}\\w*`;
}

// Splits a literal (non-wildcard) chunk into words so each one can be
// turned into its own suffix-tolerant (or irregular-verb-aware) pattern
// instead of requiring the whole chunk to match completely literally.
function segmentToRegexSource(segment: string): string {
  return segment
    .split(/(\s+)/)
    .map((token) => (token.trim() === "" ? token : wordToRegexSource(token)))
    .join("");
}

function phraseToRegexSource(phrase: string): string {
  return phrase
    .split(PLACEHOLDER_PATTERN)
    .map(segmentToRegexSource)
    .join(WILDCARD_PATTERN);
}

export function highlightExpressionsInText(
  text: string,
  expressions: Expression[],
): ReactNode[] {
  if (expressions.length === 0) return [text];

  const sorted = [...expressions].sort(
    (a, b) => b.phrase.length - a.phrase.length,
  );
  const combinedRegex = new RegExp(
    sorted.map((expression) => phraseToRegexSource(expression.phrase)).join("|"),
    "gi",
  );

  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;
  let match: RegExpExecArray | null;

  while ((match = combinedRegex.exec(text)) !== null) {
    const matchedText = match[0];

    if (matchedText.length === 0) {
      combinedRegex.lastIndex++;
      continue;
    }

    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const owner = sorted.find((expression) =>
      new RegExp(`^${phraseToRegexSource(expression.phrase)}$`, "i").test(
        matchedText,
      ),
    );

    nodes.push(
      owner ? (
        <a
          key={`highlight-${key++}`}
          href={`#${owner.id}`}
          className="cursor-pointer rounded px-0.5 font-medium text-ember underline decoration-ember/40 underline-offset-4 transition-colors hover:bg-ember/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember"
        >
          {matchedText}
        </a>
      ) : (
        matchedText
      ),
    );

    lastIndex = match.index + matchedText.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

// Highlights every occurrence of a single phrase inside its own example
// sentence (exampleEn/dailyExampleEn) — no link, since the phrase is
// already on the card it's rendered in.
export function highlightPhraseInText(text: string, phrase: string): ReactNode[] {
  const regex = new RegExp(phraseToRegexSource(phrase), "gi");

  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const matchedText = match[0];

    if (matchedText.length === 0) {
      regex.lastIndex++;
      continue;
    }

    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    nodes.push(
      <mark
        key={`phrase-highlight-${key++}`}
        className="rounded bg-ember/15 px-0.5 font-semibold text-ember"
      >
        {matchedText}
      </mark>,
    );

    lastIndex = match.index + matchedText.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}
