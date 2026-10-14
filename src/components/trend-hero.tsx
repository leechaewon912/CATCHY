// Static value-prop banner — not tied to any specific trend. Content
// discovery happens via the ranked trend cards right below it (see
// src/app/page.tsx), so this only needs to convey what the service is.
export function TrendHero() {
  return (
    <section className="relative overflow-hidden bg-snow py-12 sm:py-16">
      {/* Soft blue wash rising from the bottom edge, fading to white at
          the top. Intentionally inline and scoped to this section only —
          these accent colors are a trial direction, not tokens promoted
          into globals.css. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, #AFC3FF 0%, #DCE5FF 40%, #FFFFFF 80%)",
        }}
      />

      <div className="relative mx-auto max-w-5xl px-5 text-center sm:px-8">
        {/* Wider than the slogan/description below it so "Catch the
            language." has room to stay on one line at tablet/desktop
            sizes instead of wrapping inside its own line. */}
        <h1
          className="motion-safe:animate-hero-fade-up mx-auto max-w-[1040px] break-keep font-extrabold tracking-tight text-obsidian"
          style={{ fontSize: "clamp(2.375rem, 1.1rem + 6vw, 5.5rem)", lineHeight: 1.08 }}
        >
          <span className="block">Catch the trend.</span>
          <span className="block sm:whitespace-nowrap">Catch the language.</span>
        </h1>

        <p className="motion-safe:animate-hero-fade-up-delay mt-6 break-keep text-[19px] font-semibold leading-snug text-[#171717] sm:mt-7 sm:text-[24px] md:text-[26px] lg:text-[28px]">
          트렌드를 읽다, 영어를 발견하다.
        </p>

        <p className="motion-safe:animate-hero-fade-up-delay mx-auto mt-4 max-w-[620px] break-keep text-[14px] font-normal leading-[1.65] text-[#6B7280] sm:mt-5 sm:text-[16px] md:text-[17px] lg:text-[18px]">
          해외에서 지금 화제가 되는 트렌드를 쉽고 빠르게 만나보세요. 트렌드 속
          생생한 영어 표현을 익히고, 퀴즈로 배운 내용을 확인할 수 있어요.
        </p>
      </div>
    </section>
  );
}
