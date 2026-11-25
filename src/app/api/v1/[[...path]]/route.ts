import type { NextRequest } from "next/server";
import { dispatch } from "../../../../api/router";

type Context = { params: Promise<{ path?: string[] }> };
async function handler(request: NextRequest, context: Context) {
  const path = (await context.params).path ?? [];
  const isPrivate = path[0] === "admin" || path.join("/") === "auth/me";
  const token = isPrivate && request.cookies.get("printing_access")?.value;
  if (!token || request.headers.has("authorization")) return dispatch(request, path);
  const origin = request.headers.get("origin");
  if (request.method !== "GET" && origin !== request.nextUrl.origin) {
    return Response.json({ error: { message: "Permintaan admin harus berasal dari situs ini." } }, { status: 403 });
  }
  const headers = new Headers(request.headers);
  headers.set("authorization", `Bearer ${token}`);
  return dispatch(new Request(request, { headers }), path);
}
export {
  handler as GET, handler as POST, handler as PUT, handler as PATCH,
  handler as OPTIONS,
};
