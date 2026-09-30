"use client";

import { useBookmarks } from "@/components/bookmarks-provider";
import { BookmarkIcon } from "@/components/icons";
import type { Expression } from "@/lib/mock-data";

export function SaveExpressionButton({
  expression,
  trendTitle,
}: {
  expression: Expression;
  trendTitle: string;
}) {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const saved = isBookmarked(expression.id);

  function handleClick() {
    toggleBookmark({
      id: expression.id,
      phrase: expression.phrase,
      meaning: expression.meaning,
      example: expression.example,
      exampleTranslation: expression.exampleTranslation,
      trendId: expression.trendId,
      trendTitle,
      savedAt: new Date().toISOString(),
    });
  }

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? `${expression.phrase} 저장 취소` : `${expression.phrase} 표현 저장`}
      onClick={handleClick}
      className={[
        "flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-300",
        saved
          ? "border-lime-300 bg-lime-300/10 text-lime-300"
          : "border-white/15 text-white/60 hover:border-white/40 hover:text-white",
      ].join(" ")}
    >
      <BookmarkIcon className={`h-3.5 w-3.5 ${saved ? "fill-lime-300" : "fill-none"}`} />
      {saved ? "저장됨" : "저장"}
    </button>
  );
}
