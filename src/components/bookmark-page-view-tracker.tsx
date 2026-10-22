"use client";

import { useEffect, useRef } from "react";

import { areAnalyticsReady, trackBookmarkPageViewed } from "@/lib/mixpanel-client";

// The page component is mounted for both client-side navigation and direct
// URL visits. Wait briefly for both layout-level analytics initializers to
// finish so effect ordering cannot drop the page-entry event.
export function BookmarkPageViewTracker() {
  const trackedRef = useRef(false);

  useEffect(() => {
    if (trackedRef.current) return;

    const startedAt = Date.now();
    const intervalId = window.setInterval(() => {
      if (trackedRef.current) return;

      if (areAnalyticsReady() || Date.now() - startedAt >= 3000) {
        trackedRef.current = true;
        trackBookmarkPageViewed();
        window.clearInterval(intervalId);
      }
    }, 50);

    return () => window.clearInterval(intervalId);
  }, []);

  return null;
}
