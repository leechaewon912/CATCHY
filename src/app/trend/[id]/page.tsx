import Link from "next/link";
import { notFound } from "next/navigation";

import { ExpressionDetailCard } from "@/components/expression-detail-card";
import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowUpRightIcon,
  SparkleIcon,
} from "@/components/icons";
import { RecordTrendView } from "@/components/record-trend-view";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { highlightExpressionsInText } from "@/lib/highlight-expressions";
import type { SourceType } from "@/lib/mock-data";
import { getTrendDetail, getTrendExpressions } from "@/lib/server/trend-repository";

const SOURCE_TYPE_LABELS: Record<SourceType, string> = {
  official: "공식",
  platform: "플랫폼/차트",
  media: "보조 매체",
  reference: "참고 자료",
};

export default async function TrendDetailPage(
  props: PageProps<"/trend/[id]">,
) {
  const { id } = await props.params;
  const trend = await getTrendDetail(id);

  if (!trend) {
    notFound();
  }

  const trendExpressions = await getTrendExpressions(trend.id);

  return (
    <div className="flex min-h-full flex-col bg-paper">
      <RecordTrendView trendId={trend.id} />
      <SiteHeader />

      <main className="flex-1">
        <section className="mx-auto max-w-4xl px-5 pt-8 sm:px-8 sm:pt-12">
          <Link
            href="/"
            className="mb-6 inline-flex cursor-pointer items-center gap-1.5 rounded text-[14px] font-normal text-fog transition-colors hover:text-graphite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-obsidian"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            트렌드 피드로 돌아가기
          </Link>

          {/* 1. 트렌드 제목 / 카테고리 / 요약 */}
          <div className="surface-dark p-6 sm:p-12">
            <div className="flex flex-col gap-5 sm:gap-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="badge-filled">{trend.category}</span>
                <span className="flex items-center gap-1 text-[12px] text-mist">
                  <SparkleIcon className="h-3.5 w-3.5" />
                  AI 요약
                </span>
              </div>

              <h1 className="text-[32px] font-semibold leading-[1.28] text-snow sm:text-[40px]">
                {trend.title}
              </h1>

              <p className="max-w-2xl text-[15px] leading-relaxed text-mist sm:text-[18px]">
                {trend.summary}
              </p>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-[12px] text-ash">
                <span>출처 {trend.sources.length}개</span>
                <span>·</span>
                <span>표현 {trend.expressions.length}개</span>
              </div>
            </div>
          </div>
        </section>

        <section
          className="mx-auto max-w-4xl px-5 pt-10 sm:px-8"
          aria-labelledby="event-summary-heading"
        >
          <h2 id="event-summary-heading" className="text-[32px] font-semibold leading-[1.5] text-obsidian">
            무슨 일이 있었나요?
          </h2>
          <p className="mt-2 mb-5 text-[14px] text-fog">
            영어로 먼저 읽고, 한국어로 내용을 확인해 보세요. <span className="text-ember">주황색 밑줄</span>로
            표시된 부분을 누르면 아래에서 배우는 표현으로 바로 이동해요.
          </p>
          <div className="surface-card overflow-hidden">
            <div className="p-6 sm:p-8">
              <h3 className="mb-3 text-[13px] font-medium text-ember">
                EN · 영어 요약
              </h3>
              <p lang="en" className="text-[15px] leading-8 text-graphite sm:text-[18px]">
                {highlightExpressionsInText(trend.englishSummary, trendExpressions)}
              </p>
            </div>
            <div className="border-t border-cloud bg-[#fafafa] p-6 sm:p-8">
              <h3 className="mb-3 text-[13px] font-medium text-ember">
                KO · 한국어 요약
              </h3>
              <p lang="ko" className="text-[15px] leading-8 text-steel">
                {trend.koreanSummary}
              </p>
            </div>
          </div>

          <a
            href="#sources"
            className="mt-4 inline-flex cursor-pointer items-center gap-1.5 rounded text-[14px] font-medium text-graphite transition-colors hover:text-obsidian focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-obsidian"
          >
            출처 {trend.sources.length}개 보기
            <ArrowDownIcon className="h-3.5 w-3.5" />
          </a>
        </section>

        {/* 2. 왜 화제인지 */}
        <section className="mx-auto max-w-4xl px-5 pt-10 sm:px-8">
          <div className="surface-card p-6 sm:p-8">
            <h2 className="mb-3 text-[13px] font-medium text-fog">
              왜 지금 화제일까요?
            </h2>
            <p className="text-[15px] leading-relaxed text-steel">
              {trend.whyTrending}
            </p>
          </div>
        </section>

        {/* 3-5. 표현 3개 + 의미/뉘앙스/비슷한 표현/예문 + 저장 버튼 */}
        <section className="mx-auto max-w-4xl px-5 pt-14 sm:px-8">
          <h2 className="mb-2 text-[32px] font-semibold leading-[1.5] text-obsidian">
            이 트렌드에서 배우는 표현
          </h2>
          <p className="mb-8 text-[14px] text-fog">
            AI가 이 트렌드 콘텐츠에서 실제로 쓰인 표현을 선별해 뜻·뉘앙스·비슷한
            표현·예문과 함께 정리했어요.
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

          {/* 6. 퀴즈 CTA */}
          <Link
            href={`/quiz?trend=${trend.id}`}
            className="btn-primary group mt-10 w-full sm:w-fit"
          >
            이 표현들로 퀴즈 풀기
            <ArrowUpRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </section>

        {/* 7. 참고 출처 — 페이지 맨 아래 */}
        <section
          id="sources"
          className="mx-auto max-w-4xl scroll-mt-24 px-5 pt-14 pb-20 sm:px-8"
        >
          <h2 className="mb-1 text-[20px] font-semibold text-obsidian">
            참고 출처
          </h2>
          <p className="mb-5 text-[14px] text-fog">
            이 콘텐츠는 여러 공개 출처를 참고해 CATCHY가 영어 학습용으로 새로
            작성한 콘텐츠입니다. 원문 전문은 각 출처 링크에서 확인해 주세요.
          </p>
          <ul className="flex flex-col gap-3">
            {trend.sources.map((source) => (
              <li
                key={source.originalUrl}
                className="surface-card-subtle px-5 py-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] text-fog">
                        {source.sourceName}
                      </span>
                      <span className="badge-outline">
                        {SOURCE_TYPE_LABELS[source.sourceType]}
                      </span>
                    </div>
                    <p className="mt-1 text-[14px] font-medium text-graphite">
                      {source.originalTitle}
                    </p>
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
                </div>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
