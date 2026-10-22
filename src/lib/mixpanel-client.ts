import mixpanel from "mixpanel-browser";
import * as amplitude from "@amplitude/analytics-browser";

import type { Category } from "@/lib/mock-data";

// This file's name predates Amplitude being added here — kept as-is
// (not renamed) to avoid touching every file that imports trackXxx()
// below for a cosmetic rename. Every trackXxx() fans out to both
// vendors from this one shared `track()` so the two tools get identical
// event names/properties/trigger conditions and stay comparable,
// without duplicating a single call site across the app.

// Flipped by MixpanelInit (src/components/mixpanel-init.tsx) /
// AmplitudeInit (src/components/amplitude-init.tsx) once each SDK's
// own init() has actually run. Every trackXxx() below checks these
// first and no-ops per-vendor otherwise, so a custom event fired from
// some component's mount effect can never reach an uninitialized SDK
// instance — an explicit gate rather than relying on effect ordering
// between the Init components and whichever page happens to mount.
let mixpanelReady = false;
let amplitudeReady = false;

export function markMixpanelReady(): void {
  mixpanelReady = true;
}

export function markAmplitudeReady(): void {
  amplitudeReady = true;
}

export function areAnalyticsReady(): boolean {
  return mixpanelReady && amplitudeReady;
}

function track(event: string, properties: Record<string, unknown>): void {
  if (mixpanelReady) {
    try {
      mixpanel.track(event, properties);
    } catch (error) {
      console.error(`[mixpanel] failed to track "${event}"`, error);
    }
  }
  if (amplitudeReady) {
    try {
      amplitude.track(event, properties);
    } catch (error) {
      console.error(`[amplitude] failed to track "${event}"`, error);
    }
  }
}

// Fired when a trend card in the home feed is clicked, just before the
// Link navigates to its detail page.
export function trackTrendClicked(props: {
  trend_id: string;
  category: Category;
  position: number;
}): void {
  track("trend_clicked", props);
}

// Fired once per detail-page visit, the first time the "이 트렌드에서
// 배우는 표현" section scrolls to >=50% visible (src/components/
// expression-section-tracker.tsx).
export function trackExpressionViewed(props: {
  trend_id: string;
  category: Category;
}): void {
  track("expression_viewed", props);
}

// Fired when the user interacts with an expression to look at it more
// closely — clicking its card on the home carousel (src/components/
// expression-card.tsx) or clicking its highlighted phrase inside a
// trend's English summary (src/components/english-summary.tsx).
// interaction_type disambiguates which of those two it was.
export function trackExpressionClicked(props: {
  expression_id: string;
  trend_id: string;
  category: Category;
  interaction_type: "home_card" | "highlighted_phrase";
}): void {
  track("expression_clicked", props);
}

// Fired when the save/bookmark button (src/components/
// save-expression-button.tsx) actually saves an expression — i.e. only
// on the unsaved -> saved transition, never on unsaving. Separate from
// expression_clicked: saving is a stronger, more deliberate signal than
// clicking to look at something.
export function trackExpressionSaved(props: {
  expression_id: string;
  trend_id: string;
  category: Category;
}): void {
  track("expression_saved", props);
}

// Fired once when the saved-expressions page is entered, whether the user
// arrived through the bookmark navigation link or a direct/bookmarked URL.
// There is intentionally no expression-level property here: this event is
// about opening the page, not opening one saved expression.
export function trackBookmarkPageViewed(): void {
  track("bookmark_page_viewed", {});
}

// Fired when the feedback modal (src/components/feedback-modal.tsx) is
// actually displayed — once per open, whether auto-shown after 2+
// distinct trends viewed + 50% scroll, or opened via the header
// Feedback button.
export function trackFeedbackModalViewed(props: { source: "auto" | "header" }): void {
  track("Feedback Modal Viewed", props);
}

// Fired once feedback has actually saved to Supabase (never before —
// see src/app/api/feedback/route.ts). comment text itself is never
// included here.
export function trackFeedbackSubmitted(props: {
  rating: number;
  source: "auto" | "header";
}): void {
  track("Feedback Submitted", props);
}

// Fired when the modal is closed without submitting — the X button,
// "나중에 하기", an overlay click, or Escape.
export function trackFeedbackModalDismissed(props: {
  source: "auto" | "header";
  dismiss_method: "close" | "maybe_later" | "overlay" | "escape";
}): void {
  track("Feedback Modal Dismissed", props);
}

// Fired once when a quiz's question UI actually mounts (src/app/quiz/
// quiz-client.tsx) — not on a bare /quiz picker visit, which never
// renders QuizClient.
export function trackQuizStarted(props: {
  quiz_id: string;
  entry_point: string;
}): void {
  track("quiz_started", props);
}

// Fired once per completion (the finished-screen transition), not on
// every re-render while already finished, and not on abandoning a quiz
// partway through.
export function trackQuizCompleted(props: {
  quiz_id: string;
  score: number;
  question_count: number;
}): void {
  track("quiz_completed", props);
}

// The events below use the same shared track() path as the existing funnel
// events, so Amplitude and Mixpanel receive identical names and properties.

// Fired when the user actually clicks a category filter chip
// (src/components/trend-feed.tsx) — never on the page's initial
// "전체" default or on re-selecting the chip that's already active
// (the call site checks `category !== selectedCategory` before
// calling this, using the pre-update state as previous_category).
export function trackCategorySelected(props: {
  category_name: string;
  previous_category: string;
}): void {
  track("category_selected", props);
}

// Fired when the user actually clicks a day filter tab
// (src/components/trend-feed.tsx) — same "skip the initial value and
// re-selecting the same day" guard as trackCategorySelected above.
export function trackDayFilterSelected(props: {
  selected_day: string;
  previous_day: string;
}): void {
  track("day_filter_selected", props);
}

// Fired once per detail-page visit, when the end of the editorial body
// (English + Korean summary — not the expressions section or sources
// footer) scrolls into view (src/components/story-read-tracker.tsx).
// This means "reached the end of the body," not "read every word."
export function trackStoryReadCompleted(props: {
  story_id: string;
  story_title: string;
  category_name: string;
  reading_time_seconds: number;
}): void {
  track("story_read_completed", props);
}
