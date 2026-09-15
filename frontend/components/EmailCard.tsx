"use client";

import { useState } from "react";

import { Badge } from "@/components/Badge";
import { EmailLog } from "@/lib/api";

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days} day ago`;
}

function actionLabel(log: EmailLog): string {
  if (log.action_result === "replied") return "replied";
  if (log.action_result === "forwarded") return "forwarded";
  if (log.hitl_required && log.human_decision == null)
    return "pause awaiting approval";
  if (log.action_type === "label")
    return `labeled: ${log.action_value ?? "general"}`;
  return log.action_result;
}

export function EmailCard({ log }: { log: EmailLog }) {
  const [open, setOpen] = useState(false);
  return (
    <article className="border border-zinc-800 rounded p-4 bg-[#0d0d0d]">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2 min-w-0">
          <p className="text-sm text-zinc-400 truncate">{log.from_addr}</p>
          <h3 className="font-semibold text-zinc-100 truncate">
            {log.subject}
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            <Badge intent={log.intent} />
            <span className="text-xs text-zinc-400">
              {relativeTime(log.created_at)}
            </span>
          </div>
          <div className="flex items-center gap-1 pt-1">
            {Array.from({ length: 5 }).map((_, idx) => (
              <span
                key={idx}
                className={`h-2 w-2 rounded-full ${idx < log.urgency ? "bg-amber-400" : "bg-zinc-700"}`}
              />
            ))}
          </div>
          <p className="text-sm text-zinc-300">{actionLabel(log)}</p>
        </div>
        <button
          type="button"
          className="border border-zinc-700 rounded px-2 py-1 text-zinc-300 hover:border-amber-500 hover:text-amber-300"
          onClick={() => setOpen(true)}
          aria-label="Open details"
        >
          →
        </button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-40">
          <button
            className="absolute inset-0 bg-black/60"
            aria-label="Close drawer overlay"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute right-0 top-0 h-full w-full max-w-xl border-l border-zinc-800 bg-[#0a0a0a] p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-amber-300 font-semibold">Email Details</h4>
              <button
                type="button"
                className="border border-zinc-700 rounded px-2 py-1 text-zinc-300"
                onClick={() => setOpen(false)}
              >
                Close
              </button>
            </div>
            <pre className="text-xs text-zinc-300 whitespace-pre-wrap overflow-auto max-h-[90vh] border border-zinc-800 rounded p-3">
              {JSON.stringify(log, null, 2)}
            </pre>
          </aside>
        </div>
      ) : null}
    </article>
  );
}
