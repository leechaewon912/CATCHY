"use client";

import Link from "next/link";

import { useBookmarks } from "@/components/bookmarks-provider";
import { useFeedback } from "@/components/feedback-provider";
import { BookmarkIcon } from "@/components/icons";

const NAV_ITEMS = [
  { label: "트렌드 피드", href: "/" },
  { label: "퀴즈", href: "/quiz" },
];

export function SiteHeader() {
  const { bookmarks } = useBookmarks();
  const bookmarkCount = bookmarks.length;
  const { openFeedback } = useFeedback();

  return (
    <header className="sticky top-0 z-50">
      {/* Backdrop lives on its own layer, behind every header child
          (logo, nav links, Feedback button, Bookmark link) instead of
          being painted directly on <header>. Safari composites
          `backdrop-filter: blur()` per-layer, and a child that gets
          promoted to its own layer (the Feedback button does, via its
          `transition-colors` + border + radius) sitting *inside* a
          blurred element can show a visible seam around just that
          child on iOS — splitting the blur into this separate
          aria-hidden div means no interactive child ever shares a
          layer with the blur, so there's nothing for Safari to
          composite inconsistently. */}
      <div className="absolute inset-0 bg-snow/90 backdrop-blur" aria-hidden />
      <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <div className="flex min-w-0 items-center gap-4 sm:gap-8">
          <Link
            href="/"
            className="shrink-0 rounded text-[20px] font-semibold tracking-tight text-obsidian transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-obsidian"
          >
            CATCHY<span className="text-ember">.</span>
          </Link>
          <nav className="flex items-center gap-3 sm:gap-6">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="shrink-0 cursor-pointer rounded text-[13px] font-normal text-fog transition-colors hover:text-graphite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-obsidian sm:text-[14px]"
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
            className="inline-flex h-9 shrink-0 cursor-pointer items-center justify-center rounded-[12px] border border-[#D1D5DB] bg-white px-4 text-[13px] font-normal text-[#111111] transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-paper focus-visible:ring-obsidian sm:text-[14px] [@media(hover:hover)]:hover:border-[#111111] [@media(hover:hover)]:hover:bg-[#111111] [@media(hover:hover)]:hover:text-white"
          >
            Feedback
          </button>
          <Link
            href="/bookmarks"
            aria-label="저장한 표현 보기"
            className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-cloud text-fog transition-colors hover:border-ash hover:text-graphite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-obsidian"
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
