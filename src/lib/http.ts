import { ApiError } from "./errors";
import { apiConfig } from "./env";
import type { z } from "zod";

export async function readBytes(request: Request, max: number) {
  const stated = Number(request.headers.get("content-length") || 0);
  if (stated > max) throw new ApiError(413, "BODY_TOO_LARGE", "Ukuran permintaan melampaui batas.");
  if (!request.body) return new Uint8Array(0);
  const reader = request.body.getReader(), chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.length;
      if (length > max) {
        await reader.cancel();
        throw new ApiError(413, "BODY_TOO_LARGE", "Ukuran permintaan melampaui batas.");
      }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  return bytes;
}
export async function jsonBody<T>(request: Request, schema: z.ZodType<T>) {
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
    throw new ApiError(415, "UNSUPPORTED_MEDIA_TYPE", "Gunakan Content-Type: application/json.");
  }
  const bytes = await readBytes(request, apiConfig().BODY_LIMIT_BYTES);
  let value: unknown;
  try { value = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)); }
  catch { throw new ApiError(400, "INVALID_JSON", "Isi JSON tidak valid."); }
  return schema.parse(value);
}
export const ok = (data: unknown, status = 200) => Response.json({ data }, { status });
