import Image from "next/image";

import { ExpressionDetailCard } from "@/components/expression-detail-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { buildGoogleTrendsTestContentV2 } from "@/lib/server/local-test/build-google-trends-content-v2";
import { GOOGLE_TRENDS_SNAPSHOT_2026_10_15 } from "@/lib/server/local-test/google-trends-snapshot";
import type { Expression } from "@/lib/mock-data";

// LOCAL TEST ONLY — not linked from anywhere in the real app's nav, not
// used by any production route. Reclassifies the SAME frozen 16-item
// Google Trends snapshot (google-trends-snapshot.ts, collected via real
// polls on 2026-10-15 — see that file's doc comment) under the new
// 7-category scheme. Zero network calls happen anywhere in this file's
// import graph — no fresh Google Trends poll, no GDELT, no EU Press
// Corner, no Supabase read or write. Reuses the real SiteHeader/
// SiteFooter/ExpressionDetailCard components and globals.css classes.
export default async function GoogleTrendsPreviewV2Page() {
  const report = await buildGoogleTrendsTestContentV2(GOOGLE_TRENDS_SNAPSHOT_2026_10_15);

  return (
    <div className="flex min-h-full flex-col bg-paper">
      <div className="bg-[#fff8e6] px-5 py-2 text-center text-[13px] font-medium text-[#6b5215] sm:px-8">
        ⚠ 로컬 테스트용 콘텐츠입니다 — 실제 Catchy 서비스에 발행된 내용이 아니며, Google의 후원·승인을 의미하지 않습니다.
      </div>
      <SiteHeader />

      <main className="flex-1">
        <section className="mx-auto max-w-4xl px-5 pt-10 sm:px-8">
          <h1 className="text-[28px] font-semibold text-obsidian sm:text-[32px]">
            Google Trends 재분류 테스트 (7개 카테고리)
          </h1>
          <p className="mt-2 text-[14px] text-fog">
            이전에 수집해 둔 Google Trends 원시 후보 16개를 새 폴링 없이 재분류했습니다. Data source:{" "}
            <a
              href="https://trends.google.com/trending?geo=US"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-graphite"
            >
              Google Trends
            </a>
            . 검색어·관심도·시점만 사용했고, 관련 뉴스 기사·썸네일은 읽지 않았습니다.
          </p>

          <dl className="mt-6 grid grid-cols-2 gap-4 rounded-2xl border border-cloud bg-snow p-5 text-[13px] sm:grid-cols-4">
            <div>
              <dt className="text-fog">원시 후보</dt>
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

          <div className="mt-4 grid grid-cols-2 gap-3 text-[13px] sm:grid-cols-4">
            {(Object.keys(report.categoryCounts) as Array<keyof typeof report.categoryCounts>).map((cat) => (
              <div key={cat} className="rounded-xl border border-cloud bg-[#fafafa] px-4 py-3">
                <p className="text-fog">{cat}</p>
                <p className="text-[16px] font-semibold text-obsidian">{report.categoryCounts[cat]}개</p>
              </div>
            ))}
          </div>
        </section>

        {/* 카드 목록 */}
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
                  <p className="text-[13px] text-fog">
                    검색어: &ldquo;{item.term}&rdquo; · 관심도 {item.approxTraffic} · contentType: {item.contentType}
                  </p>
                  <span className="mt-auto text-[13px] font-medium text-obsidian">상세 보기 ↓</span>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* 상세 콘텐츠 */}
        {report.items.map((item) => {
          const expressionsAsExpression = item.expressions as unknown as Expression[];
          return (
            <section id={item.id} key={item.id} className="mx-auto max-w-4xl scroll-mt-20 px-5 pt-16 sm:px-8">
              <div className="relative w-full overflow-hidden rounded-[24px]">
                <div className="relative h-[220px] w-full">
                  <Image src={item.imagePath} alt="" fill sizes="100vw" className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-graphite/90 via-graphite/45 to-transparent" aria-hidden />
                  <div className="absolute inset-0 flex flex-col justify-end gap-3 p-6 sm:p-8">
                    <div className="flex items-center gap-2">
                      <span className="badge-filled">{item.category}</span>
                      <span className="badge-outline bg-snow/90">{item.contentType}</span>
                    </div>
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
                  Data source:{" "}
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
          <h2 className="mb-3 text-[16px] font-semibold text-obsidian">기타로 분류된 항목 ({report.otherBucketTerms.length}개)</h2>
          <ul className="flex flex-col gap-1 text-[13px] text-fog">
            {report.otherBucketTerms.map((t, i) => (
              <li key={i}>&ldquo;{t}&rdquo;</li>
            ))}
          </ul>
        </section>

        {report.excludedTerms.length > 0 && (
          <section className="mx-auto max-w-4xl px-5 pt-10 sm:px-8">
            <h2 className="mb-3 text-[16px] font-semibold text-obsidian">제외된 후보 ({report.excludedTerms.length}개)</h2>
            <ul className="flex flex-col gap-1 text-[13px] text-fog">
              {report.excludedTerms.map((e, i) => (
                <li key={i}>
                  &ldquo;{e.term}&rdquo; — {e.reason}
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mx-auto mt-10 max-w-4xl px-5 pb-20 sm:px-8">
          <div className="rounded-2xl border border-[#f0d890] bg-[#fff8e6] p-5 text-[13px] leading-relaxed text-iron">
            <strong className="mb-1 block text-obsidian">데이터 이용 안내</strong>
            Google 공식 Trends 데이터 재사용 정책(support.google.com/trends/answer/4365538)에 따라 검색어·관심도·시점
            데이터를 Data source 표시와 함께 사용했습니다. 관련 뉴스 기사(ht:news_item)의 제목·URL·썸네일은 각 언론사
            저작물이라 전혀 읽거나 표시하지 않았습니다. 검색량 증가의 원인은 추측하지 않았습니다. 이 페이지는 이전에
            수집한 원시 데이터만 재분류했을 뿐, 이번 조회에서 Google Trends/GDELT/EU Press Corner 중 어디에도 새로
            접속하지 않았습니다.
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
