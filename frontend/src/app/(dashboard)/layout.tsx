"use client";

import { AuthGuard } from "@/components/layout/AuthGuard";
import { Sidebar }   from "@/components/layout/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden bg-surface-950">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="min-h-full p-8 max-w-[1200px] mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
