interface ProgressTrackerProps {
  total: number;
  completed: number;
}

export default function ProgressTracker({ total, completed }: ProgressTrackerProps) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="mb-6">
      <div className="flex justify-between mb-1.5">
        <span className="font-mono text-[10px] text-ink-muted tracking-[0.04em]">
          {completed} of {total} complete
        </span>
        <span className="font-mono text-[10px] text-green">
          {pct}%
        </span>
      </div>
      <div className="h-[5px] bg-sand-dark rounded-sm overflow-hidden">
        <div
          className="h-full bg-green rounded-sm transition-[width] duration-400 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
