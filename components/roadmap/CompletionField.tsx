import type { DoneField } from "@/lib/types";

interface CompletionFieldProps {
  field: DoneField;
  value: string;
  onChange: (value: string) => void;
  onDone: () => void;
}

export default function CompletionField({ field, value, onChange, onDone }: CompletionFieldProps) {
  return (
    <div className="bg-sand rounded-lg p-3.5 mb-2.5">
      <label className="font-mono text-[10px] text-ink-muted tracking-[0.04em] block mb-1.5">
        {field.label}
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder={field.ph}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2.5 rounded-[7px] border-[1.5px] border-sand-dark font-mono text-[13px] outline-none"
        />
        <button
          onClick={onDone}
          className="px-3.5 py-2.5 rounded-[7px] bg-green text-white border-none font-body text-xs font-medium cursor-pointer whitespace-nowrap hover:bg-green-dark transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
}
