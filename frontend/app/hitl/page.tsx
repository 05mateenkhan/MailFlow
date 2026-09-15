"use client";

import { useEffect, useMemo, useState } from "react";

import { HitlCard } from "@/components/HitlCard";
import { Sidebar } from "@/components/Sidebar";
import { useToast } from "@/components/Toast";
import {
  approveHitl,
  getPendingHitl,
  rejectHitl,
  type HitlItem,
} from "@/lib/api";

export default function HitlPage() {
  const [items, setItems] = useState<HitlItem[]>([]);
  const { showToast } = useToast();

  const load = async () => {
    const data = await getPendingHitl();
    setItems(data);
  };

  useEffect(() => {
    load().catch(() => showToast("Failed to load HITL queue", "error"));
    const id = setInterval(() => {
      load().catch(() => undefined);
    }, 10000);
    return () => clearInterval(id);
  }, [showToast]);

  const onApprove = async (
    emailId: string,
    action?: { type: string; value: string },
  ) => {
    await approveHitl(emailId, action);
    setItems((prev) => prev.filter((item) => item.email_id !== emailId));
    showToast("Approval submitted");
  };

  const onReject = async (emailId: string) => {
    await rejectHitl(emailId);
    setItems((prev) => prev.filter((item) => item.email_id !== emailId));
    showToast("Email rejected", "success");
  };

  const pendingCount = useMemo(() => items.length, [items.length]);

  return (
    <div className="min-h-screen md:flex bg-[#0a0a0a]">
      <Sidebar />
      <main className="flex-1 p-4 md:p-8 space-y-4">
        <header className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-zinc-100">
            Awaiting Approval
          </h1>
          <span className="px-2 py-1 text-xs rounded border border-amber-500/40 text-amber-300">
            {pendingCount} pending
          </span>
        </header>

        <section className="space-y-3">
          {items.length === 0 ? (
            <div className="border border-zinc-800 rounded p-6 text-zinc-400">
              Queue is empty.
            </div>
          ) : (
            items.map((item) => (
              <HitlCard
                key={item.id}
                item={item}
                onApprove={onApprove}
                onReject={onReject}
              />
            ))
          )}
        </section>
      </main>
    </div>
  );
}
