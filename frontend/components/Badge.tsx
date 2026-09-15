import { Intent } from "@/lib/api";

type Props = {
  intent: Intent | string;
};

const intentStyles: Record<string, string> = {
  invoice: "bg-blue-500/15 text-blue-300 border-blue-500/40",
  urgent_alert: "bg-red-500/15 text-red-300 border-red-500/40",
  support_query: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
  spam: "bg-zinc-600/20 text-zinc-300 border-zinc-500/40",
  meeting_request: "bg-purple-500/15 text-purple-300 border-purple-500/40",
  general: "bg-amber-500/15 text-amber-300 border-amber-500/40",
};

export function Badge({ intent }: Props) {
  const style = intentStyles[intent] ?? intentStyles.general;
  return (
    <span
      className={`inline-flex items-center rounded px-2 py-1 text-xs border ${style}`}
    >
      {intent}
    </span>
  );
}
