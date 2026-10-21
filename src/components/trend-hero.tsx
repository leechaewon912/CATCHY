// Static value-prop banner — not tied to any specific trend. Content
// discovery happens via the ranked trend cards right below it (see
// src/app/page.tsx), so this only needs to convey what the service is.
export function TrendHero() {
  return (
    <section className="relative overflow-hidden bg-snow pt-10 pb-8 sm:pt-16 sm:pb-10">
      {/* Soft blue wash, white top through pale blue to a deliberately
          solid blue at the bottom — bottom color (#DCE5FF) is distinct
          from TrendFeed's cool-gray page background (--color-paper,
          #F3F5F8) on purpose, so the hero reads as its own section
          instead of blending into the feed below it. The pure-white
          band at the top (85%+) keeps the blue contained to the lower
          portion rather than spreading across the whole section. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: "linear-gradient(to top, #DCE5FF 0%, #F0F4FF 50%, #FFFFFF 85%)",
        }}
      />

      <div className="relative mx-auto max-w-5xl px-5 text-center sm:px-8">
        {/* Wider than the description below it so "Learn the Language."
            has room to stay on one line at tablet/desktop sizes instead
            of wrapping inside its own line. */}
        <h1
          className="motion-safe:animate-hero-fade-up mx-auto max-w-[1040px] break-keep font-extrabold tracking-tight text-obsidian"
          style={{ fontSize: "clamp(2rem, 0.72rem + 6vw, 5.5rem)", lineHeight: 1.1 }}
        >
          <span className="block">Catch the Culture.</span>
          <span className="block sm:whitespace-nowrap">Learn the Language.</span>
        </h1>

        <p className="text-kr-body motion-safe:animate-hero-fade-up-delay mx-auto mt-6 max-w-[580px] break-keep text-[16px] text-[#6B7280] sm:mt-7 sm:text-[18px] md:text-[19px] lg:text-[20px]">
          흥미로운 이야기 속에서 일상에 쓰이는 영어 표현을 발견해 보세요.
        </p>
      </div>
    </section>
  );
}
