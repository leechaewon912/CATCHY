import Link from "next/link";

import { ArrowUpRightIcon, SparkleIcon } from "@/components/icons";
import { categoryStyles, type Trend } from "@/lib/mock-data";

export function TrendHero({ trend }: { trend: Trend }) {
  const style = categoryStyles[trend.category];

  return (
    <section className="mx-auto max-w-6xl px-5 pt-8 sm:px-8 sm:pt-12">
      <div
        className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${style.gradient} p-8 sm:p-12`}
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-black/20 blur-3xl" />

        <div className="relative flex flex-col gap-6">
          <div className="flex items-center gap-2">
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

          <h1 className="max-w-3xl text-3xl font-black leading-[1.15] tracking-tight text-black sm:text-5xl">
            {trend.title}
          </h1>

          <p className="max-w-2xl text-base leading-relaxed text-black/80 sm:text-lg">
            {trend.summary}
          </p>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2">
            <div className="flex items-center gap-4 font-mono text-xs uppercase tracking-widest text-black/70">
              <span>{trend.sourcesCount}개 매체 종합</span>
              <span>·</span>
              <span>{trend.readTime} 읽기</span>
              <span>·</span>
              <span>표현 {trend.expressionsCount}개</span>
            </div>
          </div>

          <Link
            href={`/trend/${trend.id}`}
            className="group inline-flex w-fit cursor-pointer items-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-bold text-white transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-fuchsia-500 focus-visible:ring-black"
          >
            읽고 표현 배우기
            <ArrowUpRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
