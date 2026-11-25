"use client";

import { Suspense } from "react";
import { AdminAuthProvider } from "@/components/admin/auth-provider";
import { AdminFrame } from "@/components/admin/frame";
import { ToastProvider } from "@/components/admin/toast";
import { LoadingPanel } from "@/components/admin/ui";

export function AdminProviders({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AdminAuthProvider>
        <Suspense fallback={<div className="admin-auth-loading"><LoadingPanel label="Memuat dashboard…" /></div>}>
          <AdminFrame>{children}</AdminFrame>
        </Suspense>
      </AdminAuthProvider>
    </ToastProvider>
  );
}
