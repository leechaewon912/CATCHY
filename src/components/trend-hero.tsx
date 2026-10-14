// Static value-prop banner — not tied to any specific trend. Content
// discovery happens via the ranked trend cards right below it (see
// src/app/page.tsx), so this only needs to convey what the service is.
export function TrendHero() {
  return (
    <section className="relative overflow-hidden bg-[#fafafa] py-14 sm:py-20">
      {/* Soft blue/lime glow — intentionally inline and scoped to this
          section only; these accent colors are a trial direction, not
          tokens promoted into globals.css. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(55% 60% at 50% -10%, rgba(74,99,255,0.08), transparent 70%), radial-gradient(40% 45% at 90% 110%, rgba(200,255,53,0.12), transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-3xl px-5 text-center sm:px-8">
        <h1 className="motion-safe:animate-hero-fade-up break-keep text-[38px] font-extrabold leading-[1.08] tracking-tight text-obsidian sm:text-[56px] md:text-[72px] lg:text-[88px]">
          Catch the trend.
          <br />
          Catch the language.
        </h1>

        <p className="motion-safe:animate-hero-fade-up-delay mt-5 break-keep text-[15px] leading-relaxed text-steel sm:mt-6 sm:text-[18px] md:text-[19px]">
          트렌드를 읽다, 영어를 발견하다.
        </p>
      </div>
    </section>
  );
}
