import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import localFont from "next/font/local";

import { AmplitudeInit } from "@/components/amplitude-init";
import { BookmarksProvider } from "@/components/bookmarks-provider";
import { FeedbackProvider } from "@/components/feedback-provider";
import { MixpanelInit } from "@/components/mixpanel-init";

import "./globals.css";

// DESIGN.md specifies Cosmica with "Substitute: DM Sans" — Cosmica isn't
// a real distributable font, so DM Sans is the actual typeface used for
// English/UI chrome everywhere (headings, buttons, nav, example-sentence
// English). This stays the default `font-sans` — unchanged.
const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Korean typography — self-hosted from the installed `pretendard` package
// (not next/font/google — Pretendard isn't on Google Fonts) so next/font
// still handles subsetting/preloading/font-display and reserves layout
// space via a size-adjusted fallback, avoiding CLS on load.
//
// Sits in globals.css's --font-sans fallback chain (after DM Sans) as of
// "Catchy 푸터 문구 변경 및 전체 서체 일관성 점검" — applies to Korean text
// site-wide now, not just the home/detail pages' opted-in .text-kr-body/
// .text-kr-subtitle classes (which still exist for their weight/line-
// height/letter-spacing rules, just no longer the only place Pretendard
// loads). 400/500/600 are loaded — 600 (SemiBold) was added alongside this
// because font-semibold Korean headings are used throughout the app (quiz,
// feedback modal, bookmarks, trend feed, and even the previously-themed
// detail page itself); without it those would've silently fallen back to
// a synthesized/mismatched weight instead of true Pretendard SemiBold. No
// weight 700 is loaded — nothing in the app uses font-bold on Korean text.
const pretendard = localFont({
  variable: "--font-pretendard",
  src: [
    {
      path: "../../node_modules/pretendard/dist/web/static/woff2/Pretendard-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../node_modules/pretendard/dist/web/static/woff2/Pretendard-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../node_modules/pretendard/dist/web/static/woff2/Pretendard-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
  ],
  display: "swap",
});

const SITE_TITLE = "CATCHY — 문화를 읽다, 영어를 발견하다.";
const SITE_DESCRIPTION =
  "음악부터 영화, 밈까지. 글로벌 컬처를 읽으며 살아있는 영어 표현을 만나보세요.";

export const metadata: Metadata = {
  // Base for every relative URL below (including the opengraph-image.tsx/
  // twitter-image.tsx file-convention images) — required for Next to
  // emit absolute og:image/twitter:image URLs instead of failing the
  // build. No custom domain is configured on Vercel yet (checked via
  // `vercel domains ls`), so this points at the stable production alias.
  metadataBase: new URL("https://catchy-three.vercel.app"),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    siteName: "CATCHY",
    locale: "ko_KR",
    type: "website",
    // No `images` here on purpose — src/app/opengraph-image.tsx already
    // supplies og:image/width/height/type automatically; redeclaring it
    // here would just be a second, easy-to-drift source of truth.
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    // Same reasoning as openGraph.images above — src/app/twitter-image.tsx
    // supplies this.
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${dmSans.variable} ${pretendard.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <AmplitudeInit />
        <MixpanelInit />
        <BookmarksProvider>
          <FeedbackProvider>{children}</FeedbackProvider>
        </BookmarksProvider>
      </body>
    </html>
  );
}
