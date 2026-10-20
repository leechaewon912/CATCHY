import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";

import { AmplitudeInit } from "@/components/amplitude-init";
import { BookmarksProvider } from "@/components/bookmarks-provider";
import { FeedbackProvider } from "@/components/feedback-provider";
import { MixpanelInit } from "@/components/mixpanel-init";

import "./globals.css";

// DESIGN.md specifies Cosmica with "Substitute: DM Sans" — Cosmica isn't
// a real distributable font, so DM Sans is the actual typeface used
// everywhere (single-font system, per DESIGN.md's "Don't break the
// single-font rule").
const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
    <html lang="ko" className={`${dmSans.variable} h-full antialiased`}>
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
