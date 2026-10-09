import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";

import { AmplitudeInit } from "@/components/amplitude-init";
import { BookmarksProvider } from "@/components/bookmarks-provider";

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

export const metadata: Metadata = {
  title: "CATCHY — 트렌드로 배우는 진짜 영어",
  description:
    "관심 있는 글로벌 트렌드를 따라가며 실제로 쓰이는 영어 표현과 문화적 맥락을 익히는 AI 영어 학습 서비스",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${dmSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <AmplitudeInit />
        <BookmarksProvider>{children}</BookmarksProvider>
      </body>
    </html>
  );
}
