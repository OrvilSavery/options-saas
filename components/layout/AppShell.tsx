import type { ReactNode } from "react";
import AppTopbar from "@/components/layout/AppTopbar";

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <AppTopbar />
      <main className="min-h-[calc(100vh-52px)] px-4 py-6 sm:px-6">
        {children}
      </main>
    </div>
  );
}
