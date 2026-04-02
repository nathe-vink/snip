import type { DoneOption } from "@/lib/types";

interface CompletionOptionsProps {
  options: DoneOption[];
  onSelect: (optionId: string) => void;
}

export default function CompletionOptions({ options, onSelect }: CompletionOptionsProps) {
  return (
    <div className="bg-sand rounded-lg p-3.5 mb-2.5">
      <div className="font-mono text-[10px] text-ink-muted mb-2 tracking-[0.04em]">
        What was your result?
      </div>
      <div className="grid gap-1.5">
        {options.map((o) => (
          <button
            key={o.id}
            onClick={() => onSelect(o.id)}
            className="px-3.5 py-2.5 rounded-lg border-[1.5px] border-sand-dark bg-cream font-body text-[13px] text-ink cursor-pointer text-left hover:bg-white transition-colors"
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
