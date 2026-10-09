"use client";

import Link from "next/link";
import { useState } from "react";

import { SaveExpressionButton } from "@/components/save-expression-button";
import { ArrowUpRightIcon, CheckCircleIcon, XCircleIcon } from "@/components/icons";
import { highlightPhraseInText } from "@/lib/highlight-expressions";
import type { Expression } from "@/lib/mock-data";

export type QuizQuestionWithExpression = {
  id: string;
  phrase: string;
  correctMeaningKo: string;
  optionsKo: string[];
  expression: Expression;
};

export function QuizClient({
  questions,
  trendTitle,
  returnHref = "/",
}: {
  questions: QuizQuestionWithExpression[];
  trendTitle: string;
  returnHref?: string;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const question = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const isAnswerCorrect = selectedOption === question.correctMeaningKo;

  function handleSelect(option: string) {
    if (selectedOption) return;
    setSelectedOption(option);
    if (option === question.correctMeaningKo) {
      setScore((prev) => prev + 1);
    }
  }

  function handleNext() {
    if (isLastQuestion) {
      setFinished(true);
      return;
    }
    setCurrentIndex((prev) => prev + 1);
    setSelectedOption(null);
  }

  function handleRestart() {
    setCurrentIndex(0);
    setSelectedOption(null);
    setScore(0);
    setFinished(false);
  }

  if (finished) {
    return (
      <div className="surface-card flex flex-col items-center gap-6 p-10 text-center">
        <CheckCircleIcon className="h-10 w-10 text-obsidian" />
        <div>
          <p className="text-[12px] text-fog">퀴즈 완료</p>
          <p className="mt-2 text-[32px] font-semibold text-obsidian">
            {questions.length}문제 중 {score}개 정답
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button type="button" onClick={handleRestart} className="btn-ghost">
            다시 풀기
          </button>
          <Link href={returnHref} className="btn-primary">
            트렌드로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="surface-card flex flex-col gap-6 p-8 sm:p-10">
      <div className="flex items-center justify-between text-[12px] text-fog">
        <span>
          문제 {currentIndex + 1} / {questions.length}
        </span>
        <span>{score}개 정답</span>
      </div>

      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[12px] text-fog">이 표현은 무슨 뜻일까요?</p>
          <p className="mt-3 text-[32px] font-semibold leading-tight text-obsidian sm:text-[40px]">
            &ldquo;{question.phrase}&rdquo;
          </p>
        </div>
        <SaveExpressionButton
          expression={question.expression}
          trendTitle={trendTitle}
          variant="icon"
        />
      </div>

      <div className="flex flex-col gap-3">
        {question.optionsKo.map((option) => {
          const isSelected = selectedOption === option;
          const isCorrectOption = option === question.correctMeaningKo;
          const showState = selectedOption !== null;

          return (
            <button
              key={option}
              type="button"
              onClick={() => handleSelect(option)}
              disabled={showState}
              aria-pressed={isSelected}
              className={[
                "flex cursor-pointer items-center justify-between gap-3 rounded-inputs border px-5 py-4 text-left text-[14px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-obsidian",
                !showState && "border-cloud text-graphite hover:border-ash hover:bg-[#fafafa]",
                showState && isCorrectOption && "border-emerald-200 bg-emerald-50 text-emerald-800",
                showState &&
                  isSelected &&
                  !isCorrectOption &&
                  "border-rose-200 bg-rose-50 text-rose-800",
                showState && !isSelected && !isCorrectOption && "border-cloud text-ash",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <span>{option}</span>
              {showState && isCorrectOption && (
                <span className="flex shrink-0 items-center gap-1 text-[12px] font-medium text-emerald-700">
                  <CheckCircleIcon className="h-4 w-4" />
                  정답
                </span>
              )}
              {showState && isSelected && !isCorrectOption && (
                <span className="flex shrink-0 items-center gap-1 text-[12px] font-medium text-rose-700">
                  <XCircleIcon className="h-4 w-4" />
                  오답
                </span>
              )}
            </button>
          );
        })}
      </div>

      {selectedOption && (
        <div
          aria-live="polite"
          className="flex flex-col gap-4 rounded-cards border border-cloud bg-[#fafafa] p-5 text-[14px] leading-relaxed text-steel"
        >
          <p className={isAnswerCorrect ? "font-medium text-emerald-700" : "font-medium text-rose-700"}>
            {isAnswerCorrect
              ? "정답이에요!"
              : `오답이에요 — 정답은 "${question.phrase}" (${question.correctMeaningKo})예요.`}
          </p>

          <p>
            <span className="mr-2 text-[12px] text-fog">뉘앙스</span>
            {question.expression.nuance}
          </p>

          {question.expression.comparison && (
            <div className="surface-card-subtle p-4">
              <span className="mb-2 block text-[12px] text-fog">비슷하지만 다른 표현</span>
              <p className="font-medium text-graphite">
                &ldquo;{question.expression.comparison.phrase}&rdquo;
              </p>
              <p className="mt-1 text-fog">{question.expression.comparison.nuanceDiff}</p>
            </div>
          )}

          <div className="surface-card-subtle p-4">
            <span className="mb-2 block text-[12px] text-fog">예문</span>
            <p className="font-medium text-graphite">
              {highlightPhraseInText(question.expression.exampleEn, question.expression.phrase)}
            </p>
            <p className="mt-1 text-fog">{question.expression.exampleKo}</p>
          </div>
        </div>
      )}

      {selectedOption && (
        <button type="button" onClick={handleNext} className="btn-primary group self-end">
          {isLastQuestion ? "결과 보기" : "다음 문제"}
          <ArrowUpRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </button>
      )}
    </div>
  );
}
