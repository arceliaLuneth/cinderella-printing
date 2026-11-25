import "dotenv/config";
import { readFileSync } from "node:fs";
import { z } from "zod";
import { ApiError } from "./errors";

const databaseSchema = z.object({
  DATABASE_URL: z.string().url(),
  DATABASE_PASSWORD: z.string().default(""),
  DATABASE_SSL: z.enum(["true", "false"]).default("true"),
  DATABASE_CA_FILE: z.string().default(""),
  DATABASE_POOL_MAX: z.coerce.number().int().min(1).max(30).default(5),
});
const apiSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_PUBLISHABLE_KEY: z.string().min(10),
  SUPABASE_SERVICE_ROLE_KEY: z.string().default(""),
  SUPABASE_STORAGE_BUCKET: z.string().min(1).default("catalog-images"),
  CORS_ORIGINS: z.string().default("http://localhost:3000,http://localhost:5173"),
  TRUST_PROXY: z.enum(["true", "false"]).default("false"),
  AUTH_RATE_LIMIT: z.coerce.number().int().min(1).default(10),
  AUTH_RATE_WINDOW_SECONDS: z.coerce.number().int().min(1).default(900),
  BODY_LIMIT_BYTES: z.coerce.number().int().min(1024).max(1048576).default(262144),
  UPLOAD_LIMIT_BYTES: z.coerce.number().int().min(1024).max(5242880).default(5242880),
});

export function databaseConfig(connectionString = process.env.DATABASE_URL) {
  const result = databaseSchema.safeParse({ ...process.env, DATABASE_URL: connectionString });
  if (!result.success) throw new ApiError(503, "CONFIGURATION_ERROR", "Konfigurasi database belum lengkap atau tidak valid.");
  const env = result.data;
  const url = new URL(env.DATABASE_URL);
  if (!["postgres:", "postgresql:"].includes(url.protocol)) {
    throw new Error("DATABASE_URL harus berupa URL PostgreSQL.");
  }
  // Keep the password outside the URL so .env does not need percent-encoding.
  if (env.DATABASE_PASSWORD) url.password = env.DATABASE_PASSWORD;
  if (url.hostname.endsWith(".supabase.com") || url.hostname.endsWith(".supabase.co")) {
    if (!url.password) throw new ApiError(503, "CONFIGURATION_ERROR", "Password PostgreSQL Supabase belum dikonfigurasi.");
  }
  // Parameter SSL pada URL dapat menimpa opsi pg; gunakan satu sumber konfigurasi.
  for (const key of ["sslmode", "sslcert", "sslkey", "sslrootcert"]) url.searchParams.delete(key);
  return {
    connectionString: url.toString(),
    ssl: env.DATABASE_SSL === "true" ? {
      rejectUnauthorized: true,
      ...(env.DATABASE_CA_FILE ? { ca: readFileSync(env.DATABASE_CA_FILE, "utf8") } : {}),
    } : false as const,
    max: env.DATABASE_POOL_MAX,
    connectionTimeoutMillis: 8000,
    idleTimeoutMillis: 30000,
    statement_timeout: 15000,
    application_name: "cinderella-backend",
  };
}

export function apiConfig() {
  const result = apiSchema.safeParse(process.env);
  if (!result.success) throw new ApiError(503, "CONFIGURATION_ERROR", "Konfigurasi API dan Supabase belum lengkap atau tidak valid.");
  const config = result.data;
  const origins = config.CORS_ORIGINS.split(",").map(s => s.trim()).filter(Boolean);
  for (const origin of origins) {
    if (new URL(origin).origin !== origin) throw new Error("CORS_ORIGINS harus origin lengkap tanpa path atau slash akhir.");
  }
  return { ...config, origins };
}
