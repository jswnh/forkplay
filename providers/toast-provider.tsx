"use client";

import * as React from "react";
import { IconCheck, IconAlertTriangle, IconInfoCircle, IconTrophy, IconX } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

export interface Toast {
  id: string;
  title: string;
  description?: string;
  type?: "default" | "success" | "error" | "achievement" | "info";
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | undefined>(
  undefined,
);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = React.useCallback(
    ({ title, description, type = "default", duration = 4500 }: Omit<Toast, "id">) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      const newToast: Toast = { id, title, description, type, duration };

      setToasts((prev) => [...prev.slice(-4), newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast],
  );

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none p-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-2xl backdrop-blur-xl transition-all animate-in slide-in-from-bottom-5 duration-300",
              toast.type === "success" &&
                "border-emerald-500/30 bg-emerald-950/80 text-emerald-100 shadow-[0_0_25px_rgba(16,185,129,0.15)]",
              toast.type === "achievement" &&
                "border-amber-500/40 bg-amber-950/85 text-amber-100 shadow-[0_0_30px_rgba(245,158,11,0.25)]",
              toast.type === "error" &&
                "border-red-500/30 bg-red-950/80 text-red-100 shadow-[0_0_25px_rgba(239,68,68,0.15)]",
              (toast.type === "default" || toast.type === "info") &&
                "border-white/15 bg-card/90 text-foreground shadow-[0_0_25px_rgba(0,0,0,0.5)]",
            )}
          >
            <div className="shrink-0 mt-0.5">
              {toast.type === "achievement" ? (
                <IconTrophy className="size-5 text-amber-400 animate-bounce" />
              ) : toast.type === "success" ? (
                <IconCheck className="size-5 text-emerald-400" />
              ) : toast.type === "error" ? (
                <IconAlertTriangle className="size-5 text-red-400" />
              ) : (
                <IconInfoCircle className="size-5 text-cyan-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm tracking-tight">{toast.title}</div>
              {toast.description && (
                <div className="text-xs opacity-85 mt-0.5 leading-relaxed">
                  {toast.description}
                </div>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 text-white/50 hover:text-white p-1 rounded transition-colors"
            >
              <IconX className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
