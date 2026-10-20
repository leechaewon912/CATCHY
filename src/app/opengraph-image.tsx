import { ImageResponse } from "next/og";

import { HeroOgImage } from "@/lib/og-image";

export const alt = "CATCHY — 문화를 읽다, 영어를 발견하다.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// No dynamic params/data here, so Next statically generates this once
// at build time and caches it — not re-rendered per request.
export default function Image() {
  return new ImageResponse(<HeroOgImage />, { ...size });
}
