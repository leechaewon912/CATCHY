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
      <div className="flex flex-col items-center gap-6 rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center">
        <CheckCircleIcon className="h-10 w-10 text-lime-300" />
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-white/45">
            퀴즈 완료
          </p>
          <p className="mt-2 text-3xl font-black text-white">
            {questions.length}문제 중 {score}개 정답
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleRestart}
            className="cursor-pointer rounded-full border border-white/20 px-6 py-3 text-sm font-bold text-white transition-colors hover:border-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-300"
          >
            다시 풀기
          </button>
          <Link
            href={returnHref}
            className="cursor-pointer rounded-full bg-lime-300 px-6 py-3 text-sm font-bold text-black transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0b] focus-visible:ring-lime-300"
          >
            {returnHref === "/" ? "홈으로 돌아가기" : "트렌드로 돌아가기"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-white/[0.03] p-8 sm:p-10">
      <div className="flex items-center justify-between font-mono text-xs uppercase tracking-widest text-white/45">
        <span>
          문제 {currentIndex + 1} / {questions.length}
        </span>
        <span>{score}개 정답</span>
      </div>

      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-white/35">
          이 표현은 무슨 뜻일까요?
        </p>
        <p className="mt-3 text-3xl font-black leading-tight text-white sm:text-4xl">
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
                "cursor-pointer rounded-xl border px-5 py-4 text-left text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-300",
                !showState &&
                  "border-white/15 text-white hover:border-white/40 hover:bg-white/[0.04]",
                showState && isCorrect && "border-lime-300 bg-lime-300/10 text-lime-300",
                showState &&
                  isSelected &&
                  !isCorrect &&
                  "border-rose-400 bg-rose-400/10 text-rose-300",
                showState &&
                  !isSelected &&
                  !isCorrect &&
                  "border-white/10 text-white/40",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {option}
            </button>
          );
        })}
      </div>

      {selectedOption && (
        <button
          type="button"
          onClick={handleNext}
          className="group inline-flex w-fit cursor-pointer items-center gap-2 self-end rounded-full bg-lime-300 px-6 py-3 text-sm font-bold text-black transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0b] focus-visible:ring-lime-300"
        >
          {isLastQuestion ? "결과 보기" : "다음 문제"}
          <ArrowUpRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </button>
      )}
    </div>
  );
}
