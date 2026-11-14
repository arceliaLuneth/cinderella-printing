"use client";

import { createContext, useContext, useSyncExternalStore } from "react";
import { DEMO_ADMIN_PASSWORD } from "@/lib/admin/company";

const SESSION_KEY = "cinderella-admin-session";
const AUTH_EVENT = "cinderella-admin-auth";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

let memoryStatus: AuthStatus | null = null;

function readStatus(): AuthStatus {
  if (memoryStatus) return memoryStatus;
  try {
    return sessionStorage.getItem(SESSION_KEY) === "active" ? "authenticated" : "unauthenticated";
  } catch {
    return "unauthenticated";
  }
}

function subscribe(callback: () => void) {
  window.addEventListener(AUTH_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(AUTH_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function notifyChange() {
  window.dispatchEvent(new Event(AUTH_EVENT));
}

interface AuthContextValue {
  status: AuthStatus;
  login: (password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const status = useSyncExternalStore<AuthStatus>(subscribe, readStatus, () => "loading");

  const value: AuthContextValue = {
    status,
    login(password) {
      if (password !== DEMO_ADMIN_PASSWORD) return false;
      memoryStatus = "authenticated";
      try {
        sessionStorage.setItem(SESSION_KEY, "active");
      } catch {
        // The in-memory session keeps the demo usable when storage is blocked.
      }
      notifyChange();
      return true;
    },
    logout() {
      memoryStatus = "unauthenticated";
      try {
        sessionStorage.removeItem(SESSION_KEY);
      } catch {
        // Ignore storage failures during logout.
      }
      notifyChange();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAdminAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAdminAuth harus dipakai di dalam AdminAuthProvider.");
  }
  return context;
}
