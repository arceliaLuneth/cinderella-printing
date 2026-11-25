"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { ADMIN_SIGNED_OUT, adminRequest, sessionRequest } from "@/lib/admin/client";
import { useToast } from "./toast";

type Status = "loading" | "authenticated" | "unauthenticated";
const AuthContext = createContext<{
  status: Status;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
} | null>(null);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>("loading");
  const { notify } = useToast();

  useEffect(() => {
    let active = true;
    function signedOut() {
      active = false;
      setStatus("unauthenticated");
    }
    function onStorage(event: StorageEvent) {
      if (event.key === ADMIN_SIGNED_OUT) signedOut();
    }
    window.addEventListener(ADMIN_SIGNED_OUT, signedOut);
    window.addEventListener("storage", onStorage);
    adminRequest("auth/me").then(
      () => { if (active) setStatus("authenticated"); },
      () => { if (active) setStatus("unauthenticated"); },
    );
    return () => {
      active = false;
      window.removeEventListener(ADMIN_SIGNED_OUT, signedOut);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return (
    <AuthContext.Provider value={{
      status,
      async login(identifier, password) {
        const login = identifier.includes("@") ? { email: identifier } : { username: identifier.toLowerCase() };
        await sessionRequest("login", { ...login, password });
        setStatus("authenticated");
      },
      async logout() {
        const { data } = await sessionRequest<{ revoked: boolean }>("logout");
        setStatus("unauthenticated");
        if (!data.revoked) notify("Anda sudah keluar di browser ini. Pencabutan sesi di server belum terkonfirmasi.", "info");
        try { localStorage.setItem(ADMIN_SIGNED_OUT, crypto.randomUUID()); } catch {}
      },
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAdminAuth() {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error("AdminAuthProvider diperlukan.");
  return auth;
}
