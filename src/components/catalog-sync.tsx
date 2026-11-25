"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CATALOG_CHANGED } from "@/lib/catalog-events";

const CHECK_INTERVAL_MS = 30_000;

export function CatalogSync({ revision }: { revision: string | null }) {
  const router = useRouter();

  useEffect(() => {
    const controller = new AbortController();
    let seenRevision = revision;
    let checking = false;
    let checkAgain = false;

    async function check() {
      if (document.hidden || controller.signal.aborted) return;
      if (checking) {
        checkAgain = true;
        return;
      }
      checking = true;
      try {
        const response = await fetch("/api/v1/public/catalog-version", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) return;
        const body = await response.json();
        const nextRevision = body?.data?.revision;
        if (!controller.signal.aborted && typeof nextRevision === "string" && nextRevision !== seenRevision) {
          seenRevision = nextRevision;
          router.refresh();
        }
      } catch {
        // Keep the current page visible and retry at the next check.
      } finally {
        checking = false;
        if (checkAgain) {
          checkAgain = false;
          void check();
        }
      }
    }

    function checkAfterAdminSave(event: StorageEvent) {
      if (event.key === CATALOG_CHANGED) void check();
    }

    window.addEventListener("storage", checkAfterAdminSave);
    document.addEventListener("visibilitychange", check);
    const timer = window.setInterval(check, CHECK_INTERVAL_MS);
    void check();

    return () => {
      controller.abort();
      window.removeEventListener("storage", checkAfterAdminSave);
      document.removeEventListener("visibilitychange", check);
      window.clearInterval(timer);
    };
  }, [revision, router]);

  return null;
}
