"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { storage } from "@/lib/storage";

export default function Landing() {
  const router = useRouter();
  const [hasRoadmap, setHasRoadmap] = useState(false);

  useEffect(() => {
    const session = storage.get<{ roadmap: unknown }>("snip-session");
    if (session?.roadmap) setHasRoadmap(true);
  }, []);

  return (
    <div className="bg-cream min-h-screen">
      {/* Nav */}
      <div className="max-w-[720px] mx-auto px-6 pt-7 flex justify-between items-center">
        <Logo />
        <span className="font-mono text-[11px] text-ink-muted tracking-[0.04em]">
          SAN FRANCISCO
        </span>
      </div>

      {/* Hero */}
      <div className="max-w-[720px] mx-auto px-6 pt-20 pb-15">
        <h1 className="font-display text-5xl font-normal text-ink leading-[1.1] tracking-tight max-w-[560px]">
          Every permit.<br />One place.
        </h1>
        <p className="font-body text-lg text-ink-soft leading-relaxed mt-5 max-w-[480px]">
          Opening a business in San Francisco means navigating 12+ city agencies,
          dozens of permits, and months of paperwork. Snip maps your entire journey
          and walks you through each step.
        </p>
        <p className="font-body text-[15px] text-ink-muted leading-relaxed mt-3 max-w-[480px]">
          Free for everyone. Takes 2 minutes.
        </p>
        <div className="flex gap-3 mt-8 flex-wrap">
          <button
            onClick={() => router.push("/intake")}
            className="font-body text-base font-medium px-8 py-3.5 rounded-[10px] border-none bg-ink text-cream cursor-pointer tracking-tight hover:bg-ink-soft transition-colors"
          >
            Build my roadmap →
          </button>
          {hasRoadmap && (
            <button
              onClick={() => router.push("/roadmap")}
              className="font-body text-base font-medium px-8 py-3.5 rounded-[10px] border-[1.5px] border-ink bg-transparent text-ink cursor-pointer tracking-tight hover:bg-sand transition-colors"
            >
              Resume my roadmap →
            </button>
          )}
        </div>
      </div>

      {/* How it works */}
      <div className="max-w-[720px] mx-auto px-6 pb-15">
        <div className="grid grid-cols-3 gap-5">
          {[
            { n: "01", title: "Answer a few questions", sub: "Business type, location, and what you'll offer. 2 minutes." },
            { n: "02", title: "Get your roadmap", sub: "Every permit, license, and registration — in the right order, with direct links." },
            { n: "03", title: "Do it yourself or get help", sub: "Each step is a guided workflow. Stuck? Our team handles it for you." },
          ].map((s) => (
            <div key={s.n} className="p-6 bg-sand rounded-xl">
              <div className="font-mono text-[11px] text-ink-muted tracking-[0.06em] mb-2.5">
                {s.n}
              </div>
              <div className="font-display text-[17px] text-ink font-medium mb-1.5">
                {s.title}
              </div>
              <div className="font-body text-[13px] text-ink-muted leading-relaxed">
                {s.sub}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Social proof */}
      <div className="max-w-[720px] mx-auto px-6 pb-10">
        <div className="bg-sand rounded-xl px-6 py-5 flex gap-6 items-center flex-wrap">
          {[
            { v: "12+", l: "city agencies mapped" },
            { v: "90K+", l: "active SF businesses" },
            { v: "~5,000", l: "new registrations per year" },
          ].map((s) => (
            <div key={s.l} className="flex-1 min-w-[120px] text-center">
              <div className="font-display text-2xl text-ink font-normal">{s.v}</div>
              <div className="font-body text-[11px] text-ink-muted mt-0.5">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-[720px] mx-auto px-6 py-5 pb-8 text-center">
        <p className="font-body text-[11px] text-ink-faint">
          Registered permit consultant · SF Ethics Commission · Free for everyone
        </p>
      </div>
    </div>
  );
}
