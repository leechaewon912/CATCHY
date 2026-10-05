import type { ReactNode } from "react";

import type { Expression } from "@/lib/mock-data";

// Greedy and length-bounded: phrases like "it's giving [x]" have nothing
// after the wildcard, so a non-greedy `+?` would match only one character.
const WILDCARD_PATTERN = "[^.,!?;:\"']{1,40}";

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function phraseToRegexSource(phrase: string): string {
  return phrase.split("[x]").map(escapeRegExp).join(WILDCARD_PATTERN);
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
          className="cursor-pointer rounded px-0.5 font-semibold text-lime-300 underline decoration-lime-300/40 underline-offset-4 transition-colors hover:bg-lime-300/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-300"
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
