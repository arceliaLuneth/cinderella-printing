import "dotenv/config";
import { existsSync, readdirSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import pg from "pg";
import { apiConfig, databaseConfig } from "../src/lib/env";

const required = ["DATABASE_URL", "DATABASE_PASSWORD", "SUPABASE_URL", "SUPABASE_PUBLISHABLE_KEY"] as const;
const configured = (value: string | undefined) =>
  Boolean(value?.trim()) && !/PROJECT_REF|REPLACE_WITH_|ENCODED_PASSWORD|ISI_.*_DI_SINI|YOUR-PASSWORD/.test(value!);
let problems = 0;
function report(good: boolean, label: string, detail = "") {
  if (!good) problems++;
  console.log((good ? "[OK] " : "[BELUM] ") + label + (detail ? ": " + detail : ""));
}
function code(error: unknown) {
  return error && typeof error === "object" && "code" in error ? String(error.code) : "CONNECTION_FAILED";
}

async function main() {
  console.log("Pemeriksaan setup Cinderella Printing (nilai kredensial tidak ditampilkan)");
  report(Number(process.versions.node.split(".")[0]) >= 22, "Node.js", process.version);
  report(existsSync(".env"), "File .env");
  report(existsSync("node_modules/next/package.json"), "Dependensi backend");
  for (const key of required) report(configured(process.env[key]), key);
  const secretReady = configured(process.env.SUPABASE_SERVICE_ROLE_KEY);
  report(secretReady, "SUPABASE_SERVICE_ROLE_KEY", "dibutuhkan untuk membuat admin dan upload gambar");
  if (problems) {
    console.log("\nIsi konfigurasi yang ditandai BELUM pada .env. Jangan menempelkan secret key ke chat.");
    process.exitCode = 2; return;
  }
  if (process.argv.includes("--offline")) {
    console.log("\nKonfigurasi dasar lengkap. Jalankan tanpa --offline untuk menguji koneksi.");
    return;
  }
  const env = apiConfig();
  const client = new pg.Client(databaseConfig());
  try {
    await client.connect();
    report(true, "Koneksi PostgreSQL");
    const state = await client.query<{ admin: boolean; migrations: boolean }>(
      "SELECT to_regclass('printing.admin_users') IS NOT NULL AS admin, to_regclass('backend_meta.schema_migrations') IS NOT NULL AS migrations");
    const files = readdirSync("migrations").filter((file) => /^\d+_.+\.sql$/.test(file));
    const recorded = state.rows[0].migrations
      ? (await client.query<{ name: string }>("SELECT name FROM backend_meta.schema_migrations")).rows.map(({ name }) => name)
      : [];
    const ready = state.rows[0].admin && files.every((name) => recorded.includes(name));
    report(ready, "Migrasi database", ready ? "migrasi katalog dan pembayaran tersedia" : "jalankan npm.cmd run db:migrate");
    if (state.rows[0].admin) {
      const admins = await client.query<{ total: number }>("SELECT count(*)::integer AS total FROM printing.admin_users WHERE is_active");
      report(admins.rows[0].total > 0, "Admin aktif", admins.rows[0].total ? "tersedia" : "jalankan npm.cmd run admin:create");
    }
  } catch (error) {
    report(false, "Koneksi PostgreSQL", code(error) + "; periksa connection string, password dan CA TLS");
  } finally { await client.end().catch(() => {}); }

  try {
    const response = await fetch(env.SUPABASE_URL + "/auth/v1/settings", {
      headers: { apikey: env.SUPABASE_PUBLISHABLE_KEY }, signal: AbortSignal.timeout(10000),
    });
    report(response.ok, "Supabase Auth dan publishable key", "HTTP " + response.status);
  } catch { report(false, "Supabase Auth", "layanan belum dapat dihubungi"); }
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (url, options) => fetch(url, { ...options, signal: AbortSignal.timeout(10000) }) },
  });
  try {
    const result = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });
    report(!result.error, "Service role key", result.error ? "hak akses server belum valid" : "hak akses server valid");
  } catch { report(false, "Service role key", "layanan belum dapat dihubungi"); }
  try {
    const result = await supabase.storage.getBucket(env.SUPABASE_STORAGE_BUCKET);
    report(!result.error && result.data?.public === true, "Bucket gambar publik",
      result.error ? "jalankan supabase/setup-storage.sql pada SQL Editor Supabase" : env.SUPABASE_STORAGE_BUCKET);
  } catch { report(false, "Supabase Storage", "layanan belum dapat dihubungi"); }
  console.log(problems ? "\nSetup belum lengkap; perbaiki bagian BELUM lalu jalankan ulang." : "\nSetup terverifikasi. Jalankan npm.cmd run dev.");
  process.exitCode = problems ? 1 : 0;
}
main().catch(() => {
  console.error("[BELUM] Konfigurasi belum valid. Periksa .env dan petunjuk README.");
  process.exitCode = 1;
});
