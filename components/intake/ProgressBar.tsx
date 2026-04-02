interface ProgressBarProps {
  total: number;
  current: number;
}

export default function ProgressBar({ total, current }: ProgressBarProps) {
  return (
    <div className="flex gap-[3px] my-8">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`flex-1 h-[3px] rounded-sm transition-colors duration-300 ${
            i <= current ? "bg-ink" : "bg-sand-dark"
          }`}
        />
      ))}
    </div>
  );
}
