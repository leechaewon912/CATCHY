import { ImageResponse } from "next/og";

import { HeroOgImage } from "@/lib/og-image";

export const alt = "CATCHY — 문화를 읽다, 영어를 발견하다.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Same visual as opengraph-image.tsx (src/lib/og-image.tsx) — kept as a
// separate file because Twitter's card crawler looks for its own
// twitter-image convention rather than always falling back to og:image.
export default function Image() {
  return new ImageResponse(<HeroOgImage />, { ...size });
}
