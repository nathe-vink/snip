import type { CheckItem } from "@/lib/types";

interface ChecklistStepProps {
  items: CheckItem[];
  stepOrder: number;
  checks: Record<string, boolean>;
  onToggle: (stepOrder: number, checkId: string) => void;
}

export default function ChecklistStep({ items, stepOrder, checks, onToggle }: ChecklistStepProps) {
  return (
    <div className="mb-3.5">
      {items.map((c) => {
        const key = `${stepOrder}-${c.id}`;
        const done = checks[key] ?? false;
        return (
          <div
            key={c.id}
            className="flex gap-2.5 py-2.5 border-b border-sand items-start"
          >
            <div
              onClick={() => onToggle(stepOrder, c.id)}
              className={`w-5 h-5 rounded-[5px] shrink-0 cursor-pointer mt-0.5 flex items-center justify-center text-xs text-white transition-colors ${
                done
                  ? "border-2 border-green bg-green"
                  : "border-2 border-sand-dark bg-transparent"
              }`}
              role="checkbox"
              aria-checked={done}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onToggle(stepOrder, c.id);
                }
              }}
            >
              {done && "✓"}
            </div>
            <div>
              <p
                className={`font-body text-[13px] leading-relaxed ${
                  done
                    ? "text-ink-muted line-through"
                    : "text-ink-soft"
                }`}
              >
                {c.text}
              </p>
              {c.url && !done && (
                <a
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[11px] text-blue no-underline mt-0.5 inline-block hover:underline"
                >
                  {c.link || "Open →"}
                </a>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
