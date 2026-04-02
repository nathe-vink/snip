"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import ProgressTracker from "@/components/roadmap/ProgressTracker";
import StepCard from "@/components/roadmap/StepCard";
import { storage } from "@/lib/storage";
import type { IntakeAnswers, RoadmapResult, StepStatus } from "@/lib/types";

interface Session {
  answers: IntakeAnswers;
  roadmap: RoadmapResult;
}

interface Progress {
  checks: Record<string, boolean>;
  statuses: Record<number, StepStatus>;
  doneVals: Record<number, string>;
}

export default function RoadmapPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [statuses, setStatuses] = useState<Record<number, StepStatus>>({});
  const [doneVals, setDoneVals] = useState<Record<number, string>>({});
  const [openStep, setOpenStep] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Load session and progress
  useEffect(() => {
    const s = storage.get<Session>("snip-session");
    if (!s?.roadmap) {
      router.push("/");
      return;
    }
    setSession(s);

    const p = storage.get<Progress>("snip-progress");
    if (p) {
      if (p.checks) setChecks(p.checks);
      if (p.statuses) setStatuses(p.statuses);
      if (p.doneVals) setDoneVals(p.doneVals);
    }
    setLoaded(true);
  }, [router]);

  // Save progress on changes
  useEffect(() => {
    if (!loaded) return;
    storage.set("snip-progress", { checks, statuses, doneVals });
  }, [checks, statuses, doneVals, loaded]);

  const handleCheckToggle = (stepOrder: number, checkId: string) => {
    const key = `${stepOrder}-${checkId}`;
    setChecks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const markDone = (order: number) => {
    setStatuses((prev) => ({ ...prev, [order]: "complete" as StepStatus }));
  };

  const handleDoneOptionSelect = (order: number, optionId: string) => {
    if (optionId === "p") markDone(order);
  };

  const handleStartOver = () => {
    storage.remove("snip-session");
    storage.remove("snip-progress");
    router.push("/");
  };

  if (!loaded || !session) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <span className="font-body text-ink-muted">Loading...</span>
      </div>
    );
  }

  const { roadmap, answers } = session;
  const completedCount = Object.values(statuses).filter((s) => s === "complete").length;

  return (
    <div className="bg-cream min-h-screen px-6 pt-7 pb-10">
      <div className="max-w-[620px] mx-auto">
        <Logo />

        {/* Header */}
        <div className="mt-8 mb-5">
          <div className="font-mono text-[10px] text-ink-muted tracking-[0.06em] uppercase mb-1.5">
            Your launch roadmap
          </div>
          <h1 className="font-display text-[28px] font-normal text-ink tracking-tight">
            {roadmap.sum.bizLabel}
          </h1>
          <p className="font-body text-sm text-ink-muted mt-1">
            {answers.hood || "San Francisco"} · {roadmap.sum.total} steps · {roadmap.sum.cost} · {roadmap.sum.time}
          </p>
        </div>

        <ProgressTracker total={roadmap.steps.length} completed={completedCount} />

        {/* Warnings */}
        {roadmap.warns.length > 0 && (
          <div className="bg-amber-soft border border-amber/40 rounded-[10px] p-3.5 mb-4">
            {roadmap.warns.map((w, i) => (
              <p key={i} className={`font-body text-[13px] text-amber leading-relaxed ${i > 0 ? "mt-1.5" : ""}`}>
                ⚠ {w}
              </p>
            ))}
          </div>
        )}

        {/* Steps */}
        <div className="grid gap-1.5">
          {roadmap.steps.map((step) => (
            <StepCard
              key={step.order}
              step={step}
              status={statuses[step.order] || "not_started"}
              isOpen={openStep === step.order}
              onToggle={() => setOpenStep(openStep === step.order ? null : step.order)}
              checks={checks}
              onCheckToggle={handleCheckToggle}
              doneValue={doneVals[step.order] || ""}
              onDoneValueChange={(v) => setDoneVals((prev) => ({ ...prev, [step.order]: v }))}
              onMarkDone={() => markDone(step.order)}
              onDoneOptionSelect={(optionId) => handleDoneOptionSelect(step.order, optionId)}
              defaultEmail={answers.email || ""}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-7 bg-ink rounded-xl px-6 py-5 flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="font-display text-[17px] text-cream font-normal">
              Feeling stuck?
            </p>
            <p className="font-body text-xs text-ink-muted mt-0.5">
              Free 15-min call. We&apos;ll figure it out together.
            </p>
          </div>
          <button className="px-5 py-2.5 rounded-lg border-none bg-cream text-ink font-body text-[13px] font-medium cursor-pointer hover:bg-sand transition-colors">
            Book a call
          </button>
        </div>

        {/* Footer */}
        <p className="font-body text-[10px] text-ink-faint text-center mt-7 leading-relaxed">
          Snip · Free for everyone · White glove service available<br />
          Registered permit consultant · SF Ethics Commission<br />
          <button
            onClick={handleStartOver}
            className="cursor-pointer underline text-ink-muted bg-transparent border-none font-body text-[10px]"
          >
            Start over with a new business
          </button>
        </p>
      </div>
    </div>
  );
}
