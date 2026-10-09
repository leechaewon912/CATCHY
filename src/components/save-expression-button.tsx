"use client";

import type { MouseEvent } from "react";

import { useBookmarks } from "@/components/bookmarks-provider";
import { BookmarkIcon } from "@/components/icons";
import type { Expression } from "@/lib/mock-data";

export function SaveExpressionButton({
  expression,
  trendTitle,
  variant = "pill",
}: {
  expression: Expression;
  trendTitle: string;
  variant?: "pill" | "icon";
}) {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const saved = isBookmarked(expression.id);

  // ExpressionCard wraps this in a <Link> (the home carousel card),
  // while ExpressionDetailCard doesn't (the trend detail page) — stop
  // propagation/default unconditionally so toggling a bookmark never
  // triggers the enclosing card's navigation; it's a no-op harmless when
  // there's no enclosing link.
  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    toggleBookmark({
      id: expression.id,
      phrase: expression.phrase,
      meaning: expression.meaningKo,
      example: expression.exampleEn,
      exampleTranslation: expression.exampleKo,
      trendId: expression.trendId,
      trendTitle,
      savedAt: new Date().toISOString(),
    });
  }

  if (variant === "icon") {
    return (
      <button
        type="button"
        aria-pressed={saved}
        aria-label={saved ? "저장 취소" : "표현 저장"}
        onClick={handleClick}
        className={[
          "flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-obsidian",
          saved
            ? "border-obsidian bg-obsidian text-snow"
            : "border-cloud text-fog hover:border-ash hover:text-graphite",
        ].join(" ")}
      >
        <BookmarkIcon className={`h-4 w-4 ${saved ? "fill-snow" : "fill-none"}`} />
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? `${expression.phrase} 저장 취소` : `${expression.phrase} 표현 저장`}
      onClick={handleClick}
      className={[
        "flex shrink-0 cursor-pointer items-center gap-1.5 rounded-pills border px-3.5 py-2 text-[12px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-obsidian",
        saved
          ? "border-obsidian bg-obsidian text-snow"
          : "border-cloud text-fog hover:border-ash hover:text-graphite",
      ].join(" ")}
    >
      <BookmarkIcon className={`h-3.5 w-3.5 ${saved ? "fill-snow" : "fill-none"}`} />
      {saved ? "저장됨" : "저장"}
    </button>
  );
}
