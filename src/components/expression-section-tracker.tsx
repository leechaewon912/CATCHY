"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { trackExpressionViewed } from "@/lib/mixpanel-client";
import type { Category } from "@/lib/mock-data";

// Wraps the trend detail page's "이 트렌드에서 배우는 표현" heading
// block (not the full card list below it — see the comment at its call
// site in src/app/trend/[id]/page.tsx for why) with an invisible ref
// target, purely so an IntersectionObserver can fire expression_viewed
// once this section is actually scrolled into view. Renders a plain
// <div> around its children with no classes of its own, so it adds no
// visual footprint — the heading/paragraph keep their own margins.
export function ExpressionSectionTracker({
  trendId,
  category,
  children,
}: {
  trendId: string;
  category: Category;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const trackedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        // threshold: 0.5 means this callback only fires once the
        // element crosses the 50%-visible boundary (in either
        // direction) — isIntersecting is true exactly when it's at or
        // above that threshold, matching "50% 이상 노출".
        if (entry.isIntersecting && !trackedRef.current) {
          trackedRef.current = true;
          trackExpressionViewed({ trend_id: trendId, category });
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [trendId, category]);

  return <div ref={ref}>{children}</div>;
}
