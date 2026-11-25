import { createHash } from "node:crypto";
import { apiConfig } from "./env";
import { query } from "./db";
import { ApiError } from "./errors";
import type { Admin } from "./schemas";

type AuthUser = { id: string; email?: string };
type AuthSession = {
  access_token: string; refresh_token: string; token_type: string;
  expires_in: number; expires_at?: number; user: AuthUser;
};
async function authRequest<T>(path: string, body?: unknown, token?: string): Promise<T> {
  const env = apiConfig();
  let response: Response;
  try {
    response = await fetch(env.SUPABASE_URL + "/auth/v1/" + path, {
      method: body === undefined ? "GET" : "POST",
      headers: {
        apikey: env.SUPABASE_PUBLISHABLE_KEY,
        ...(token ? { Authorization: "Bearer " + token } : {}),
        "Content-Type": "application/json",
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      cache: "no-store", signal: AbortSignal.timeout(10000),
    });
  } catch {
    throw new ApiError(503, "AUTH_UNAVAILABLE", "Layanan autentikasi belum dapat dihubungi.");
  }
  if (!response.ok) {
    if (response.status === 429) throw new ApiError(429, "RATE_LIMITED", "Terlalu banyak percobaan. Coba kembali nanti.");
    if (response.status >= 500) throw new ApiError(503, "AUTH_UNAVAILABLE", "Layanan autentikasi sedang tidak tersedia.");
    throw new ApiError(401, "UNAUTHORIZED", "Kredensial atau sesi tidak valid.");
  }
  if (response.status === 204 || path.startsWith("logout?")) return undefined as T;
  return response.json() as Promise<T>;
}
async function adminForUser(user: AuthUser): Promise<Admin> {
  const result = await query<Admin>(
    "SELECT id, name, email, role FROM printing.admin_users WHERE id=$1 AND is_active=true", [user.id],
  );
  if (!result.rows[0]) throw new ApiError(403, "FORBIDDEN", "Akun ini tidak memiliki akses admin aktif.");
  return result.rows[0];
}
export function bearer(request: Request) {
  const header = request.headers.get("authorization");
  if (!header || !/^Bearer \S+$/i.test(header)) {
    throw new ApiError(401, "UNAUTHORIZED", "Token Bearer diperlukan.");
  }
  return header.slice(7);
}
export async function requireAdmin(request: Request) {
  const user = await authRequest<AuthUser>("user", undefined, bearer(request));
  return adminForUser(user);
}
export async function login(email: string, password: string) {
  const session = await authRequest<AuthSession>("token?grant_type=password", { email, password });
  const admin = await adminForUser(session.user);
  return { access_token: session.access_token, refresh_token: session.refresh_token,
    token_type: session.token_type, expires_in: session.expires_in, expires_at: session.expires_at, admin };
}
export async function refresh(refresh_token: string) {
  const session = await authRequest<AuthSession>("token?grant_type=refresh_token", { refresh_token });
  const admin = await adminForUser(session.user);
  return { access_token: session.access_token, refresh_token: session.refresh_token,
    token_type: session.token_type, expires_in: session.expires_in, expires_at: session.expires_at, admin };
}
export async function logout(request: Request) {
  await authRequest<void>("logout?scope=local", {}, bearer(request));
  return { logged_out: true };
}
export async function revokeBrowserSession(access?: string, refreshToken?: string) {
  const revoke = (token: string) => authRequest<void>("logout?scope=local", {}, token);
  try {
    if (access) {
      await revoke(access);
      return true;
    }
  } catch (error) {
    if (!(error instanceof ApiError && error.status === 401)) return false;
  }
  if (!refreshToken) return true;
  try {
    const session = await authRequest<AuthSession>("token?grant_type=refresh_token", { refresh_token: refreshToken });
    await revoke(session.access_token);
    return true;
  } catch (error) {
    return error instanceof ApiError && error.status === 401;
  }
}
export async function authRateLimit(request: Request, identity?: string) {
  const config = apiConfig();
  const ip = config.TRUST_PROXY === "true"
    ? (request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown")
    : "direct";
  const keys = ["auth:ip:" + ip, ...(identity ? ["auth:account:" + identity.toLowerCase()] : [])];
  for (const value of keys) {
    const key = createHash("sha256").update(value).digest("hex");
    const { rows } = await query<{ attempts: number; retry_after: number }>(
      `INSERT INTO printing.rate_limits (key, attempts, expires_at)
       VALUES ($1, 1, now() + make_interval(secs => $2))
       ON CONFLICT (key) DO UPDATE SET
         attempts = CASE WHEN printing.rate_limits.expires_at <= now() THEN 1 ELSE printing.rate_limits.attempts + 1 END,
         expires_at = CASE WHEN printing.rate_limits.expires_at <= now() THEN now() + make_interval(secs => $2) ELSE printing.rate_limits.expires_at END
       RETURNING attempts, greatest(1, ceil(extract(epoch FROM (expires_at-now()))))::integer AS retry_after`,
      [key, config.AUTH_RATE_WINDOW_SECONDS],
    );
    if (rows[0].attempts > config.AUTH_RATE_LIMIT) {
      throw new ApiError(429, "RATE_LIMITED", "Batas percobaan autentikasi tercapai.", undefined,
        { "Retry-After": String(rows[0].retry_after) });
    }
  }
  // Bersihkan bucket kedaluwarsa; tidak menyimpan IP/email asli.
  await query("DELETE FROM printing.rate_limits WHERE expires_at < now() - interval '1 day'");
}
