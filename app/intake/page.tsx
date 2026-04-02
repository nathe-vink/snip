"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import ProgressBar from "@/components/intake/ProgressBar";
import QuestionCard from "@/components/intake/QuestionCard";
import { QUESTIONS } from "@/lib/questions";
import { buildRoadmap } from "@/lib/roadmap-generator";
import { storage } from "@/lib/storage";
import type { IntakeAnswers } from "@/lib/types";

export default function IntakePage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<IntakeAnswers>({});
  const [idx, setIdx] = useState(0);

  const visible = QUESTIONS.filter((q) => !q.showIf || q.showIf(answers));
  const cur = visible[idx];
  const isLast = idx === visible.length - 1;
  const has = cur && answers[cur.id] !== undefined && answers[cur.id] !== "";

  const handleAnswer = (value: string) => {
    setAnswers((prev) => ({ ...prev, [cur.id]: value }));
  };

  const handleNext = () => {
    if (isLast) {
      const roadmap = buildRoadmap(answers);
      storage.set("snip-session", { answers, roadmap });
      router.push("/roadmap");
    } else {
      setIdx((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (idx > 0) setIdx((prev) => prev - 1);
  };

  if (!cur) return null;

  return (
    <div className="bg-cream min-h-screen px-6 pt-7 pb-10">
      <div className="max-w-[520px] mx-auto">
        <Logo />
        <ProgressBar total={visible.length} current={idx} />
        <QuestionCard
          question={cur}
          answers={answers}
          onAnswer={handleAnswer}
        />

        {/* Navigation */}
        <div className="flex justify-between mt-7">
          <button
            onClick={handleBack}
            disabled={idx === 0}
            className={`px-4.5 py-2.5 rounded-lg border-[1.5px] border-sand-dark bg-transparent font-body text-sm cursor-pointer transition-colors ${
              idx === 0
                ? "text-ink-ghost cursor-default"
                : "text-ink-soft hover:bg-sand"
            }`}
          >
            ←
          </button>
          <button
            onClick={handleNext}
            disabled={!has}
            className={`px-6 py-2.5 rounded-lg border-none font-body text-sm font-medium cursor-pointer transition-colors ${
              has
                ? "bg-ink text-cream hover:bg-ink-soft"
                : "bg-sand-dark text-ink-muted cursor-default"
            }`}
          >
            {isLast ? "Generate roadmap →" : "→"}
          </button>
        </div>
      </div>
    </div>
  );
}
