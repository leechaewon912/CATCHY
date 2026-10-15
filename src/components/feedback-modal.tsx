"use client";

import { useEffect, useRef, useState } from "react";

import { CloseIcon, StarIcon } from "@/components/icons";
import type { FeedbackDismissMethod, FeedbackView } from "@/components/feedback-provider";

const MAX_COMMENT_LENGTH = 500;

export function FeedbackModal({
  open,
  view,
  rating,
  comment,
  submitting,
  error,
  onRatingChange,
  onCommentChange,
  onSubmit,
  onClose,
  onConfirmThanks,
}: {
  open: boolean;
  view: FeedbackView;
  rating: number;
  comment: string;
  submitting: boolean;
  error: string | null;
  onRatingChange: (rating: number) => void;
  onCommentChange: (comment: string) => void;
  onSubmit: () => void;
  onClose: (method: FeedbackDismissMethod) => void;
  onConfirmThanks: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [hoverRating, setHoverRating] = useState(0);

  // Background-scroll lock while the modal is open — restores whatever
  // value body.style.overflow had before (almost always "") rather than
  // hardcoding it back to "", in case something else in the page is
  // also managing it.
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose("escape");
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-obsidian/50 transition-opacity sm:items-center sm:p-4"
      onClick={() => onClose("overlay")}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-modal-title"
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        className="flex max-h-[92vh] w-full flex-col overflow-y-auto rounded-t-[24px] bg-snow pb-[max(24px,env(safe-area-inset-bottom))] outline-none sm:max-h-[85vh] sm:w-[420px] sm:rounded-[24px] sm:pb-7"
        style={{ boxShadow: "0 24px 64px rgba(23, 20, 15, 0.22)" }}
      >
        <div className="flex items-start justify-between gap-4 px-6 pt-5 sm:px-8 sm:pt-6">
          <div className="flex flex-col gap-1">
            <h2
              id="feedback-modal-title"
              className="text-[20px] font-semibold leading-snug text-obsidian"
            >
              Catchy에 대한 의견을 들려주세요
            </h2>
            <p className="text-[13px] font-normal leading-snug text-fog">
              여러분의 솔직한 의견이 궁금해요.
            </p>
          </div>
          <button
            type="button"
            aria-label="닫기"
            onClick={() => onClose("close")}
            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-fog transition-colors hover:text-graphite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-obsidian"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        {view === "form" ? (
          <div className="flex flex-col gap-5 px-6 pb-6 pt-4 sm:px-8 sm:pb-7">
            <div
              className="flex items-center gap-1"
              onMouseLeave={() => setHoverRating(0)}
            >
              {[1, 2, 3, 4, 5].map((value) => {
                const filled = (hoverRating || rating) >= value;
                return (
                  <button
                    key={value}
                    type="button"
                    aria-label={`${value}점`}
                    aria-pressed={rating === value}
                    onMouseEnter={() => setHoverRating(value)}
                    onClick={() => onRatingChange(value)}
                    className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-obsidian"
                  >
                    <StarIcon
                      filled={filled}
                      className={`h-7 w-7 ${filled ? "text-obsidian" : "text-ash"}`}
                    />
                  </button>
                );
              })}
            </div>

            <div>
              <label
                htmlFor="feedback-comment"
                className="mb-2 block text-[13px] font-medium text-graphite"
              >
                자세한 의견을 들려주세요 (선택)
              </label>
              <textarea
                id="feedback-comment"
                value={comment}
                maxLength={MAX_COMMENT_LENGTH}
                onChange={(event) => onCommentChange(event.target.value)}
                placeholder="좋았던 점이나 아쉬웠던 점을 자유롭게 알려주세요."
                rows={4}
                className="field-input w-full resize-none text-[14px] placeholder:text-ash focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-obsidian"
              />
              <p className="mt-1.5 text-right text-[12px] text-ash">
                {comment.length}/{MAX_COMMENT_LENGTH}
              </p>
            </div>

            {error && (
              <p role="alert" className="text-[13px] text-terracotta">
                {error}
              </p>
            )}

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => onClose("maybe_later")}
                className="inline-flex w-full items-center justify-center rounded-[12px] border border-cloud bg-snow px-5 py-3 text-[14px] font-medium text-graphite transition-colors hover:border-ash focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-snow focus-visible:ring-obsidian sm:flex-1"
              >
                나중에 하기
              </button>
              <button
                type="button"
                onClick={onSubmit}
                disabled={rating < 1 || submitting}
                className="inline-flex w-full items-center justify-center rounded-[12px] bg-obsidian px-5 py-3 text-[14px] font-medium text-snow transition-colors hover:bg-graphite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-snow focus-visible:ring-obsidian disabled:cursor-not-allowed disabled:bg-cloud disabled:text-ash sm:flex-1"
              >
                {submitting ? "제출 중..." : "피드백 보내기"}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 px-6 pb-8 pt-4 text-center sm:px-8">
            <h3 className="text-[18px] font-semibold text-obsidian">
              소중한 의견 감사합니다!
            </h3>
            <p className="text-[14px] leading-relaxed text-fog">
              보내주신 의견을 바탕으로
              <br />
              더 나은 Catchy를 만들어 갈게요.
            </p>
            <button
              type="button"
              onClick={onConfirmThanks}
              className="btn-primary mt-4 w-full sm:w-fit"
            >
              확인
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
