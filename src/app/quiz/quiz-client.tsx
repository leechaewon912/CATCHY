"use client";

import Link from "next/link";
import { useState } from "react";

import { ArrowUpRightIcon, CheckCircleIcon } from "@/components/icons";
import type { QuizQuestion } from "@/lib/mock-data";

export function QuizClient({
  questions,
  returnHref = "/",
}: {
  questions: QuizQuestion[];
  returnHref?: string;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const question = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  function handleSelect(option: string) {
    if (selectedOption) return;
    setSelectedOption(option);
    if (option === question.correctMeaning) {
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
          <p className="text-[12px] text-fog">
            퀴즈 완료
          </p>
          <p className="mt-2 text-[32px] font-semibold text-obsidian">
            {questions.length}문제 중 {score}개 정답
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleRestart}
            className="btn-ghost"
          >
            다시 풀기
          </button>
          <Link href={returnHref} className="btn-primary">
            {returnHref === "/" ? "홈으로 돌아가기" : "트렌드로 돌아가기"}
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

      <div>
        <p className="text-[12px] text-fog">
          이 표현은 무슨 뜻일까요?
        </p>
        <p className="mt-3 text-[32px] font-semibold leading-tight text-obsidian sm:text-[40px]">
          &ldquo;{question.phrase}&rdquo;
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {question.options.map((option) => {
          const isSelected = selectedOption === option;
          const isCorrect = option === question.correctMeaning;
          const showState = selectedOption !== null;

          return (
            <button
              key={option}
              type="button"
              onClick={() => handleSelect(option)}
              disabled={selectedOption !== null}
              className={[
                "flex cursor-pointer items-center justify-between gap-3 rounded-inputs border px-5 py-4 text-left text-[14px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-obsidian",
                !showState &&
                  "border-cloud text-graphite hover:border-ash hover:bg-[#fafafa]",
                showState && isCorrect && "border-obsidian bg-[#fafafa] text-obsidian",
                showState &&
                  isSelected &&
                  !isCorrect &&
                  "border-iron text-iron",
                showState &&
                  !isSelected &&
                  !isCorrect &&
                  "border-cloud text-ash",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {option}
              {showState && isCorrect && <CheckCircleIcon className="h-4 w-4 shrink-0 text-obsidian" />}
            </button>
          );
        })}
      </div>

      {selectedOption && (
        <button
          type="button"
          onClick={handleNext}
          className="btn-primary group self-end"
        >
          {isLastQuestion ? "결과 보기" : "다음 문제"}
          <ArrowUpRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </button>
      )}
    </div>
  );
}
