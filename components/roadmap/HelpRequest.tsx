"use client";

import { useState } from "react";
import type { HelpFormData } from "@/lib/types";

interface HelpRequestProps {
  stepOrder: number;
  stepName: string;
  defaultEmail: string;
}

export default function HelpRequest({ stepOrder, stepName, defaultEmail }: HelpRequestProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState<HelpFormData>({
    name: "",
    email: defaultEmail,
    note: "",
  });

  const handleSubmit = async () => {
    try {
      await fetch("/api/help-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stepOrder,
          stepName,
          ...form,
        }),
      });
    } catch {
      // Stub — still show success
    }
    setSent(true);
  };

  if (isOpen) {
    return (
      <div className="mt-2 p-4 bg-violet-soft rounded-[10px] border border-violet/20">
        {sent ? (
          <div className="text-center py-2">
            <div className="font-body text-sm font-medium text-violet mb-1">
              Request sent
            </div>
            <div className="font-body text-[13px] text-ink-muted">
              We&apos;ll reach out within 1 business day with a plan and quote for this step.
            </div>
          </div>
        ) : (
          <>
            <div className="font-body text-sm font-medium text-violet mb-2.5">
              Get help with: {stepName}
            </div>
            <div className="grid gap-2">
              <input
                type="text"
                placeholder="Your name"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className="px-3 py-2.5 rounded-[7px] border-[1.5px] border-violet/20 bg-white font-body text-[13px] outline-none w-full"
              />
              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                className="px-3 py-2.5 rounded-[7px] border-[1.5px] border-violet/20 bg-white font-body text-[13px] outline-none w-full"
              />
              <textarea
                placeholder="Anything we should know? (optional)"
                value={form.note}
                onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
                rows={2}
                className="px-3 py-2.5 rounded-[7px] border-[1.5px] border-violet/20 bg-white font-body text-[13px] outline-none resize-y w-full"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSubmit}
                  className="flex-1 px-4 py-2.5 rounded-[7px] bg-violet text-white border-none font-body text-[13px] font-medium cursor-pointer hover:opacity-90 transition-opacity"
                >
                  Send request
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-3.5 py-2.5 rounded-[7px] bg-transparent text-violet border-[1.5px] border-violet/20 font-body text-[13px] cursor-pointer hover:bg-violet/5 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
            <p className="font-body text-[11px] text-ink-muted mt-2 leading-snug">
              We&apos;ll reply within 1 business day with a plan and quote. Typical cost: $150–$500 per step depending on complexity.
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 mt-2 px-3 py-2 bg-violet-soft rounded-lg">
      <span className="font-body text-xs text-violet">
        Want us to handle this step?
      </span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(true);
        }}
        className="font-mono text-[10px] text-violet bg-transparent border border-violet/30 rounded px-2 py-0.5 cursor-pointer tracking-[0.04em] hover:bg-violet/10 transition-colors"
      >
        GET HELP →
      </button>
    </div>
  );
}
