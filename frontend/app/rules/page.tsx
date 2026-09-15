"use client";

import { useEffect, useState } from "react";

import { RuleModal } from "@/components/RuleModal";
import { Sidebar } from "@/components/Sidebar";
import { useToast } from "@/components/Toast";
import {
  createRule,
  deleteRule,
  getRules,
  updateRule,
  type Rule,
  type RuleInput,
} from "@/lib/api";

export default function RulesPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Rule | null>(null);
  const { showToast } = useToast();

  const load = async () => {
    const data = await getRules();
    setRules(data);
  };

  useEffect(() => {
    load().catch(() => showToast("Failed to load rules", "error"));
  }, [showToast]);

  const onSave = async (payload: RuleInput) => {
    if (editing) {
      await updateRule(editing.id, payload);
      showToast("Rule updated");
    } else {
      await createRule(payload);
      showToast("Rule created");
    }
    setEditing(null);
    await load();
  };

  const onDelete = async (id: number) => {
    if (!window.confirm("Delete this rule?")) return;
    await deleteRule(id);
    setRules((prev) => prev.filter((r) => r.id !== id));
    showToast("Rule deleted");
  };

  return (
    <div className="min-h-screen md:flex bg-[#0a0a0a]">
      <Sidebar />
      <main className="flex-1 p-4 md:p-8 space-y-4 overflow-x-auto">
        <header className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-zinc-100">Rules</h1>
          <button
            className="px-3 py-2 border border-amber-500 text-amber-300 rounded"
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
            Add Rule
          </button>
        </header>

        <table className="w-full text-sm border border-zinc-800 rounded overflow-hidden">
          <thead className="bg-[#101010] text-zinc-300">
            <tr>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Intent Match</th>
              <th className="text-left p-3">Urgency Min</th>
              <th className="text-left p-3">Action</th>
              <th className="text-left p-3">Require HITL</th>
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((rule) => (
              <tr key={rule.id} className="border-t border-zinc-800">
                <td className="p-3">{rule.name}</td>
                <td className="p-3">{rule.intent_match}</td>
                <td className="p-3">{rule.urgency_min ?? "-"}</td>
                <td className="p-3">
                  {rule.action_type}: {rule.action_value}
                </td>
                <td className="p-3">{rule.require_hitl ? "yes" : "no"}</td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button
                      className="px-2 py-1 border border-zinc-700 rounded"
                      onClick={() => {
                        setEditing(rule);
                        setOpen(true);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="px-2 py-1 border border-red-600 text-red-300 rounded"
                      onClick={() => onDelete(rule.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>

      <RuleModal
        open={open}
        onClose={() => setOpen(false)}
        onSave={onSave}
        initial={editing}
      />
    </div>
  );
}
