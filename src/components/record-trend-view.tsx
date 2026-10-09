"use client";

import { useEffect } from "react";

import { recordTrendView } from "@/lib/recent-trends";

// Renders nothing — just records this trend as "recently viewed" in
// localStorage on mount, so /quiz can prioritize it. No login/DB
// involved, and nothing here blocks or delays the page's own render.
export function RecordTrendView({ trendId }: { trendId: string }) {
  useEffect(() => {
    recordTrendView(trendId);
  }, [trendId]);

  return null;
}
