"use client";

import Link from "next/link";

import { useBookmarks } from "@/components/bookmarks-provider";
import { BookmarkIcon } from "@/components/icons";

const NAV_ITEMS = [
  { label: "트렌드 피드", href: "/" },
  { label: "퀴즈", href: "/quiz" },
];

export function SiteHeader() {
  const { bookmarks } = useBookmarks();
  const bookmarkCount = bookmarks.length;

  return (
    <header className="sticky top-0 z-50 bg-snow/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="rounded text-[20px] font-semibold tracking-tight text-obsidian transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-obsidian"
          >
            CATCHY<span className="text-ember">.</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="rounded text-[14px] font-normal text-fog transition-colors hover:text-graphite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-obsidian"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
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
