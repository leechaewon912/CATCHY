import Link from "next/link";
import { notFound } from "next/navigation";

import { ExpressionDetailCard } from "@/components/expression-detail-card";
import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowUpRightIcon,
  SparkleIcon,
} from "@/components/icons";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { highlightExpressionsInText } from "@/lib/highlight-expressions";
import {
  categoryStyles,
  getExpressionsByTrendId,
  getTrendById,
  type SourceType,
} from "@/lib/mock-data";

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
  const trend = getTrendById(id);

  if (!trend) {
    notFound();
  }

  const style = categoryStyles[trend.category];
  const trendExpressions = getExpressionsByTrendId(trend.id);

  return (
    <div className="flex min-h-full flex-col bg-[#0a0a0b]">
      <SiteHeader />

      <main className="flex-1">
        <section className="mx-auto max-w-4xl px-5 pt-8 sm:px-8 sm:pt-12">
          <Link
            href="/"
            className="mb-6 inline-flex cursor-pointer items-center gap-1.5 rounded text-sm font-medium text-white/50 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-300"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            트렌드 피드로 돌아가기
          </Link>

          {/* 1. 트렌드 제목 / 카테고리 / 요약 */}
          <div
            className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${style.gradient} p-6 sm:p-12`}
          >
            <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

            <div className="relative flex flex-col gap-5 sm:gap-6">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 font-mono text-xs font-bold uppercase tracking-widest text-black ${style.tag}`}
                >
                  {trend.category}
                </span>
                <span className="flex items-center gap-1 font-mono text-xs uppercase tracking-widest text-black/70">
                  <SparkleIcon className="h-3.5 w-3.5" />
                  AI 요약
                </span>
              </div>

              <h1 className="text-2xl font-black leading-[1.15] tracking-tight text-black sm:text-4xl">
                {trend.title}
              </h1>

              <p className="max-w-2xl text-base leading-relaxed text-black/80 sm:text-lg">
                {trend.summary}
              </p>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 font-mono text-xs uppercase tracking-widest text-black/70">
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
          <h2 id="event-summary-heading" className="text-xl font-black tracking-tight text-white sm:text-2xl">
            무슨 일이 있었나요?
          </h2>
          <p className="mt-2 mb-5 text-sm text-white/45">
            영어로 먼저 읽고, 한국어로 내용을 확인해 보세요. <span className="text-lime-300">라임색 밑줄</span>로
            표시된 부분을 누르면 아래에서 배우는 표현으로 바로 이동해요.
          </p>
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
            <div className="p-6 sm:p-8">
              <h3 className="mb-3 text-xs font-bold tracking-widest text-lime-300">
                EN · 영어 요약
              </h3>
              <p lang="en" className="text-base leading-8 text-white/90 sm:text-lg">
                {highlightExpressionsInText(trend.englishSummary, trendExpressions)}
              </p>
            </div>
            <div className="border-t border-white/10 bg-white/[0.02] p-6 sm:p-8">
              <h3 className="mb-3 text-xs font-bold tracking-widest text-lime-300">
                KO · 한국어 요약
              </h3>
              <p lang="ko" className="text-base leading-8 text-white/75">
                {trend.koreanSummary}
              </p>
            </div>
          </div>

          <a
            href="#sources"
            className="mt-4 inline-flex cursor-pointer items-center gap-1.5 rounded text-sm font-semibold text-lime-300 transition-colors hover:text-lime-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-300"
          >
            출처 {trend.sources.length}개 보기
            <ArrowDownIcon className="h-3.5 w-3.5" />
          </a>
        </section>

        {/* 2. 왜 화제인지 */}
        <section className="mx-auto max-w-4xl px-5 pt-10 sm:px-8">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
            <h2 className="mb-3 font-mono text-xs font-bold uppercase tracking-widest text-lime-300">
              왜 지금 화제일까요?
            </h2>
            <p className="text-base leading-relaxed text-white/75">
              {trend.whyTrending}
            </p>
          </div>
        </section>

        {/* 3. 참고 출처 */}
        <section
          id="sources"
          className="mx-auto max-w-4xl scroll-mt-24 px-5 pt-8 sm:px-8"
        >
          <h2 className="mb-1 text-lg font-black tracking-tight text-white sm:text-xl">
            참고 출처
          </h2>
          <p className="mb-5 text-sm text-white/45">
            이 콘텐츠는 여러 공개 출처를 참고해 CATCHY가 영어 학습용으로 새로
            작성한 콘텐츠입니다. 원문 전문은 각 출처 링크에서 확인해 주세요.
          </p>
          <ul className="flex flex-col gap-3">
            {trend.sources.map((source) => (
              <li
                key={source.originalUrl}
                className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] uppercase tracking-widest text-white/40">
                        {source.sourceName}
                      </span>
                      <span className="rounded-full border border-white/15 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-white/60">
                        {SOURCE_TYPE_LABELS[source.sourceType]}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-white/85">
                      {source.originalTitle}
                    </p>
                  </div>
                  <a
                    href={source.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex shrink-0 cursor-pointer items-center gap-1 rounded-full border border-white/15 px-3.5 py-2 text-xs font-bold text-white/70 transition-colors hover:border-lime-300 hover:text-lime-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-300"
                  >
                    원문 보기
                    <ArrowUpRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-white/10 pt-3 text-xs text-white/40">
                  <span>{source.publishedAt}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* 4-6. 표현 3개 + 의미/뉘앙스/사용 상황/예문 + 저장 버튼 */}
        <section className="mx-auto max-w-4xl px-5 pt-14 pb-20 sm:px-8">
          <h2 className="mb-2 text-xl font-black tracking-tight text-white sm:text-2xl">
            이 트렌드에서 배우는 표현
          </h2>
          <p className="mb-8 text-sm text-white/45">
            AI가 이 트렌드 콘텐츠에서 실제로 쓰인 표현을 선별해 뜻·뉘앙스·사용
            상황·예문과 함께 정리했어요.
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

          {/* 7. 퀴즈 CTA */}
          <Link
            href={`/quiz?trend=${trend.id}`}
            className="group mt-10 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-lime-300 px-7 py-3.5 text-sm font-bold text-black transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0b] focus-visible:ring-lime-300 sm:w-fit"
          >
            이 표현들로 퀴즈 풀기
            <ArrowUpRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
