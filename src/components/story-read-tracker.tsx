"use client";

import { useEffect, useRef } from "react";

import { trackStoryReadCompleted } from "@/lib/mixpanel-client";
import type { Category } from "@/lib/mock-data";

// Marks the actual end of the editorial body (English + Korean summary
// boxes) on the trend detail page — placed right after the Korean
// summary paragraph, before the "출처 보기" link / "이 이야기에서 배우는
// 표현" section / footer, so this never fires for scrolling past the
// expressions or sources instead of the story text itself.
//
// Renders a zero-size marker (no padding/margin/children) so it adds no
// visual footprint and never affects scroll position or layout — same
// "invisible IntersectionObserver target" approach as
// expression-section-tracker.tsx, just a bare sentinel instead of a
// wrapper around existing content, since this needs to sit at a single
// point rather than wrap a block.
//
// story_read_completed means "the reader scrolled the body's end into
// view" — not that they actually read every word. reading_time_seconds
// is measured from this component's own mount (effectively page load,
// since it hydrates as part of the initial render) to the moment the
// marker crosses into view; it's a scroll-pace proxy, not a precise
// "time spent reading" measurement.
export function StoryReadTracker({
  storyId,
  storyTitle,
  category,
}: {
  storyId: string;
  storyTitle: string;
  category: Category;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const trackedRef = useRef(false);
  // Captured inside the effect below (not during render, which must
  // stay pure) — runs once on mount, close enough to page-entry time
  // for a scroll-pace proxy like this.
  const enteredAtRef = useRef<number | null>(null);

  useEffect(() => {
    enteredAtRef.current = Date.now();
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        // threshold 0: this is a bare point marker (no height of its
        // own), not a section to track 50%-visible like
        // ExpressionSectionTracker — "도달" just means it entered the
        // viewport at all.
        if (entry.isIntersecting && !trackedRef.current) {
          trackedRef.current = true;
          const enteredAt = enteredAtRef.current ?? Date.now();
          trackStoryReadCompleted({
            story_id: storyId,
            story_title: storyTitle,
            category_name: category,
            reading_time_seconds: Math.round((Date.now() - enteredAt) / 1000),
          });
          observer.disconnect();
        }
      },
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [storyId, storyTitle, category]);

  return <div ref={ref} aria-hidden="true" />;
}
