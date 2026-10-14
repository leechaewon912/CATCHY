// Static value-prop banner — not tied to any specific trend. Content
// discovery happens via the ranked trend cards right below it (see
// src/app/page.tsx), so this only needs to convey what the service is.
export function TrendHero() {
  return (
    <section className="relative overflow-hidden bg-snow py-12 sm:py-16">
      {/* Pale blue wash rising from the bottom edge, fading to white well
          before the top — kept soft enough that the color boundary never
          reads as a hard edge. Intentionally inline and scoped to this
          section only — these accent colors are a trial direction, not
          tokens promoted into globals.css. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, #E3EBFF 0%, #F0F4FF 55%, #FFFFFF 90%)",
        }}
      />

      <div className="relative mx-auto max-w-5xl px-5 text-center sm:px-8">
        {/* Wider than the description below it so "Catch the language."
            has room to stay on one line at tablet/desktop sizes instead
            of wrapping inside its own line. */}
        <h1
          className="motion-safe:animate-hero-fade-up mx-auto max-w-[1040px] break-keep font-extrabold tracking-tight text-obsidian"
          style={{ fontSize: "clamp(2.375rem, 1.1rem + 6vw, 5.5rem)", lineHeight: 1.08 }}
        >
          <span className="block">Catch the trend.</span>
          <span className="block sm:whitespace-nowrap">Catch the language.</span>
        </h1>

        <p className="motion-safe:animate-hero-fade-up-delay mx-auto mt-6 max-w-[580px] break-keep text-[16px] font-normal leading-[1.6] text-[#6B7280] sm:mt-7 sm:text-[18px] md:text-[19px] lg:text-[20px]">
          해외에서 지금 화제가 되는 트렌드를 만나고, 그 속에서 실제로 쓰이는
          영어 표현까지 배워보세요.
        </p>
      </div>
    </section>
  );
}
