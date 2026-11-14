"use client";

import { Suspense } from "react";
import { AdminAuthProvider } from "@/components/admin/auth-provider";
import { AdminDataProvider } from "@/components/admin/data-provider";
import { AdminFrame } from "@/components/admin/frame";
import { ToastProvider } from "@/components/admin/toast";
import { LoadingPanel } from "@/components/admin/ui";

export function AdminProviders({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AdminAuthProvider>
        <AdminDataProvider>
          <Suspense
            fallback={
              <div className="admin-auth-loading">
                <LoadingPanel label="Memuat dashboard…" />
              </div>
            }
          >
            <AdminFrame>{children}</AdminFrame>
          </Suspense>
        </AdminDataProvider>
      </AdminAuthProvider>
    </ToastProvider>
  );
}
