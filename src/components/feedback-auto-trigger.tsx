"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

import { useFeedback } from "@/components/feedback-provider";
import {
  readFeedbackAutoShownThisSession,
  readFeedbackSubmitted,
  recordFeedbackContentView,
} from "@/lib/feedback-storage";

// Wraps the trend detail page's <main> content (not the whole
// document — header/footer are siblings, outside this ref) so the 50%
// scroll threshold is computed against the actual content area, per
// the feedback spec. On mount it records this trend id as "viewed"
// (deduped — revisiting the same trend doesn't raise the distinct
// count) and becomes eligible once that distinct count reaches 2. Only
// an eligible, not-yet-submitted, not-yet-auto-shown-this-session page
// attaches the scroll listener at all — entering the page never opens
// the modal immediately, only crossing 50% does.
export function FeedbackAutoTrigger({
  trendId,
  children,
}: {
  trendId: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const { requestAutoOpen } = useFeedback();

  useEffect(() => {
    const distinctViewed = recordFeedbackContentView(trendId);
    const eligible = distinctViewed >= 2;
    if (!eligible || readFeedbackSubmitted() || readFeedbackAutoShownThisSession()) {
      return;
    }

    const el = ref.current;
    if (!el) return;

    let ticking = false;
    let fired = false;

    function checkScrollProgress() {
      ticking = false;
      if (fired || !el) return;

      const rect = el.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const contentHeight = rect.height;
      // Standard "reading progress" formula: how far the viewport has
      // moved into the content, as a fraction of the content's own
      // scrollable range (height minus one viewport). This is 0 right
      // when the content's top edge reaches the viewport top (so
      // landing on the page — even one taller than the viewport —
      // never starts above 0) and 1 once the content's bottom edge
      // reaches the viewport bottom.
      const scrolledIntoContent = -rect.top;
      const scrollableRange = contentHeight - viewportHeight;
      const progress =
        scrollableRange > 0
          ? scrolledIntoContent / scrollableRange
          : scrolledIntoContent > 0
            ? 1
            : 0;

      if (Math.min(Math.max(progress, 0), 1) >= 0.5) {
        fired = true;
        window.removeEventListener("scroll", handleScroll);
        requestAutoOpen();
      }
    }

    function handleScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(checkScrollProgress);
    }

    // Intentionally no initial/synchronous check here — only actual
    // scroll events can trigger the modal, so landing on the page
    // (even one short enough to render "half visible" without any
    // scrolling) never opens it immediately.
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
    // trendId only — requestAutoOpen re-validates submitted/session
    // state itself on every call, so it doesn't need to be a dep that
    // re-runs this setup.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trendId]);

  return (
    <main ref={ref} className="flex-1">
      {children}
    </main>
  );
}
