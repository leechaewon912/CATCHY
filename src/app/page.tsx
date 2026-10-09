import { ExpressionCard } from "@/components/expression-card";
import { FeaturedExpressionsCarousel } from "@/components/featured-expressions-carousel";
import { QuizBanner } from "@/components/quiz-banner";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { TrendCard } from "@/components/trend-card";
import { TrendFeed, type DayFilter } from "@/components/trend-feed";
import { TrendHero } from "@/components/trend-hero";
import { getHomeTrends } from "@/lib/server/trend-repository";
import { toExpressions } from "@/lib/server/to-expressions";

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
// Indices match Date#getUTCDay() (0=Sun..6=Sat) after shifting a UTC
// timestamp by KST_OFFSET_MS and reading it back with the UTC getters —
// the same "treat UTC getters as KST wall-clock" trick used by
// kstDateStamp in src/lib/server/collect-trends.ts. Asia/Seoul has no
// DST, so a fixed +9h offset is always correct.
const KST_WEEKDAY_LABELS: DayFilter[] = ["일", "월", "화", "수", "목", "금", "토"];

function toKstWallClock(isoString: string): Date {
  return new Date(new Date(isoString).getTime() + KST_OFFSET_MS);
}

function startOfKstDayMs(kstWallClock: Date): number {
  return Date.UTC(
    kstWallClock.getUTCFullYear(),
    kstWallClock.getUTCMonth(),
    kstWallClock.getUTCDate(),
  );
}

type ThisWeek = {
  mondayStartMs: number;
  sundayStartMs: number;
  // Today's Korean weekday label (월~일) — the day filter opens on this
  // instead of "전체" so visitors land on "what's trending today".
  todayLabel: DayFilter;
};

function computeThisWeek(now: Date): ThisWeek {
  const nowKst = toKstWallClock(now.toISOString());
  const todayStartMs = startOfKstDayMs(nowKst);
  const daysSinceMonday = (nowKst.getUTCDay() + 6) % 7;
  const mondayStartMs = todayStartMs - daysSinceMonday * DAY_MS;
  const sundayStartMs = mondayStartMs + 6 * DAY_MS;

  return {
    mondayStartMs,
    sundayStartMs,
    todayLabel: KST_WEEKDAY_LABELS[nowKst.getUTCDay()],
  };
}

// Korean weekday label (월~일) for generatedAt, if it falls within the
// current Monday-Sunday week in KST — otherwise null, meaning the
// trend-feed filter's "전체" (this week) should exclude it too, not
// just the individual day tabs.
function weekdayLabelIfThisWeek(generatedAt: string, week: ThisWeek): string | null {
  const trendKst = toKstWallClock(generatedAt);
  const trendDayStartMs = startOfKstDayMs(trendKst);

  if (trendDayStartMs < week.mondayStartMs || trendDayStartMs > week.sundayStartMs) {
    return null;
  }
  return KST_WEEKDAY_LABELS[trendKst.getUTCDay()];
}

export default async function Home() {
  const trends = await getHomeTrends();
  const thisWeek = computeThisWeek(new Date());
  const featuredExpressions = trends.flatMap((trend) => {
    const [first] = toExpressions(trend);
    return first ? [{ expression: first, trendTitle: trend.title }] : [];
  });

  return (
    <div className="flex min-h-full flex-col bg-paper">
      <SiteHeader />

      <main className="flex-1">
        <TrendHero />

        <TrendFeed
          trends={trends.map((trend) => ({
            id: trend.id,
            category: trend.category,
            dayOfWeek: weekdayLabelIfThisWeek(trend.generatedAt, thisWeek),
          }))}
          defaultDay={thisWeek.todayLabel}
        >
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
