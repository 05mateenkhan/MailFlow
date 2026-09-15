"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Feed" },
  { href: "/hitl", label: "HITL Queue" },
  { href: "/rules", label: "Rules" },
  { href: "/kb", label: "KB Upload" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full md:w-56 border-r border-zinc-800 bg-[#0a0a0a] p-4 md:p-6">
      <nav className="flex md:flex-col gap-2 overflow-x-auto">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-2 text-sm whitespace-nowrap border rounded transition-colors ${
                active
                  ? "border-amber-500 text-amber-300 bg-amber-500/10"
                  : "border-zinc-800 text-zinc-300 hover:border-zinc-700"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
