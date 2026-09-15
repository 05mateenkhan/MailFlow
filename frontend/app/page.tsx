"use client";

import { useEffect, useMemo, useState } from "react";

import { EmailCard } from "@/components/EmailCard";
import { Sidebar } from "@/components/Sidebar";
import { getApiBaseUrl, getLogs, type EmailLog } from "@/lib/api";

export default function FeedPage() {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [connected, setConnected] = useState(false);

  const load = async () => {
    const data = await getLogs(50);
    setLogs(data);
  };

  useEffect(() => {
    load().catch(() => setConnected(false));
    const id = setInterval(() => {
      load().catch(() => setConnected(false));
    }, 10000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const sse = new EventSource(`${getApiBaseUrl()}/stream?email_id=feed`);
    sse.onopen = () => setConnected(true);
    sse.onerror = () => setConnected(false);
    return () => {
      sse.close();
      setConnected(false);
    };
  }, []);

  const empty = useMemo(() => logs.length === 0, [logs.length]);

  return (
    <div className="min-h-screen md:flex bg-[#0a0a0a]">
      <Sidebar />
      <main className="flex-1 p-4 md:p-8 space-y-6">
        <header className="flex items-center justify-between border border-zinc-800 rounded p-4">
          <h1 className="text-2xl font-semibold text-amber-400 tracking-tight">
            MailMind
          </h1>
          <div className="inline-flex items-center gap-2 text-sm text-zinc-300">
            <span
              className={`h-2.5 w-2.5 rounded-full ${connected ? "bg-emerald-400" : "bg-zinc-600"}`}
              aria-hidden
            />
            {connected ? "connected" : "disconnected"}
          </div>
        </header>

        <section className="space-y-3">
          {empty ? (
            <div className="border border-zinc-800 rounded p-6 text-zinc-400">
              No processed emails yet.
            </div>
          ) : (
            logs.map((log) => <EmailCard key={log.id} log={log} />)
          )}
        </section>
      </main>
    </div>
  );
}
