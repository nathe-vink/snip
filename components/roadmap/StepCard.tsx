import type { RoadmapStep, StepStatus } from "@/lib/types";
import FormStep from "./FormStep";
import WalkthroughStep from "./WalkthroughStep";
import ChecklistStep from "./ChecklistStep";
import CompletionOptions from "./CompletionOptions";
import CompletionField from "./CompletionField";
import HelpRequest from "./HelpRequest";

const PRIORITY_COLORS: Record<string, string> = {
  urgent: "text-red",
  high: "text-green",
  med: "text-amber",
  low: "text-ink-muted",
  info: "text-ink-muted",
};

const PRIORITY_BG: Record<string, string> = {
  urgent: "bg-red/5",
  high: "bg-green/5",
  med: "bg-amber/5",
  low: "bg-ink-muted/5",
  info: "bg-ink-muted/5",
};

const PRIORITY_LABELS: Record<string, string> = {
  urgent: "URGENT",
  high: "REQUIRED",
  med: "IMPORTANT",
  low: "WHEN READY",
  info: "FYI",
};

const CIRCLE_BG: Record<string, string> = {
  urgent: "bg-red/10 text-red",
  high: "bg-green/10 text-green",
  med: "bg-amber/10 text-amber",
  low: "bg-ink-muted/10 text-ink-muted",
  info: "bg-ink-muted/10 text-ink-muted",
};

interface StepCardProps {
  step: RoadmapStep;
  status: StepStatus;
  isOpen: boolean;
  onToggle: () => void;
  checks: Record<string, boolean>;
  onCheckToggle: (stepOrder: number, checkId: string) => void;
  doneValue: string;
  onDoneValueChange: (value: string) => void;
  onMarkDone: () => void;
  onDoneOptionSelect: (optionId: string) => void;
  defaultEmail: string;
}

export default function StepCard({
  step,
  status,
  isOpen,
  onToggle,
  checks,
  onCheckToggle,
  doneValue,
  onDoneValueChange,
  onMarkDone,
  onDoneOptionSelect,
  defaultEmail,
}: StepCardProps) {
  const isComplete = status === "complete";

  return (
    <div
      className={`rounded-[10px] overflow-hidden transition-colors ${
        isComplete ? "bg-green-soft" : "bg-cream"
      } ${
        isOpen
          ? `border-[1.5px] border-current/20 ${PRIORITY_COLORS[step.priority]}`
          : "border border-sand-dark"
      }`}
      style={isOpen ? { borderColor: `color-mix(in srgb, currentColor 20%, transparent)` } : undefined}
    >
      {/* Header */}
      <div
        onClick={onToggle}
        className="px-4 py-3.5 cursor-pointer flex items-center gap-3"
      >
        <div
          className={`w-[26px] h-[26px] rounded-full shrink-0 font-mono text-[11px] font-semibold flex items-center justify-center ${
            isComplete
              ? "bg-green text-white"
              : CIRCLE_BG[step.priority]
          }`}
        >
          {isComplete ? "✓" : step.order}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-display text-[15px] text-ink font-medium overflow-hidden text-ellipsis whitespace-nowrap">
            {step.name}
          </div>
          <div className="font-body text-[11px] text-ink-muted">
            {step.agency} · {step.cost} · {step.time}
          </div>
        </div>
        <span
          className={`font-mono text-[8px] font-bold tracking-[0.06em] px-[7px] py-[3px] rounded ${PRIORITY_COLORS[step.priority]} ${PRIORITY_BG[step.priority]}`}
        >
          {PRIORITY_LABELS[step.priority]}
        </span>
      </div>

      {/* Body */}
      {isOpen && (
        <div className="px-4 pb-4 border-t border-sand-dark pt-3.5">
          <p className="font-body text-sm text-ink-soft leading-[1.65] mb-3.5">
            {step.why}
          </p>

          {step.tip && (
            <div className="bg-green-soft rounded-lg px-3 py-2 mb-3">
              <span className="font-body text-[13px] text-green-dark">
                {step.tip}
              </span>
            </div>
          )}

          {step.type === "form" && step.fields && (
            <FormStep fields={step.fields} actions={step.actions} />
          )}

          {step.type === "walk" && step.walk && (
            <WalkthroughStep items={step.walk} />
          )}

          {step.type === "check" && step.checks && (
            <ChecklistStep
              items={step.checks}
              stepOrder={step.order}
              checks={checks}
              onToggle={onCheckToggle}
            />
          )}

          {step.done_options && (
            <CompletionOptions
              options={step.done_options}
              onSelect={onDoneOptionSelect}
            />
          )}

          {step.done_field && !isComplete && (
            <CompletionField
              field={step.done_field}
              value={doneValue}
              onChange={onDoneValueChange}
              onDone={onMarkDone}
            />
          )}

          <HelpRequest
            stepOrder={step.order}
            stepName={step.name}
            defaultEmail={defaultEmail}
          />
        </div>
      )}
    </div>
  );
}
