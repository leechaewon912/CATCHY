"use client";

import { useEffect, useState } from "react";

import { SaveExpressionButton } from "@/components/save-expression-button";
import type { Expression } from "@/lib/mock-data";

export function ExpressionDetailCard({
  expression,
  trendTitle,
}: {
  expression: Expression;
  trendTitle: string;
}) {
  const [isTarget, setIsTarget] = useState(false);

  useEffect(() => {
    function check() {
      setIsTarget(window.location.hash === `#${expression.id}`);
    }
    check();
    window.addEventListener("hashchange", check);
    return () => window.removeEventListener("hashchange", check);
  }, [expression.id]);

  return (
    <article
      id={expression.id}
      className={[
        "scroll-mt-24 rounded-2xl border bg-white/[0.03] p-6 transition-shadow sm:p-8",
        isTarget
          ? "border-lime-300 ring-2 ring-lime-300 ring-offset-2 ring-offset-[#0a0a0b]"
          : "border-white/10",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-2xl font-black leading-tight text-white sm:text-3xl">
            &ldquo;{expression.phrase}&rdquo;
          </p>
          <p className="mt-2 text-base font-semibold text-lime-300">
            {expression.meaning}
          </p>
        </div>
        <SaveExpressionButton expression={expression} trendTitle={trendTitle} />
      </div>

      <div className="my-5 h-px bg-white/10" />

      <div className="flex flex-col gap-4 text-sm leading-relaxed text-white/65">
        <p>
          <span className="mr-2 font-mono text-[11px] uppercase tracking-widest text-white/35">
            뉘앙스
          </span>
          {expression.nuance}
        </p>
        <p>
          <span className="mr-2 font-mono text-[11px] uppercase tracking-widest text-white/35">
            사용 상황
          </span>
          {expression.situation}
        </p>
        <div className="rounded-xl bg-white/[0.04] p-4">
          <span className="mb-2 block font-mono text-[11px] uppercase tracking-widest text-white/35">
            예문
          </span>
          <p className="font-medium text-white">{expression.example}</p>
          <p className="mt-1 text-white/50">{expression.exampleTranslation}</p>
        </div>
      </div>
    </article>
  );
}
