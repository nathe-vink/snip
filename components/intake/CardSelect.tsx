import type { BusinessType } from "@/lib/types";

interface CardSelectProps {
  options: BusinessType[];
  selected: string | undefined;
  onSelect: (id: string) => void;
}

export default function CardSelect({ options, selected, onSelect }: CardSelectProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map((b) => (
        <button
          key={b.id}
          onClick={() => onSelect(b.id)}
          className={`flex items-center gap-2.5 px-3.5 py-3 rounded-[10px] text-left cursor-pointer transition-colors ${
            selected === b.id
              ? "border-2 border-ink bg-sand"
              : "border-[1.5px] border-sand-dark bg-cream hover:bg-sand/50"
          }`}
        >
          <span className="text-xl w-7 text-center">{b.icon}</span>
          <div>
            <div className="font-body text-sm font-medium text-ink">{b.label}</div>
            <div className="font-body text-[11px] text-ink-muted">{b.sub}</div>
          </div>
        </button>
      ))}
    </div>
  );
}
