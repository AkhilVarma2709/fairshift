import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(circle_at_top,oklch(0.92_0.05_70),transparent_55%)]" />
        <div className="absolute right-[-10rem] top-20 h-80 w-80 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute left-[-8rem] bottom-10 h-72 w-72 rounded-full bg-success/8 blur-3xl" />
      </div>
      <main className="relative mx-auto max-w-6xl px-5 py-8 md:px-8 md:py-12">
        {children}
      </main>
      <Toaster position="bottom-right" richColors closeButton />
    </div>
  );
}
