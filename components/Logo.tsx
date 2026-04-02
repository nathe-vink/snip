export default function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-lg bg-ink flex items-center justify-center">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
          <line x1="6" y1="4" x2="14" y2="16" />
          <line x1="18" y1="4" x2="10" y2="16" />
          <circle cx="4" cy="19" r="3" fill="none" />
          <circle cx="20" cy="19" r="3" fill="none" />
        </svg>
      </div>
      <span className="font-display text-xl font-medium text-ink tracking-tight">
        Snip
      </span>
    </div>
  );
}
