"use client";

import { useEffect, useState } from "react";

import { Rule, RuleInput } from "@/lib/api";

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (values: RuleInput) => Promise<void>;
  initial?: Rule | null;
};

const emptyForm: RuleInput = {
  name: "",
  description: "",
  intent_match: "general",
  urgency_min: null,
  action_type: "label",
  action_value: "",
  require_hitl: false,
};

export function RuleModal({ open, onClose, onSave, initial }: Props) {
  const [form, setForm] = useState<RuleInput>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setForm({
        name: initial.name,
        description: initial.description,
        intent_match: initial.intent_match,
        urgency_min: initial.urgency_min,
        action_type: initial.action_type,
        action_value: initial.action_value,
        require_hitl: initial.require_hitl,
      });
    } else {
      setForm(emptyForm);
    }
  }, [open, initial]);

  if (!open) return null;

  const actionLabel =
    form.action_type === "reply"
      ? "Reply template"
      : form.action_type === "label"
        ? "Label name"
        : form.action_type === "forward"
          ? "Forward to email"
          : "Action value";

  return (
    <div className="fixed inset-0 z-50">
      <button
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-label="Close modal"
      />
      <div className="absolute left-1/2 top-1/2 w-[95vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 border border-zinc-800 bg-[#0d0d0d] rounded p-4">
        <h3 className="text-amber-300 font-semibold mb-4">
          {initial ? "Edit Rule" : "Add Rule"}
        </h3>
        <div className="grid md:grid-cols-2 gap-3">
          <input
            className="border border-zinc-700 bg-[#111] rounded px-3 py-2"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <input
            className="border border-zinc-700 bg-[#111] rounded px-3 py-2"
            placeholder="Describe what this rule does"
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
          />
          <select
            className="border border-zinc-700 bg-[#111] rounded px-3 py-2"
            value={form.intent_match}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                intent_match: e.target.value as RuleInput["intent_match"],
              }))
            }
          >
            <option value="invoice">invoice</option>
            <option value="support_query">support_query</option>
            <option value="meeting_request">meeting_request</option>
            <option value="spam">spam</option>
            <option value="urgent_alert">urgent_alert</option>
            <option value="general">general</option>
          </select>
          <input
            className="border border-zinc-700 bg-[#111] rounded px-3 py-2"
            type="number"
            min={1}
            max={5}
            placeholder="Urgency Min (optional)"
            value={form.urgency_min ?? ""}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                urgency_min: e.target.value ? Number(e.target.value) : null,
              }))
            }
          />
          <select
            className="border border-zinc-700 bg-[#111] rounded px-3 py-2"
            value={form.action_type}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                action_type: e.target.value as RuleInput["action_type"],
              }))
            }
          >
            <option value="reply">reply</option>
            <option value="label">label</option>
            <option value="forward">forward</option>
            <option value="escalate">escalate</option>
          </select>
          <input
            className="border border-zinc-700 bg-[#111] rounded px-3 py-2"
            placeholder={actionLabel}
            value={form.action_value}
            onChange={(e) =>
              setForm((f) => ({ ...f, action_value: e.target.value }))
            }
          />
          <label className="inline-flex items-center gap-2 text-sm text-zinc-300 md:col-span-2">
            <input
              type="checkbox"
              checked={form.require_hitl}
              onChange={(e) =>
                setForm((f) => ({ ...f, require_hitl: e.target.checked }))
              }
            />
            Require HITL
          </label>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button
            className="px-3 py-2 border border-zinc-700 rounded"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-3 py-2 border border-amber-500 text-amber-300 rounded disabled:opacity-50"
            disabled={saving}
            onClick={async () => {
              setSaving(true);
              try {
                await onSave(form);
                onClose();
              } finally {
                setSaving(false);
              }
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
