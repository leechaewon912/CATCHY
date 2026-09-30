import Link from "next/link";
import { notFound } from "next/navigation";

import { ExpressionDetailCard } from "@/components/expression-detail-card";
import {
  ArrowLeftIcon,
  ArrowUpRightIcon,
  SparkleIcon,
} from "@/components/icons";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  categoryStyles,
  getExpressionsByTrendId,
  getTrendById,
} from "@/lib/mock-data";

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
                <span>{trend.sourcesCount}개 매체 종합</span>
                <span>·</span>
                <span>{trend.readTime} 읽기</span>
                <span>·</span>
                <span>표현 {trend.expressionsCount}개</span>
              </div>
            </div>
          </div>
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
        <section className="mx-auto max-w-4xl px-5 pt-8 sm:px-8">
          <h2 className="mb-1 text-lg font-black tracking-tight text-white sm:text-xl">
            참고한 뉴스 출처
          </h2>
          <p className="mb-5 text-sm text-white/45">
            AI가 아래 매체의 보도를 종합해 이 트렌드를 재구성했어요. 전문은
            원문에서 확인해 주세요.
          </p>
          <ul className="flex flex-col gap-3">
            {trend.sources.map((source) => (
              <li key={source.url}>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4 transition-colors hover:border-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-300"
                >
                  <div className="min-w-0">
                    <p className="font-mono text-[11px] uppercase tracking-widest text-white/40">
                      {source.outlet}
                    </p>
                    <p className="mt-1 truncate text-sm font-semibold text-white/85">
                      {source.title}
                    </p>
                  </div>
                  <ArrowUpRightIcon className="h-4 w-4 shrink-0 text-white/30 transition-colors group-hover:text-lime-300" />
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-white/30">
            원문 링크는 데모용 임시 주소이며, 실제 서비스에서는 각 매체의
            원문 기사로 연결됩니다.
          </p>
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
              <ExpressionDetailCard key={expression.id} expression={expression} />
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
