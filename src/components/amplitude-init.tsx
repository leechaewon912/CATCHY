"use client";

import { useEffect } from "react";
import * as amplitude from "@amplitude/analytics-browser";

// Module-level, not component state: survives React Strict Mode's
// dev-only double-invoke of effects (mount → cleanup → mount), which
// would otherwise call amplitude.init() twice on every page load in
// development and double-fetch remote config.
let initialized = false;

// Runs once on mount, client-side only — Amplitude's Browser SDK needs
// `window` (cookies/localStorage for device id, DOM listeners for
// autocapture), so this can't run during server rendering.
export function AmplitudeInit() {
  useEffect(() => {
    if (initialized) return;

    const apiKey = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY;
    if (!apiKey) {
      console.warn("[amplitude] NEXT_PUBLIC_AMPLITUDE_API_KEY is not set — skipping init");
      return;
    }

    initialized = true;
    amplitude.init(apiKey, {
      autocapture: {
        // elementInteractions (clicks) defaults to false; pageViews and
        // formInteractions default to true but are listed explicitly
        // here so the intent (page views + clicks + form input, all
        // autocaptured) is visible at the call site.
        pageViews: true,
        formInteractions: true,
        elementInteractions: true,
      },
    });
  }, []);

  return null;
}
