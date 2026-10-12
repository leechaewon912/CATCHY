"use client";

import { useEffect } from "react";
import mixpanel from "mixpanel-browser";

import { markMixpanelReady } from "@/lib/mixpanel-client";

// Module-level, not component state: survives React Strict Mode's
// dev-only double-invoke of effects (mount → cleanup → mount), which
// would otherwise call mixpanel.init() twice on every page load in
// development.
let initialized = false;

// Runs once on mount, client-side only — the Mixpanel Browser SDK needs
// `window` (cookies/localStorage for distinct id, DOM listeners for
// autocapture), so this can't run during server rendering.
export function MixpanelInit() {
  useEffect(() => {
    if (initialized) return;

    const token = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
    if (!token) {
      console.warn("[mixpanel] NEXT_PUBLIC_MIXPANEL_TOKEN is not set — skipping init");
      return;
    }

    initialized = true;
    mixpanel.init(token, {
      // Turns on all of click/input/scroll/submit autocapture plus
      // pageview tracking (default mode 'full-url') in one go.
      // Pageview tracking works across client-side route changes too —
      // Mixpanel patches history.pushState/replaceState and listens for
      // popstate, so Next.js App Router navigations (which use the
      // History API, not full page loads) still fire a new pageview.
      autocapture: true,
    });
    markMixpanelReady();
  }, []);

  return null;
}
