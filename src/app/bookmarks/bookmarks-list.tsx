"use client";

import Link from "next/link";

import { useBookmarks } from "@/components/bookmarks-provider";
import { ArrowUpRightIcon } from "@/components/icons";

function formatSavedDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function BookmarksList() {
  const { bookmarks, removeBookmark } = useBookmarks();

  if (bookmarks.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center sm:p-14">
        <p className="text-lg font-bold text-white">
          아직 저장한 표현이 없어요
        </p>
        <p className="max-w-sm text-sm leading-relaxed text-white/50">
          트렌드 상세 페이지에서 마음에 드는 영어 표현의 저장 버튼을 눌러
          여기에 모아보세요.
        </p>
        <Link
          href="/"
          className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-full bg-lime-300 px-6 py-3 text-sm font-bold text-black transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0b] focus-visible:ring-lime-300"
        >
          트렌드 피드로 가기
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {bookmarks.map((bookmark) => (
        <article
          key={bookmark.id}
          className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-2xl font-black leading-tight text-white sm:text-3xl">
                &ldquo;{bookmark.phrase}&rdquo;
              </p>
              <p className="mt-2 text-base font-semibold text-lime-300">
                {bookmark.meaning}
              </p>
            </div>
            <button
              type="button"
              onClick={() => removeBookmark(bookmark.id)}
              className="shrink-0 cursor-pointer rounded-full border border-white/15 px-3.5 py-2 text-xs font-bold text-white/60 transition-colors hover:border-rose-400 hover:text-rose-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-300"
            >
              삭제
            </button>
          </div>

          <div className="my-5 h-px bg-white/10" />

          <div className="rounded-xl bg-white/[0.04] p-4">
            <span className="mb-2 block font-mono text-[11px] uppercase tracking-widest text-white/35">
              예문
            </span>
            <p className="font-medium text-white">{bookmark.example}</p>
            <p className="mt-1 text-white/50">{bookmark.exampleTranslation}</p>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 font-mono text-[11px] uppercase tracking-widest text-white/40">
            <Link
              href={`/trend/${bookmark.trendId}`}
              className="group inline-flex cursor-pointer items-center gap-1 normal-case text-white/60 transition-colors hover:text-lime-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-300"
            >
              {bookmark.trendTitle}
              <ArrowUpRightIcon className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            <span>{formatSavedDate(bookmark.savedAt)} 저장</span>
          </div>
        </article>
      ))}
    </div>
  );
}
