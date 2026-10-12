import mixpanel from "mixpanel-browser";

import type { Category } from "@/lib/mock-data";

// Flipped by MixpanelInit (src/components/mixpanel-init.tsx) once
// mixpanel.init() has actually run. Every trackXxx() below checks this
// first and no-ops otherwise, so a custom event fired from some
// component's mount effect can never reach an uninitialized SDK
// instance — it's an explicit gate rather than relying on effect
// ordering between MixpanelInit and whichever page happens to mount.
let ready = false;

export function markMixpanelReady(): void {
  ready = true;
}

function track(event: string, properties: Record<string, unknown>): void {
  if (!ready) return;
  try {
    mixpanel.track(event, properties);
  } catch (error) {
    console.error(`[mixpanel] failed to track "${event}"`, error);
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
