// Browser-storage helpers backing the auto-exposure rules for the
// feedback modal (src/components/feedback-provider.tsx). Mirrors the
// try/catch-wrapped, SSR-safe pattern already used by
// src/lib/recent-trends.ts and src/lib/bookmarks.ts so a disabled or
// unavailable storage (private browsing, storage full, etc.) degrades
// to "treat as empty / not yet shown" instead of throwing.

const VIEWED_TRENDS_KEY = "catchy.feedback.viewedTrendIds.v1";
const SUBMITTED_KEY = "catchy.feedback.submitted.v1";
const AUTO_SHOWN_THIS_SESSION_KEY = "catchy.feedback.autoShownThisSession.v1";

function readViewedTrendIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(VIEWED_TRENDS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}

// Records a distinct trend content view (deduped by trend id, persisted
// across sessions in localStorage) and returns the updated distinct
// count. Viewing the same trend again is a no-op for the count.
export function recordFeedbackContentView(trendId: string): number {
  if (typeof window === "undefined") return 0;
  try {
    const existing = readViewedTrendIds();
    if (existing.includes(trendId)) return existing.length;
    const next = [...existing, trendId];
    window.localStorage.setItem(VIEWED_TRENDS_KEY, JSON.stringify(next));
    return next.length;
  } catch {
    return readViewedTrendIds().length;
  }
}

export function readFeedbackSubmitted(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(SUBMITTED_KEY) === "1";
  } catch {
    return false;
  }
}

export function writeFeedbackSubmitted(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SUBMITTED_KEY, "1");
  } catch {
    // ignore — storage unavailable
  }
}

export function readFeedbackAutoShownThisSession(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(AUTO_SHOWN_THIS_SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

export function writeFeedbackAutoShownThisSession(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(AUTO_SHOWN_THIS_SESSION_KEY, "1");
  } catch {
    // ignore — storage unavailable
  }
}
