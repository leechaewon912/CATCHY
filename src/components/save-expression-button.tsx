"use client";

import { useState } from "react";

import { BookmarkIcon } from "@/components/icons";

export function SaveExpressionButton({ phrase }: { phrase: string }) {
  const [isSaved, setIsSaved] = useState(false);

  return (
    <button
      type="button"
      aria-pressed={isSaved}
      aria-label={
        isSaved ? `${phrase} 저장 취소` : `${phrase} 표현 저장`
      }
      onClick={() => setIsSaved((prev) => !prev)}
      className={[
        "flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-300",
        isSaved
          ? "border-lime-300 bg-lime-300/10 text-lime-300"
          : "border-white/15 text-white/60 hover:border-white/40 hover:text-white",
      ].join(" ")}
    >
      <BookmarkIcon className={`h-3.5 w-3.5 ${isSaved ? "fill-lime-300" : "fill-none"}`} />
      {isSaved ? "저장됨" : "저장"}
    </button>
  );
}
