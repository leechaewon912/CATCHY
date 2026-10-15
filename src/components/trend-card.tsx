"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import type { MouseEvent } from "react";
import { useState } from "react";

import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";
import { trackTrendClicked } from "@/lib/mixpanel-client";
import type { Category, Trend } from "@/lib/mock-data";

// public/images/mock/<prefix>-0{1..4}.png — one 4-photo set per category,
// seeded from the trend's own id so cards of the same category don't all
// open on the same frame.
const CATEGORY_IMAGE_PREFIX: Record<Category, string> = {
  "음악": "music",
  "영화·시리즈": "film",
  "밈·인터넷": "meme",
  "라이프스타일": "lifestyle",
  "테크·게임": "tech",
  "스포츠": "sports",
  "글로벌 이슈": "global",
};

function imagesForTrend(trend: Trend): string[] {
  const prefix = CATEGORY_IMAGE_PREFIX[trend.category];
  const all = [1, 2, 3, 4].map((n) => `/images/mock/${prefix}-0${n}.png`);
  const offset = trend.id.split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % all.length;
  return [...all.slice(offset), ...all.slice(0, offset)];
}

const SEOUL_DATE_FORMATTER = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  month: "long",
  day: "numeric",
});

const carouselVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? "100%" : "-100%", opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction < 0 ? "100%" : "-100%", opacity: 0 }),
};

// `position` is this card's 1-based rank among what's *currently
// displayed* in src/components/trend-feed.tsx — after the category/day
// filters there, not this trend's rank in the unfiltered feed — so
// trackTrendClicked always matches what the user actually sees.
export function TrendCard({ trend, position }: { trend: Trend; position: number }) {
  const images = imagesForTrend(trend);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  // The whole card is a <Link> (same as before this component had a photo
  // carousel), so every control inside it — arrows, dots — must stop the
  // click from bubbling into that Link's navigation. Same pattern as
  // SaveExpressionButton, which lives inside ExpressionCard's own <Link>.
  function changeImage(event: MouseEvent<HTMLButtonElement>, delta: number) {
    event.preventDefault();
    event.stopPropagation();
    setDirection(delta);
    setCurrentIndex((prev) => (prev + delta + images.length) % images.length);
  }

  function goToImage(event: MouseEvent<HTMLButtonElement>, index: number) {
    event.preventDefault();
    event.stopPropagation();
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  }

  function handleClick() {
    trackTrendClicked({
      trend_id: trend.id,
      category: trend.category,
      position,
    });
  }

  return (
    <Link
      href={`/trend/${trend.id}`}
      onClick={handleClick}
      className="surface-card group flex cursor-pointer flex-col overflow-hidden transition-colors hover:border-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-obsidian"
    >
      <div className="relative h-48 overflow-hidden">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={carouselVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="absolute inset-0"
          >
            <Image
              src={images[currentIndex]}
              alt={trend.title}
              fill
              sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-0 flex items-center justify-between p-2 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            onClick={(event) => changeImage(event, -1)}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-pills bg-obsidian/40 text-snow backdrop-blur-sm transition-colors hover:bg-obsidian/60"
            aria-label="이전 사진"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={(event) => changeImage(event, 1)}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-pills bg-obsidian/40 text-snow backdrop-blur-sm transition-colors hover:bg-obsidian/60"
            aria-label="다음 사진"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center gap-1 rounded-badges bg-snow/80 px-2 py-1 text-[12px] font-normal text-graphite backdrop-blur-sm">
            {trend.category}
          </span>
        </div>
        {position === 1 && (
          <div className="absolute top-3 right-3">
            <span className="badge-accent">오늘의 1위</span>
          </div>
        )}

        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
          {images.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={(event) => goToImage(event, index)}
              className={[
                "h-1.5 cursor-pointer rounded-pills transition-all",
                index === currentIndex ? "w-4 bg-snow" : "w-1.5 bg-snow/50",
              ].join(" ")}
              aria-label={`${index + 1}번째 사진으로 이동`}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="text-[18px] font-semibold leading-snug text-obsidian transition-colors group-hover:text-graphite">
          {trend.title}
        </h3>
        <p className="text-[13px] text-fog">
          {SEOUL_DATE_FORMATTER.format(new Date(trend.generatedAt))}
          {trend.sources[0] && ` · ${trend.sources[0].sourceName}`}
        </p>
        <p className="line-clamp-2 text-[14px] leading-relaxed text-fog">{trend.summary}</p>

        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-[12px] text-fog">표현 {trend.expressions.length}개</span>
          <span className="flex items-center gap-0.5 text-[13px] font-medium text-graphite transition-colors group-hover:text-obsidian">
            자세히 보기
            <ChevronRightIcon className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
