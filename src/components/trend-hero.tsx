// Static value-prop banner — not tied to any specific trend. Content
// discovery happens via the ranked trend cards right below it (see
// src/app/page.tsx), so this only needs to convey what the service is.
export function TrendHero() {
  return (
    <section className="mx-auto max-w-6xl px-5 pt-8 sm:px-8 sm:pt-12">
      <div className="surface-dark p-8 sm:p-12">
        <div className="flex flex-col gap-4">
          <h1 className="max-w-3xl break-keep text-[40px] font-semibold leading-[1.28] tracking-normal text-snow sm:text-[56px] sm:leading-[1.28]">
            요즘 해외에서 뭐가 핫할까?
          </h1>

          <p className="max-w-2xl break-keep text-[15px] leading-relaxed text-mist sm:text-[18px]">
            글로벌 트렌드부터
            <br />
            지금 실제로 쓰는 영어 표현까지.
          </p>
        </div>
      </div>
    </section>
  );
}
