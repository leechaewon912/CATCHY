import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { BookmarksProvider } from "@/components/bookmarks-provider";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CATCHY — 트렌드로 배우는 진짜 영어",
  description:
    "관심 있는 글로벌 트렌드를 따라가며 실제로 쓰이는 영어 표현과 문화적 맥락을 익히는 AI 영어 학습 서비스",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <BookmarksProvider>{children}</BookmarksProvider>
      </body>
    </html>
  );
}
