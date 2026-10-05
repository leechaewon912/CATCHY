import { ExpressionCard } from "@/components/expression-card";
import { QuizBanner } from "@/components/quiz-banner";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { TrendFeed } from "@/components/trend-feed";
import { TrendHero } from "@/components/trend-hero";
import { featuredExpressions, heroTrend, trends } from "@/lib/mock-data";

export default function Home() {
  return (
    <div className="flex min-h-full flex-col bg-[#0a0a0b]">
      <SiteHeader />

      <main className="flex-1">
        <TrendHero trend={heroTrend} />

        <TrendFeed trends={trends} />

        <section className="mx-auto max-w-6xl px-5 pt-16 sm:px-8">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="text-xl font-black tracking-tight text-white sm:text-2xl">
                트렌드 속 진짜 표현
              </h2>
              <p className="mt-1 text-sm text-white/45">
                뉴스와 SNS에서 실제로 쓰인 표현을 의미·상황·맥락과 함께
                배워보세요.
              </p>
            </div>
          </div>
          <div className="-mx-5 flex snap-x gap-4 overflow-x-auto px-5 pb-4 sm:-mx-8 sm:px-8">
            {featuredExpressions.map((expression) => (
              <ExpressionCard key={expression.id} expression={expression} />
            ))}
          </div>
        </section>

        <div className="pt-16">
          <QuizBanner />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
