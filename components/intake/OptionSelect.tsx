import type { QuestionOption } from "@/lib/types";

interface OptionSelectProps {
  options: QuestionOption[];
  selected: string | undefined;
  onSelect: (id: string) => void;
}

export default function OptionSelect({ options, selected, onSelect }: OptionSelectProps) {
  return (
    <div className="grid gap-1.5">
      {options.map((o) => (
        <button
          key={o.id}
          onClick={() => onSelect(o.id)}
          className={`px-4 py-3.5 rounded-[10px] text-left cursor-pointer font-body text-[15px] text-ink transition-colors ${
            selected === o.id
              ? "border-2 border-ink bg-sand"
              : "border-[1.5px] border-sand-dark bg-cream hover:bg-sand/50"
          }`}
        >
          {o.l}
        </button>
      ))}
    </div>
  );
}
