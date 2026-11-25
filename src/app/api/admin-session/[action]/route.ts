import { NextRequest, NextResponse } from "next/server";
import { dispatch } from "@/api/router";
import { revokeBrowserSession } from "@/lib/auth";

type Context = { params: Promise<{ action: string }> };
type Tokens = { access_token: string; refresh_token: string; expires_in: number; admin: unknown };

export async function POST(request: NextRequest, context: Context) {
  if (request.headers.get("origin") !== request.nextUrl.origin) {
    return NextResponse.json({ error: { message: "Permintaan sesi harus berasal dari situs ini." } }, { status: 403 });
  }
  const { action } = await context.params;
  if (action !== "login" && action !== "refresh" && action !== "logout") {
    return NextResponse.json({ error: { message: "Aksi sesi tidak tersedia." } }, { status: 404 });
  }

  const secure = request.nextUrl.protocol === "https:";
  const cookie = { httpOnly: true, secure, sameSite: "strict" as const, path: "/api" };
  const headers = new Headers(request.headers);
  const token = request.cookies.get("printing_access")?.value;
  if (token) headers.set("authorization", `Bearer ${token}`);
  const refreshToken = request.cookies.get("printing_refresh")?.value;
  if (action === "logout") {
    const revoked = await revokeBrowserSession(token, refreshToken);
    const response = NextResponse.json({ data: { logged_out: true, revoked } }, { headers: { "Cache-Control": "no-store" } });
    response.cookies.set("printing_access", "", { ...cookie, maxAge: 0 });
    response.cookies.set("printing_refresh", "", { ...cookie, path: "/api/admin-session", maxAge: 0 });
    return response;
  }
  if (action === "refresh" && !refreshToken) {
    return NextResponse.json({ error: { message: "Sesi admin berakhir. Masuk kembali." } }, { status: 401 });
  }
  const authRequest = action === "login" ? request : new Request(request.url, {
    method: "POST",
    headers,
    ...(action === "refresh" ? { body: JSON.stringify({ refresh_token: refreshToken }) } : {}),
  });
  const result = await dispatch(authRequest, ["auth", action]);
  if (!result.ok) return result;

  const { data } = await result.json() as { data: Tokens };
  const response = NextResponse.json({ data: data.admin }, { headers: { "Cache-Control": "no-store" } });
  response.cookies.set("printing_access", data.access_token, { ...cookie, maxAge: data.expires_in });
  response.cookies.set("printing_refresh", data.refresh_token, { ...cookie, path: "/api/admin-session", maxAge: 7 * 86400 });
  return response;
}
