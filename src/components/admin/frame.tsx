"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAdminAuth } from "@/components/admin/auth-provider";
import { AdminDataProvider, useAdminData } from "@/components/admin/data-provider";
import { AdminShell } from "@/components/admin/shell";
import { LoadingPanel } from "@/components/admin/ui";

function AdminContent({ children }: { children: React.ReactNode }) {
  const { hydrated, loadError, retry } = useAdminData();
  if (loadError) return (
    <div className="admin-auth-loading">
      <div role="alert">
        <p>{loadError}</p>
        <button type="button" className="admin-btn admin-btn--primary" onClick={retry}>Coba lagi</button>
      </div>
    </div>
  );
  if (!hydrated) return (
    <div className="admin-auth-loading"><LoadingPanel label="Memuat data admin…" /></div>
  );
  return <AdminShell>{children}</AdminShell>;
}

export function AdminFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { status } = useAdminAuth();
  const isLogin = pathname === "/admin/login";

  useEffect(() => {
    if (status === "loading") return;

    if (!isLogin && status !== "authenticated") {
      router.replace(`/admin/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    if (isLogin && status === "authenticated") {
      const next = new URLSearchParams(window.location.search).get("next");
      router.replace(next && (next === "/admin" || next.startsWith("/admin/")) && !next.startsWith("/admin/login") ? next : "/admin");
    }
  }, [isLogin, pathname, router, status]);

  if (isLogin && status === "unauthenticated") return <>{children}</>;

  if (isLogin || status !== "authenticated") {
    return (
      <div className="admin-auth-loading">
        <LoadingPanel label="Menyiapkan dashboard…" />
      </div>
    );
  }

  return <AdminDataProvider><AdminContent>{children}</AdminContent></AdminDataProvider>;
}
