"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import type { ReactNode } from "react";

import { FeedbackModal } from "@/components/feedback-modal";
import {
  readFeedbackAutoShownThisSession,
  readFeedbackSubmitted,
  writeFeedbackAutoShownThisSession,
  writeFeedbackSubmitted,
} from "@/lib/feedback-storage";
import {
  trackFeedbackModalDismissed,
  trackFeedbackModalViewed,
  trackFeedbackSubmitted,
} from "@/lib/mixpanel-client";

export type FeedbackSource = "auto" | "header";
export type FeedbackDismissMethod = "close" | "maybe_later" | "overlay" | "escape";
export type FeedbackView = "form" | "thanks";

type FeedbackContextValue = {
  // Always opens the modal, regardless of view-count/session state —
  // used by the header Feedback button. Doesn't count against the
  // once-per-session auto-exposure budget.
  openFeedback: () => void;
  // Called by the trend-detail scroll tracker once a page that's
  // eligible (2+ distinct trends viewed) has been scrolled past 50%.
  // Re-validates "not already submitted" / "not already auto-shown
  // this session" itself, so callers don't need to duplicate that
  // check — and marks the session as shown immediately, before any
  // network/async work, so it can never fire twice even if called
  // concurrently from more than one mounted tracker.
  requestAutoOpen: () => void;
};

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [source, setSource] = useState<FeedbackSource>("header");
  const [view, setView] = useState<FeedbackView>("form");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submittingRef = useRef(false);

  const openModal = useCallback((nextSource: FeedbackSource) => {
    setSource(nextSource);
    setRating(0);
    setComment("");
    setError(null);
    setView("form");
    setOpen(true);
    trackFeedbackModalViewed({ source: nextSource });
  }, []);

  const openFeedback = useCallback(() => {
    openModal("header");
  }, [openModal]);

  const requestAutoOpen = useCallback(() => {
    if (readFeedbackSubmitted()) return;
    if (readFeedbackAutoShownThisSession()) return;
    writeFeedbackAutoShownThisSession();
    openModal("auto");
  }, [openModal]);

  const handleClose = useCallback(
    (method: FeedbackDismissMethod) => {
      // Only a close-without-submitting counts as "dismissed" — once
      // the thank-you view is showing, feedback already saved, so
      // closing from there (including via Escape/overlay) isn't a
      // dismissal.
      if (view === "form") {
        trackFeedbackModalDismissed({ source, dismiss_method: method });
      }
      setOpen(false);
    },
    [source, view],
  );

  const handleConfirmThanks = useCallback(() => {
    setOpen(false);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (rating < 1 || submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          comment: comment.trim() || null,
          source,
        }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.ok) {
        throw new Error(data?.error || "제출에 실패했습니다. 다시 시도해 주세요.");
      }

      writeFeedbackSubmitted();
      trackFeedbackSubmitted({ rating, source });
      setView("thanks");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "제출에 실패했습니다. 다시 시도해 주세요.",
      );
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }, [rating, comment, source]);

  return (
    <FeedbackContext.Provider value={{ openFeedback, requestAutoOpen }}>
      {children}
      <FeedbackModal
        open={open}
        view={view}
        rating={rating}
        comment={comment}
        submitting={submitting}
        error={error}
        onRatingChange={setRating}
        onCommentChange={setComment}
        onSubmit={handleSubmit}
        onClose={handleClose}
        onConfirmThanks={handleConfirmThanks}
      />
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error("useFeedback must be used within a FeedbackProvider");
  }
  return context;
}
