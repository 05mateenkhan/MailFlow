"use client";

import { useState } from "react";

import { Badge } from "@/components/Badge";
import { HitlItem } from "@/lib/api";

type Props = {
  item: HitlItem;
  onApprove: (
    emailId: string,
    action?: { type: string; value: string },
  ) => Promise<void>;
  onReject: (emailId: string) => Promise<void>;
};

export function HitlCard({ item, onApprove, onReject }: Props) {
  const [busy, setBusy] = useState(false);
  const [override, setOverride] = useState(false);
  const [actionType, setActionType] = useState(
    item.proposed_action?.type ?? "reply",
  );
  const [actionValue, setActionValue] = useState(
    String(item.proposed_action?.value ?? ""),
  );

  const confidence = Math.round(
    Number(item.classification?.confidence ?? 0) * 100,
  );

  const handleApprove = async () => {
    setBusy(true);
    try {
      if (override) {
        await onApprove(item.email_id, {
          type: actionType,
          value: actionValue,
        });
      } else {
        await onApprove(item.email_id);
      }
    } finally {
      setBusy(false);
    }
  };

  const handleReject = async () => {
    setBusy(true);
    try {
      await onReject(item.email_id);
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className="border border-zinc-800 rounded p-4 bg-[#0d0d0d] space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge intent={String(item.classification?.intent ?? "general")} />
        <p className="text-sm text-zinc-400">{item.from_addr}</p>
      </div>
      <h3 className="font-semibold text-zinc-100">{item.subject}</h3>
      <div className="text-sm text-zinc-300">
        Urgency: {item.classification?.urgency ?? "-"}
      </div>
      <div className="space-y-1">
        <div className="h-2 bg-zinc-800 rounded overflow-hidden">
          <div
            className="h-full bg-amber-400"
            style={{ width: `${confidence}%` }}
          />
        </div>
        <p className="text-xs text-zinc-400">Confidence {confidence}%</p>
      </div>
      <p className="text-sm text-zinc-300">
        {String(item.classification?.summary ?? "No summary")}
      </p>

      <div className="border border-amber-500/50 rounded p-3 text-sm text-amber-200">
        Proposed action: {String(item.proposed_action?.type ?? "-")}{" "}
        {String(item.proposed_action?.value ?? "")}
      </div>

      <label className="inline-flex items-center gap-2 text-sm text-zinc-300">
        <input
          type="checkbox"
          checked={override}
          onChange={(e) => setOverride(e.target.checked)}
        />
        Override action
      </label>

      {override ? (
        <div className="grid md:grid-cols-2 gap-2">
          <select
            value={actionType}
            onChange={(e) => setActionType(e.target.value)}
            className="border border-zinc-700 bg-[#111] rounded px-2 py-2 text-sm"
          >
            <option value="reply">reply</option>
            <option value="label">label</option>
            <option value="forward">forward</option>
            <option value="escalate">escalate</option>
          </select>
          <input
            value={actionValue}
            onChange={(e) => setActionValue(e.target.value)}
            className="border border-zinc-700 bg-[#111] rounded px-2 py-2 text-sm"
            placeholder="Action value"
          />
        </div>
      ) : null}

      <div className="flex gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={handleApprove}
          className="px-3 py-2 border border-emerald-500 text-emerald-300 rounded disabled:opacity-50"
        >
          Approve
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={handleReject}
          className="px-3 py-2 border border-red-500 text-red-300 rounded disabled:opacity-50"
        >
          Reject
        </button>
      </div>
    </article>
  );
}
