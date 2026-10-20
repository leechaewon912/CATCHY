import type { ReactElement } from "react";

// Mirrors src/components/trend-hero.tsx's gradient exactly (same color
// stops), since the hero itself has no image file to reuse — it's pure
// CSS. This keeps the OG image visually consistent with the live hero
// without touching the hero component itself.
const HERO_GRADIENT = "linear-gradient(to top, #DCE5FF 0%, #F0F4FF 50%, #FFFFFF 100%)";

// Shared by src/app/opengraph-image.tsx and src/app/twitter-image.tsx —
// both file conventions need their own default-exported Image()
// function, but the visual itself (and its "don't let text get clipped
// at 1200x630" sizing) only needs to be defined once.
//
// English-only by design: ImageResponse (Satori) renders with a generic
// Latin fallback font unless custom font data is embedded, and that
// fallback has no Korean glyph coverage — Korean text would render as
// empty boxes. The hero's English headline is already its single
// largest, most recognizable visual element, so this reuses exactly
// that instead of risking broken text.
export function HeroOgImage(): ReactElement {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage: HERO_GRADIENT,
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 56,
          left: 64,
          display: "flex",
          fontSize: 32,
          fontWeight: 700,
          color: "#09090b",
          letterSpacing: "-0.02em",
        }}
      >
        <span>CATCHY</span>
        <span style={{ color: "#ff5a00" }}>.</span>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "0 100px",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 72,
            fontWeight: 800,
            color: "#09090b",
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
          }}
        >
          Catch the Culture.
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 72,
            fontWeight: 800,
            color: "#09090b",
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
          }}
        >
          Learn the Language.
        </div>
      </div>
    </div>
  );
}
