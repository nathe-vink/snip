import type { WalkItem } from "@/lib/types";

interface WalkthroughStepProps {
  items: WalkItem[];
}

export default function WalkthroughStep({ items }: WalkthroughStepProps) {
  return (
    <div className="mb-3.5">
      {items.map((w, i) => (
        <div
          key={i}
          className={`flex gap-3 py-2.5 ${
            i < items.length - 1 ? "border-b border-sand" : ""
          }`}
        >
          <div className="w-[22px] h-[22px] rounded-full bg-sand shrink-0 font-mono text-[10px] text-ink-muted flex items-center justify-center mt-0.5">
            {i + 1}
          </div>
          <div>
            <p className="font-body text-[13px] text-ink-soft leading-relaxed">
              {w.text}
            </p>
            {w.url && (
              <a
                href={w.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[11px] text-blue no-underline mt-0.5 inline-block hover:underline"
              >
                {w.link || "Open →"}
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
