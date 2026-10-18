import Image from "next/image";

import { ExpressionDetailCard } from "@/components/expression-detail-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { buildGoogleTrendsTestContent } from "@/lib/server/local-test/build-google-trends-content";
import { GOOGLE_TRENDS_SNAPSHOT_2026_10_15 } from "@/lib/server/local-test/google-trends-snapshot";
import type { Expression } from "@/lib/mock-data";

// LOCAL TEST ONLY — not linked from anywhere in the real app's nav, not
// used by any production route. Reuses the real SiteHeader/SiteFooter/
// ExpressionDetailCard components and globals.css classes so this
// renders with the same fonts/colors/spacing/card shapes as the real
// app. Data comes entirely from a single live Google Trends RSS fetch
// (see build-google-trends-content.ts) — no Supabase read or write
// anywhere in this file's import graph, no RSS/GDELT/web search/
// Wikipedia/other API calls.
// Uses the frozen snapshot (16 terms collected via several real polls
// on 2026-10-15, see google-trends-snapshot.ts) rather than a fresh live
// fetch on every page load — reloading this preview page repeatedly
// should not itself become "unnecessary polling" of Google's endpoint.
export default async function GoogleTrendsPreviewPage() {
  const report = await buildGoogleTrendsTestContent(GOOGLE_TRENDS_SNAPSHOT_2026_10_15);

  return (
    <div className="flex min-h-full flex-col bg-paper">
      <div className="bg-[#fff8e6] px-5 py-2 text-center text-[13px] font-medium text-[#6b5215] sm:px-8">
        ⚠ 로컬 테스트용 콘텐츠입니다 — 실제 Catchy 서비스에 발행된 내용이 아니며, Google의 후원·승인을 의미하지 않습니다.
      </div>
      <SiteHeader />

      <main className="flex-1">
        <section className="mx-auto max-w-4xl px-5 pt-10 sm:px-8">
          <h1 className="text-[28px] font-semibold text-obsidian sm:text-[32px]">
            Google Trends 기반 콘텐츠 로컬 테스트
          </h1>
          <p className="mt-2 text-[14px] text-fog">
            데이터 출처: Google Trends — Trending Now (United States). 제목·관심도·시점(term/approx_traffic/pubDate)만
            사용했고, 관련 뉴스 기사 제목·URL·썸네일(ht:news_item, ht:picture)은 각 언론사 저작권 대상이라 전혀 읽지 않았습니다.
          </p>

          <dl className="mt-6 grid grid-cols-2 gap-4 rounded-2xl border border-cloud bg-snow p-5 text-[13px] sm:grid-cols-4">
            <div>
              <dt className="text-fog">수신 후보</dt>
              <dd className="text-[18px] font-semibold text-obsidian">{report.totalCandidates}</dd>
            </div>
            <div>
              <dt className="text-fog">제외됨</dt>
              <dd className="text-[18px] font-semibold text-obsidian">{report.excludedCount}</dd>
            </div>
            <div>
              <dt className="text-fog">중복 제거</dt>
              <dd className="text-[18px] font-semibold text-obsidian">{report.dedupedCount}</dd>
            </div>
            <div>
              <dt className="text-fog">최종 생성</dt>
              <dd className="text-[18px] font-semibold text-obsidian">{report.finalCount}</dd>
            </div>
          </dl>
        </section>

        {report.finalCount === 0 && (
          <section className="mx-auto max-w-4xl px-5 pt-10 sm:px-8">
            <div className="surface-card border-dashed p-8 text-center text-fog">
              <p className="text-[14px] font-medium text-iron">🚫 이번 호출에서는 조건을 만족하는 트렌드가 없었습니다</p>
              <p className="mt-2 text-[13px] leading-relaxed">
                Google Trends &ldquo;Trending Now&rdquo; 피드는 호출 시점의 최근 ~10개만 반환하는 롤링 스냅샷입니다. 이번 스냅샷의
                {report.totalCandidates}개 후보가 전부 제외 대상(정치/스포츠/날씨/주식/범죄 등)이었거나 5개 선호
                카테고리 키워드에 걸리지 않아, 사실을 지어내지 않기 위해 콘텐츠를 생성하지 않았습니다. 새로고침하면 다른
                스냅샷을 받아올 수 있습니다.
              </p>
            </div>
          </section>
        )}

        {/* 카드 목록 */}
        {report.finalCount > 0 && (
          <section className="mx-auto max-w-4xl px-5 pt-10 sm:px-8">
            <h2 className="mb-4 text-[20px] font-semibold text-obsidian">생성된 콘텐츠 {report.finalCount}개</h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {report.items.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="surface-card group flex flex-col overflow-hidden transition-transform hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="relative h-36 shrink-0 sm:h-40">
                    <Image src={item.imagePath} alt="" fill sizes="(min-width: 640px) 50vw, 100vw" className="object-cover" />
                    <span className="badge-outline absolute left-3 top-3 bg-snow/90">{item.category}</span>
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-5">
                    <h3 className="text-[16px] font-semibold leading-snug text-obsidian">{item.title}</h3>
                    <p className="text-[13px] text-fog">검색어: &ldquo;{item.term}&rdquo; · 관심도 {item.approxTraffic}</p>
                    <span className="mt-auto text-[13px] font-medium text-obsidian">상세 보기 ↓</span>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* 상세 콘텐츠 */}
        {report.items.map((item) => {
          const expressionsAsExpression = item.expressions as unknown as Expression[];
          return (
            <section
              id={item.id}
              key={item.id}
              className="mx-auto max-w-4xl scroll-mt-20 px-5 pt-16 sm:px-8"
            >
              <div className="relative w-full overflow-hidden rounded-[24px]">
                <div className="relative h-[220px] w-full">
                  <Image src={item.imagePath} alt="" fill sizes="100vw" className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-graphite/90 via-graphite/45 to-transparent" aria-hidden />
                  <div className="absolute inset-0 flex flex-col justify-end gap-3 p-6 sm:p-8">
                    <span className="badge-filled self-start">{item.category}</span>
                    <h2 className="text-[26px] font-semibold leading-tight text-snow sm:text-[32px]">{item.title}</h2>
                    <p className="text-[13px] text-mist">
                      검색어: &ldquo;{item.term}&rdquo; · 관심도 {item.approxTraffic} · {item.pubDate}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="mb-2 text-[20px] font-semibold text-obsidian">무슨 일이 있었나요? (What&apos;s Trending?)</h3>
                <p className="mb-4 text-[13px] text-fog">
                  Google Trends 검색어·관심도·시점만으로 작성한 사실 중심 요약입니다. 검색량 증가의 원인은 추측하지
                  않았습니다.
                </p>
                <div className="surface-card overflow-hidden">
                  <div className="p-6 sm:p-8">
                    <h4 className="mb-3 text-[13px] font-medium text-ember">EN · 영어 요약</h4>
                    <p className="text-[15px] leading-8 text-graphite" lang="en">
                      {item.whatsTrending.en}
                    </p>
                  </div>
                  <div className="border-t border-cloud bg-[#fafafa] p-6 sm:p-8">
                    <h4 className="mb-3 text-[13px] font-medium text-ember">KO · 한국어 요약</h4>
                    <p className="text-[15px] leading-8 text-steel" lang="ko">
                      {item.whatsTrending.ko}
                    </p>
                  </div>
                </div>
              </div>

              {item.getToKnow ? (
                <div className="surface-card mt-6 p-6 sm:p-8">
                  <h3 className="mb-3 text-[13px] font-medium text-fog">Get to Know</h3>
                  <p className="text-[15px] leading-relaxed text-steel" lang="en">
                    {item.getToKnow.en}
                  </p>
                  <p className="mt-3 text-[14px] leading-relaxed text-fog" lang="ko">
                    {item.getToKnow.ko}
                  </p>
                </div>
              ) : (
                <div className="surface-card mt-6 border-dashed p-6 text-center text-fog sm:p-8">
                  <p className="text-[13px] leading-relaxed">
                    🚫 Get to Know 생략됨 — 이 검색어에 대해 검증 가능한 일반 배경지식이 로컬 사전에 없어, 근거 없는
                    세부 정보를 지어내지 않기 위해 이 섹션을 생략했습니다.
                  </p>
                </div>
              )}

              <div className="mt-10">
                <h3 className="mb-2 text-[22px] font-semibold text-obsidian">Catch the Language</h3>
                <p className="mb-6 text-[14px] text-fog">
                  이 카테고리와 관련해 Catchy가 자체 작성한 표현이에요 — 특정 기사에서 가져온 내용이 아닙니다.
                </p>
                <div className="flex flex-col gap-5">
                  {expressionsAsExpression.map((expression) => (
                    <ExpressionDetailCard key={expression.id} expression={expression} trendTitle={item.title} />
                  ))}
                </div>
              </div>

              <div className="surface-card-subtle mt-8 p-5">
                <h4 className="mb-3 text-[13px] font-medium text-fog">퀴즈 데이터 (미리보기)</h4>
                <ul className="flex flex-col gap-3 text-[13px]">
                  {item.quiz.map((q, i) => (
                    <li key={i} className="border-t border-cloud pt-3 first:border-t-0 first:pt-0">
                      <p className="font-medium text-graphite">&ldquo;{q.phrase}&rdquo; 의 뜻은?</p>
                      <p className="mt-1 text-fog">
                        정답: {q.correctMeaningKo} · 보기: {q.optionsKo.join(" / ")}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 flex flex-col gap-2 rounded-2xl border border-cloud bg-[#fafafa] p-5 text-[12px] text-fog">
                <p>
                  데이터 제공:{" "}
                  <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-graphite">
                    Google Trends
                  </a>
                </p>
                <p>사용한 데이터 항목: {item.usedDataFields.join(", ")}</p>
                <p>생략/미사용 항목: {item.omittedFields.join(" · ")}</p>
              </div>
            </section>
          );
        })}

        <section className="mx-auto max-w-4xl px-5 pt-14 sm:px-8">
          <h2 className="mb-3 text-[16px] font-semibold text-obsidian">제외된 후보 ({report.excludedTerms.length}개)</h2>
          <ul className="flex flex-col gap-1 text-[13px] text-fog">
            {report.excludedTerms.map((e, i) => (
              <li key={i}>
                &ldquo;{e.term}&rdquo; — {e.reason}
              </li>
            ))}
          </ul>
        </section>

        <div className="mx-auto mt-10 max-w-4xl px-5 pb-20 sm:px-8">
          <div className="rounded-2xl border border-[#f0d890] bg-[#fff8e6] p-5 text-[13px] leading-relaxed text-iron">
            <strong className="mb-1 block text-obsidian">데이터 이용 안내</strong>
            Google 공식 Trends 데이터 재사용 정책(support.google.com/trends/answer/4365538)에 따라 검색어·관심도·시점
            데이터를 출처 표시와 함께 사용했습니다. 관련 뉴스 기사(ht:news_item)의 제목·URL·썸네일은 각 언론사
            저작물이라 전혀 읽거나 표시하지 않았습니다. 검색량 증가의 원인은 추측하지 않았고, 본문은 Google Trends
            데이터만으로 확인 가능한 사실로 한정했습니다. 이 페이지는 Google의 후원·승인을 의미하지 않습니다.
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
