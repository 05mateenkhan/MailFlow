import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";

import { ToastProvider } from "@/components/Toast";
import "./globals.css";

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MailMind Dashboard",
  description: "MailMind agentic email dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jetbrains.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#0a0a0a] text-zinc-100">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
