import { CATALOG_CHANGED } from "../catalog-events";
export const ADMIN_SIGNED_OUT = "cinderella-admin-signed-out";

export class AdminApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

async function unwrap<T>(response: Response): Promise<T> {
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = Array.isArray(body?.error?.details)
      ? body.error.details.map((issue: { path: string; message: string }) => `${issue.path}: ${issue.message}`).join(". ")
      : "";
    throw new AdminApiError(detail || body?.error?.message || "Permintaan belum berhasil.", response.status);
  }
  if (body === null) throw new AdminApiError("Respons server tidak dapat dibaca.", response.status);
  return body as T;
}

export function sessionRequest<T>(action: "login" | "refresh" | "logout", body?: unknown) {
  return fetch(`/api/admin-session/${action}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  }).then(unwrap<{ data: T }>);
}

let refresh: Promise<unknown> | undefined;
export async function adminResponse(path: string, options?: RequestInit) {
  const url = "/api/v1/" + path;
  let response = await fetch(url, { ...options, cache: "no-store" });
  if (response.status === 401) {
    refresh ??= sessionRequest("refresh").catch(error => {
      if (error instanceof AdminApiError && [401, 403].includes(error.status)) {
        window.dispatchEvent(new Event(ADMIN_SIGNED_OUT));
      }
      throw error;
    }).finally(() => { refresh = undefined; });
    await refresh;
    response = await fetch(url, { ...options, cache: "no-store" });
  }
  if (!response.ok) await unwrap(response);
  if (options?.method && ["POST", "PATCH", "PUT"].includes(options.method) && /^admin\/(categories|products|inspiration)(\/|$)/.test(path)) {
    try {
      window.localStorage.setItem(CATALOG_CHANGED, crypto.randomUUID());
    } catch {
      // Public tabs can still detect the change on their next scheduled check.
    }
  }
  return response;
}

export async function adminRequest<T>(path: string, options?: RequestInit): Promise<T> {
  return unwrap(await adminResponse(path, options));
}

export function jsonRequest(method: string, data?: unknown): RequestInit {
  return {
    method,
    headers: { "Content-Type": "application/json" },
    body: data === undefined ? undefined : JSON.stringify(data),
  };
}
