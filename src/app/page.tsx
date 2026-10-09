import { ExpressionCard } from "@/components/expression-card";
import { FeaturedExpressionsCarousel } from "@/components/featured-expressions-carousel";
import { QuizBanner } from "@/components/quiz-banner";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { TrendCard } from "@/components/trend-card";
import { TrendFeed } from "@/components/trend-feed";
import { TrendHero } from "@/components/trend-hero";
import { getHomeTrends } from "@/lib/server/trend-repository";
import { toExpressions } from "@/lib/server/to-expressions";

export default async function Home() {
  const trends = await getHomeTrends();
  const heroTrend = trends[0];
  const featuredExpressions = trends.flatMap((trend) => {
    const [first] = toExpressions(trend);
    return first ? [{ expression: first, trendTitle: trend.title }] : [];
  });

  return (
    <div className="flex min-h-full flex-col bg-paper">
      <SiteHeader />

      <main className="flex-1">
        <TrendHero trend={heroTrend} />

        <TrendFeed trends={trends.map((trend) => ({ id: trend.id, category: trend.category }))}>
          {trends.map((trend) => (
            <TrendCard key={trend.id} trend={trend} />
          ))}
        </TrendFeed>

        <section className="mx-auto max-w-6xl px-5 pt-16 sm:px-8">
          <FeaturedExpressionsCarousel
            title="트렌드 속 진짜 표현"
            description="뉴스와 SNS에서 실제로 쓰인 표현을 의미·상황·맥락과 함께 배워보세요."
          >
            {featuredExpressions.map(({ expression, trendTitle }) => (
              <ExpressionCard
                key={expression.id}
                expression={expression}
                trendTitle={trendTitle}
              />
            ))}
          </FeaturedExpressionsCarousel>
        </section>

        <div className="pt-16">
          <QuizBanner />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
