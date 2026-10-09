import Link from "next/link";
import type { Metadata } from "next";

import { BookmarksList } from "@/app/bookmarks/bookmarks-list";
import { ArrowLeftIcon } from "@/components/icons";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "저장한 표현 — CATCHY",
  description: "트렌드에서 저장한 영어 표현을 한곳에서 모아보세요.",
};

export default function BookmarksPage() {
  return (
    <div className="flex min-h-full flex-col bg-paper">
      <SiteHeader />

      <main className="flex-1">
        <section className="mx-auto max-w-4xl px-5 pt-8 pb-20 sm:px-8 sm:pt-12">
          <Link
            href="/"
            className="mb-6 inline-flex cursor-pointer items-center gap-1.5 rounded text-[14px] font-normal text-fog transition-colors hover:text-graphite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-obsidian"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            홈으로 돌아가기
          </Link>

          <p className="text-[12px] font-medium text-ember">
            내 학습 노트
          </p>
          <h1 className="mt-2 text-[32px] font-semibold leading-tight text-obsidian sm:text-[40px]">
            저장한 표현
          </h1>

          <div className="mt-8">
            <BookmarksList />
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
