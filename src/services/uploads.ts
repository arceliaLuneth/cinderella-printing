import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";
import { apiConfig } from "../lib/env";
import { ApiError } from "../lib/errors";
import { audit, transaction } from "../lib/db";

export function detectImage(bytes: Uint8Array): { mime: string; extension: string } | null {
  if (bytes.length >= 8 && Buffer.from(bytes.subarray(0,8)).equals(Buffer.from([137,80,78,71,13,10,26,10]))) {
    return { mime: "image/png", extension: "png" };
  }
  if (bytes.length >= 3 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) {
    return { mime: "image/jpeg", extension: "jpg" };
  }
  if (bytes.length >= 12 && Buffer.from(bytes.subarray(0,4)).toString() === "RIFF" &&
    Buffer.from(bytes.subarray(8,12)).toString() === "WEBP") return { mime: "image/webp", extension: "webp" };
  return null;
}
export async function uploadImage(bytes: Uint8Array, declaredType: string, actorId: string) {
  const config = apiConfig(), detected = detectImage(bytes);
  if (!bytes.length || bytes.length > config.UPLOAD_LIMIT_BYTES) throw new ApiError(413, "FILE_TOO_LARGE", "Berkas kosong atau melebihi batas upload.");
  if (!detected || detected.mime !== declaredType) throw new ApiError(422, "INVALID_IMAGE", "Gunakan gambar PNG, JPEG, atau WebP yang valid.");
  let clean: Buffer;
  try {
    const image = sharp(bytes, { animated: true, limitInputPixels: 25_000_000, failOn: "warning" });
    const metadata = await image.metadata();
    if ((metadata.pages ?? 1) === 1) image.autoOrient();
    clean = await image.toBuffer();
  } catch {
    throw new ApiError(422, "INVALID_IMAGE", "Foto tidak dapat dibaca atau melebihi batas 25 megapiksel.");
  }
  if (clean.length > config.UPLOAD_LIMIT_BYTES) throw new ApiError(413, "FILE_TOO_LARGE", "Ukuran foto setelah diproses melebihi batas unggah.");
  if (!config.SUPABASE_SERVICE_ROLE_KEY) throw new ApiError(503, "STORAGE_NOT_CONFIGURED", "Konfigurasi Supabase Storage belum lengkap.");
  const client = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (url, options) => fetch(url, { ...options, signal: AbortSignal.timeout(15000) }) },
  });
  const objectPath = "catalog/" + randomUUID() + "." + detected.extension;
  const { error } = await client.storage.from(config.SUPABASE_STORAGE_BUCKET).upload(objectPath, clean, {
    contentType: detected.mime, upsert: false, cacheControl: "3600",
  });
  if (error) throw new ApiError(502, "UPLOAD_FAILED", "Gambar belum berhasil disimpan.");
  try {
    await transaction(db => audit(db, actorId, "image.uploaded", "storage", objectPath));
  } catch (error) {
    // Kompensasi jika pencatatan gagal setelah Storage berhasil.
    await client.storage.from(config.SUPABASE_STORAGE_BUCKET).remove([objectPath]);
    throw error;
  }
  return { path: objectPath, url: client.storage.from(config.SUPABASE_STORAGE_BUCKET).getPublicUrl(objectPath).data.publicUrl };
}
