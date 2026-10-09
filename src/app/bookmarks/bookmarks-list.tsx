"use client";

import Link from "next/link";

import { useBookmarks } from "@/components/bookmarks-provider";
import { ArrowUpRightIcon } from "@/components/icons";
import { highlightPhraseInText } from "@/lib/highlight-expressions";

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
      <div className="surface-card flex flex-col items-center gap-4 p-10 text-center sm:p-14">
        <p className="text-[18px] font-semibold text-obsidian">
          아직 저장한 표현이 없어요
        </p>
        <p className="max-w-sm text-[14px] leading-relaxed text-fog">
          트렌드 상세 페이지에서 마음에 드는 영어 표현의 저장 버튼을 눌러
          여기에 모아보세요.
        </p>
        <Link href="/" className="btn-primary mt-2">
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
          className="surface-card p-6 sm:p-8"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[32px] font-semibold leading-tight text-obsidian">
                &ldquo;{bookmark.phrase}&rdquo;
              </p>
              <p className="mt-2 text-[16px] font-medium text-graphite">
                {bookmark.meaning}
              </p>
            </div>
            <button
              type="button"
              onClick={() => removeBookmark(bookmark.id)}
              className="shrink-0 cursor-pointer rounded-pills border border-cloud px-3.5 py-2 text-[12px] font-medium text-fog transition-colors hover:border-iron hover:text-graphite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-obsidian"
            >
              삭제
            </button>
          </div>

          <div className="my-5 h-px bg-cloud" />

          <div className="surface-card-subtle p-4">
            <span className="mb-2 block text-[12px] text-fog">
              예문
            </span>
            <p className="font-medium text-graphite">
              {highlightPhraseInText(bookmark.example, bookmark.phrase)}
            </p>
            <p className="mt-1 text-fog">{bookmark.exampleTranslation}</p>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-[12px] text-fog">
            <Link
              href={`/trend/${bookmark.trendId}`}
              className="group inline-flex cursor-pointer items-center gap-1 text-steel transition-colors hover:text-obsidian focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-obsidian"
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
