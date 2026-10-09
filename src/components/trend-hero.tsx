import Link from "next/link";

import { ArrowUpRightIcon } from "@/components/icons";
import type { Trend } from "@/lib/mock-data";

export function TrendHero({ trend }: { trend: Trend }) {
  return (
    <section className="mx-auto max-w-6xl px-5 pt-8 sm:px-8 sm:pt-12">
      <div className="surface-dark p-8 sm:p-12">
        <div className="flex flex-col gap-6">
          <span className="badge-filled w-fit">{trend.category}</span>

          <h1 className="max-w-3xl text-[40px] font-semibold leading-[1.28] tracking-normal text-snow sm:text-[56px] sm:leading-[1.28]">
            {trend.title}
          </h1>

          <p className="max-w-2xl text-[15px] leading-relaxed text-mist sm:text-[18px]">
            {trend.summary}
          </p>

          <Link
            href={`/trend/${trend.id}`}
            className="group inline-flex w-fit cursor-pointer items-center gap-2 rounded-buttons bg-snow px-6 py-3 text-[14px] font-medium text-obsidian transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-graphite focus-visible:ring-snow"
          >
            읽고 표현 배우기
            <ArrowUpRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
