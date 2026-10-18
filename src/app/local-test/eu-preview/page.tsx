import Image from "next/image";

import { EnglishSummary } from "@/components/english-summary";
import { ExpressionDetailCard } from "@/components/expression-detail-card";
import { ArrowUpRightIcon } from "@/components/icons";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { buildEuPreviewTrend } from "@/lib/server/local-test/build-eu-preview-trend";
import type { Expression } from "@/lib/mock-data";

// LOCAL TEST ONLY — not linked from anywhere in the real app's nav, not
// used by any production route. Reuses the real trend detail page's
// actual components (EnglishSummary, ExpressionDetailCard, SiteHeader,
// SiteFooter) and the exact same Tailwind/globals.css classes the real
// /trend/[id] page uses, so this renders with identical fonts, colors,
// spacing, card shapes, and responsive behavior — only the data is
// different: built entirely from one real EU Press Corner article, with
// no Supabase read or write anywhere in this file's import graph (see
// build-eu-preview-trend.ts). RecordTrendView / FeedbackAutoTrigger /
// ExpressionSectionTracker (analytics/behavior side-effect wrappers with
// no visual output of their own) are intentionally omitted — the
// <main className="flex-1"> below is the same element
// FeedbackAutoTrigger would otherwise render.
export default async function LocalEuPreviewPage() {
  const trend = await buildEuPreviewTrend();

  if (!trend) {
    return (
      <div className="flex min-h-full flex-col bg-paper">
        <SiteHeader />
        <main className="mx-auto max-w-4xl px-5 py-20 text-center sm:px-8">
          <p className="text-[18px] text-fog">
            EU Press Corner에서 기사를 받아오지 못했습니다 (네트워크 오류 또는 빈 피드). 새로고침해 다시 시도하세요.
          </p>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const trendExpressions: Expression[] = trend.expressions as unknown as Expression[];
  const isSingleSource = trend.sources.length === 1;

  return (
    <div className="flex min-h-full flex-col bg-paper">
      <div className="bg-[#fff8e6] px-5 py-2 text-center text-[13px] font-medium text-[#6b5215] sm:px-8">
        ⚠ 로컬 테스트용 콘텐츠입니다 — 실제 Catchy 서비스에 발행된 내용이 아니며, European Commission의 후원·승인을 의미하지 않습니다.
      </div>
      <SiteHeader />

      <main className="flex-1">
        <section className="relative w-full overflow-hidden">
          {trend.imagePath ? (
            <Image src={trend.imagePath} alt="" fill sizes="100vw" className="object-cover" />
          ) : (
            <div className="h-[200px] w-full bg-cloud" />
          )}
          <div
            className="absolute inset-0 bg-gradient-to-t from-graphite/90 via-graphite/45 to-transparent"
            aria-hidden
          />
          <div className="relative mx-auto flex min-h-[260px] max-w-4xl flex-col justify-center px-5 py-6 sm:min-h-[340px] sm:px-8 sm:py-8">
            <div className="flex flex-col gap-7 sm:gap-9">
              <span className="badge-filled self-start">
                {trend.category}
                {trend.category === "미분류" ? " — 매핑된 이미지 없음" : ""}
              </span>
              <div className="flex flex-col gap-2 sm:gap-3">
                <h1 className="text-[32px] font-semibold leading-[1.28] text-snow sm:text-[40px]">
                  {trend.titleKo ?? trend.title}
                </h1>
                {trend.titleKo && (
                  <p className="max-w-2xl text-[13px] text-mist/80" lang="en">
                    원문 제목: {trend.title}
                  </p>
                )}
                <p className="max-w-2xl text-[15px] leading-relaxed text-mist sm:text-[18px]">
                  {trend.summary}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-5 pt-10 sm:px-8">
          <h2 className="text-[32px] font-semibold leading-[1.5] text-obsidian">
            무슨 일이 있었나요?
          </h2>
          <p className="mt-2 mb-5 text-[14px] text-fog">
            제목·출처·발행일만으로 생성한 로컬 테스트 콘텐츠입니다. 본문을 읽지 않았으므로 제목에 없는 내용은 추가하지 않았습니다.
          </p>
          <div className="surface-card overflow-hidden">
            <div className="p-6 sm:p-8">
              <h3 className="mb-3 text-[13px] font-medium text-ember">EN · 영어 요약</h3>
              <EnglishSummary
                text={trend.englishSummary}
                expressions={trendExpressions}
                trendId={trend.id}
                category={trend.category as never}
              />
            </div>
            <div className="border-t border-cloud bg-[#fafafa] p-6 sm:p-8">
              <h3 className="mb-3 text-[13px] font-medium text-ember">KO · 한국어 요약</h3>
              <p lang="ko" className="text-[15px] leading-8 text-steel">
                {trend.koreanSummary}
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-5 pt-10 sm:px-8">
          <div className="surface-card p-6 sm:p-8">
            <h2 className="mb-3 text-[13px] font-medium text-fog">왜 지금 화제일까요?</h2>
            <p className="text-[15px] leading-relaxed text-steel">{trend.whyTrending}</p>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-5 pt-14 sm:px-8">
          <h2 className="mb-2 text-[32px] font-semibold leading-[1.5] text-obsidian">
            이 트렌드에서 배우는 표현
          </h2>
          {trend.expressionsAvailable ? (
            <>
              <p className="mb-8 text-[14px] text-fog">
                제목에 실제로 등장하는 표현만 선별해, 로컬 사전(이 테스트 전용)으로 뜻·뉘앙스·예문을 정리했어요 — 본문 분석이 아닌 제목 기반입니다.
              </p>
              <div className="flex flex-col gap-5">
                {trendExpressions.map((expression) => (
                  <ExpressionDetailCard
                    key={expression.id}
                    expression={expression}
                    trendTitle={trend.title}
                  />
                ))}
              </div>
              <Link_ />
            </>
          ) : (
            <div className="surface-card border-dashed p-8 text-center text-fog">
              <p className="text-[14px] font-medium text-iron">🚫 본문 분석을 사용하지 않은 로컬 테스트</p>
              <p className="mt-2 text-[13px] leading-relaxed">
                이 기사 제목에서 로컬 테스트용 용어집(용어 {trend.expressions.length}개 매칭)으로 확인 가능한 표현이 3개 미만이라, 실제 영어 표현·예문·퀴즈 콘텐츠를 만들 근거가 부족합니다. 제목만으로 표현을 지어내면 사실이 아닌 내용이 되므로 이 섹션은 의도적으로 비활성화했습니다.
              </p>
            </div>
          )}
        </section>

        <section className="mx-auto max-w-4xl px-5 pt-14 sm:px-8">
          <div className="mb-1 flex items-center gap-2">
            <h2 className="text-[20px] font-semibold text-obsidian">참고 출처</h2>
            {isSingleSource && <span className="badge-filled">단일 출처</span>}
          </div>
          <p className="mb-5 text-[14px] text-fog">
            이 콘텐츠는 라이선스가 확인된 공식 출처 1개(European Commission Press Corner)에서 가져온 실제 제목·URL·발행일입니다.
          </p>
          <ul className="flex flex-col gap-3">
            {trend.sources.map((source) => (
              <li key={source.originalUrl} className="surface-card-subtle bg-snow px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <span className="text-[12px] text-fog">출처: European Commission Press Corner</span>
                    <p className="mt-1 text-[14px] font-medium text-graphite">{source.originalTitle}</p>
                  </div>
                  <a
                    href={source.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex shrink-0 cursor-pointer items-center gap-1 rounded-pills border border-iron px-3.5 py-2 text-[12px] font-medium text-iron transition-colors hover:border-graphite hover:text-graphite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-obsidian"
                  >
                    원문 보기
                    <ArrowUpRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-cloud pt-3 text-[12px] text-fog">
                  <span>{source.publishedAt}</span>
                  <span>· scope: {trend.scope}</span>
                  {trend.regionTags.length > 0 && <span>· region: {trend.regionTags.join(", ")}</span>}
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6 rounded-2xl border border-[#f0d890] bg-[#fff8e6] p-5 text-[13px] leading-relaxed text-iron">
            <strong className="mb-1 block text-obsidian">저작권 관련 사용 범위 안내</strong>
            이 콘텐츠는 European Commission Press Corner의 공개 RSS에서 가져온 제목·URL·출처명·발행일 메타데이터만 사용했습니다(Decision 2011/833/EU 재사용 정책 기준). 원문 본문·사진·썸네일·설명(description)은 전혀 수집·저장하지 않았으며, 위 이미지는 기사 원문 사진이 아니라 Catchy의 카테고리 대표 목업 이미지입니다. 카테고리는 제목 키워드만으로 분류했습니다(OpenAI API 키 미사용). 이 페이지는 European Commission의 후원·승인을 의미하지 않습니다.
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

// Visual-only stand-in for the real quiz CTA Link — there's no real
// trend id to route a quiz to for this local-only preview, so this
// renders the identical button styling without being a working link
// (avoids a dead/misleading navigation target).
function Link_() {
  return (
    <span className="btn-solid-black group mt-10 inline-flex w-full cursor-not-allowed opacity-70 sm:w-fit">
      이 표현들로 퀴즈 풀기 (로컬 테스트에서는 비활성)
      <ArrowUpRightIcon className="h-4 w-4" />
    </span>
  );
}
