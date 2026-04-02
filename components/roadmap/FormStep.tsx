import type { FormField, ActionButton } from "@/lib/types";

interface FormStepProps {
  fields: FormField[];
  actions?: ActionButton[];
}

export default function FormStep({ fields, actions }: FormStepProps) {
  return (
    <div className="grid gap-2.5 mb-3.5">
      {fields.map((f) => (
        <div key={f.id}>
          <label className="font-mono text-[10px] text-ink-muted tracking-[0.04em] block mb-1">
            {f.label}
          </label>
          {f.kind === "select" ? (
            <select className="w-full px-3 py-2.5 rounded-lg border-[1.5px] border-sand-dark bg-white font-body text-sm text-ink">
              <option value="">Select...</option>
              {f.options?.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              placeholder={f.ph}
              className="w-full px-3 py-2.5 rounded-lg border-[1.5px] border-sand-dark bg-white font-body text-sm text-ink outline-none"
            />
          )}
        </div>
      ))}
      {actions && (
        <div className="flex gap-2 flex-wrap mt-1">
          {actions.map((act, i) => (
            <button
              key={i}
              onClick={() => act.url && window.open(act.url, "_blank")}
              className={`px-4 py-2.5 rounded-lg cursor-pointer font-body text-[13px] font-medium transition-colors ${
                act.primary
                  ? "bg-ink text-cream border-none hover:bg-ink-soft"
                  : "bg-transparent text-ink border-[1.5px] border-ink hover:bg-sand"
              }`}
            >
              {act.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
