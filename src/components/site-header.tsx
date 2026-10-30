"use client";

import Link from "next/link";

import { useBookmarks } from "@/components/bookmarks-provider";
import { useFeedback } from "@/components/feedback-provider";
import { BookmarkIcon } from "@/components/icons";

const NAV_ITEMS = [
  { label: "홈", href: "/" },
  { label: "퀴즈", href: "/quiz" },
];

export function SiteHeader() {
  const { bookmarks } = useBookmarks();
  const bookmarkCount = bookmarks.length;
  const { openFeedback } = useFeedback();

  return (
    <header className="sticky top-0 z-50 bg-snow/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <div className="flex min-w-0 items-center gap-4 sm:gap-8">
          <Link
            href="/"
            className="shrink-0 rounded text-subheading font-semibold tracking-tight text-obsidian transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-obsidian"
          >
            CATCHY<span className="text-ember">.</span>
          </Link>
          <nav className="flex items-center gap-3 sm:gap-6">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="shrink-0 cursor-pointer rounded text-label font-normal text-fog transition-colors hover:text-graphite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-obsidian sm:text-body-sm"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={openFeedback}
            className="inline-flex h-9 shrink-0 cursor-pointer items-center justify-center rounded-[12px] border border-cloud px-4 text-label font-normal text-[#111111] transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-paper focus-visible:ring-obsidian sm:text-body-sm [@media(hover:hover)]:hover:border-[#111111] [@media(hover:hover)]:hover:bg-[#111111] [@media(hover:hover)]:hover:text-white"
          >
            Feedback
          </button>
          <Link
            href="/bookmarks"
            aria-label="저장한 표현 보기"
            className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-cloud text-fog transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-obsidian [@media(hover:hover)]:hover:border-[#111111] [@media(hover:hover)]:hover:bg-[#111111] [@media(hover:hover)]:hover:text-white"
          >
            <BookmarkIcon className="h-4 w-4" />
            {bookmarkCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-ember px-1 text-[10px] font-medium text-snow">
                {bookmarkCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
