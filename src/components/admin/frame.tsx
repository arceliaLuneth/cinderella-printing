"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAdminAuth } from "@/components/admin/auth-provider";
import { useAdminData } from "@/components/admin/data-provider";
import { AdminShell } from "@/components/admin/shell";
import { LoadingPanel } from "@/components/admin/ui";
import { useClientReady } from "@/components/admin/use-client-ready";

export function AdminFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { status } = useAdminAuth();
  const { hydrated } = useAdminData();
  const isLogin = pathname === "/admin/login";
  const mounted = useClientReady();

  useEffect(() => {
    if (status === "loading") return;

    if (!isLogin && status !== "authenticated") {
      router.replace(`/admin/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    if (isLogin && status === "authenticated") {
      const next = new URLSearchParams(window.location.search).get("next");
      router.replace(next?.startsWith("/admin") ? next : "/admin");
    }
  }, [isLogin, pathname, router, status]);

  if (isLogin) {
    return mounted ? <>{children}</> : (
      <div className="admin-auth-loading">
        <LoadingPanel label="Menyiapkan dashboard…" />
      </div>
    );
  }

  if (!mounted || status !== "authenticated" || !hydrated) {
    return (
      <div className="admin-auth-loading">
        <LoadingPanel label="Menyiapkan dashboard…" />
      </div>
    );
  }

  return <AdminShell>{children}</AdminShell>;
}
