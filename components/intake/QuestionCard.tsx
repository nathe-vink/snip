import type { Question, IntakeAnswers, BusinessType } from "@/lib/types";
import { BIZ_TYPES, NEIGHBORHOODS } from "@/lib/questions";
import CardSelect from "./CardSelect";
import OptionSelect from "./OptionSelect";

interface QuestionCardProps {
  question: Question;
  answers: IntakeAnswers;
  onAnswer: (value: string) => void;
}

export default function QuestionCard({ question, answers, onAnswer }: QuestionCardProps) {
  const value = answers[question.id];

  return (
    <div>
      <h2 className="font-display text-[26px] font-normal text-ink leading-[1.2] tracking-tight mb-1">
        {question.q}
      </h2>
      {question.sub ? (
        <p className="font-body text-sm text-ink-muted leading-relaxed mb-5">
          {question.sub}
        </p>
      ) : (
        <div className="h-4.5" />
      )}

      {question.type === "cards" && (
        <CardSelect
          options={BIZ_TYPES as BusinessType[]}
          selected={value}
          onSelect={onAnswer}
        />
      )}

      {question.type === "opts" && question.opts && (
        <OptionSelect
          options={question.opts}
          selected={value}
          onSelect={onAnswer}
        />
      )}

      {question.type === "select" && (
        <select
          value={value || ""}
          onChange={(e) => onAnswer(e.target.value)}
          className="w-full px-3.5 py-3.5 rounded-[10px] border-[1.5px] border-sand-dark bg-cream font-body text-[15px] text-ink outline-none"
        >
          <option value="">Select...</option>
          {NEIGHBORHOODS.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      )}

      {question.type === "email" && (
        <input
          type="email"
          value={value || ""}
          onChange={(e) => onAnswer(e.target.value)}
          placeholder="you@email.com"
          className="w-full px-3.5 py-3.5 rounded-[10px] border-[1.5px] border-sand-dark bg-cream font-body text-base text-ink outline-none"
        />
      )}
    </div>
  );
}
