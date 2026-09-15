"use client";

import { createContext, useContext, useMemo, useState } from "react";

type ToastItem = {
  id: number;
  message: string;
  type: "success" | "error";
};

type ToastContextValue = {
  showToast: (message: string, type?: ToastItem["type"]) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const value = useMemo(
    () => ({
      showToast: (message: string, type: ToastItem["type"] = "success") => {
        const id = Date.now() + Math.floor(Math.random() * 1000);
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
      },
    }),
    [],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-3 py-2 text-sm border rounded bg-[#111] ${
              toast.type === "success"
                ? "border-emerald-500 text-emerald-300"
                : "border-red-500 text-red-300"
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
