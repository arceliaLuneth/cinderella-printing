import "dotenv/config";
import { parseArgs } from "node:util";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { apiConfig } from "../src/lib/env";
import { query, closeDatabase } from "../src/lib/db";
import { ADMIN_AUTH_EMAIL, ADMIN_USERNAME } from "../src/lib/admin-login";

async function readPassword(): Promise<string> {
  if (process.env.ADMIN_PASSWORD) return process.env.ADMIN_PASSWORD;
  if (!process.stdin.isTTY) throw new Error("Set ADMIN_PASSWORD jika terminal tidak interaktif.");
  process.stdout.write("Password admin (tidak ditampilkan, minimal 12 karakter): ");
  const input = process.stdin;
  input.setRawMode(true); input.resume(); input.setEncoding("utf8");
  return new Promise((resolve, reject) => {
    let password = "";
    const finish = () => { input.setRawMode(false); input.pause(); input.removeListener("data", onData); process.stdout.write("\n"); };
    const onData = (chunk: string) => {
      for (const char of chunk) {
        if (char === "\u0003") { finish(); reject(new Error("Dibatalkan")); return; }
        if (char === "\r" || char === "\n") { finish(); resolve(password); return; }
        if (char === "\u007f" || char === "\b") password = password.slice(0,-1);
        else password += char;
      }
    };
    input.on("data", onData);
  });
}
async function main() {
  try {
    const { values } = parseArgs({ options: {
      email: { type: "string" }, name: { type: "string" }, role: { type: "string", default: "admin" },
      username: { type: "string" },
      "user-id": { type: "string" },
    } });
    const input = z.object({
      email: z.email().optional(), username: z.literal(ADMIN_USERNAME).optional(), name: z.string().trim().min(1).max(120),
      role: z.enum(["owner","admin"]), "user-id": z.uuid().optional(),
    }).parse(values);
    if (Boolean(input.email) === Boolean(input.username)) throw new Error("Gunakan salah satu dari --email atau --username admin.");
    const email = input.email?.toLowerCase() ?? ADMIN_AUTH_EMAIL;
    const config = apiConfig();
    if (!/^(sb_secret_|eyJ)/.test(config.SUPABASE_SERVICE_ROLE_KEY)) {
      throw new Error("Isi SUPABASE_SERVICE_ROLE_KEY pada .env khusus server.");
    }
    await query("SELECT id FROM printing.admin_users LIMIT 0");
    const client = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    let userId = input["user-id"], created = false;
    if (userId) {
      const { data, error } = await client.auth.admin.getUserById(userId);
      if (error || data.user?.email?.toLowerCase() !== email) {
        throw new Error("UUID dan email tidak cocok dengan akun Supabase Auth.");
      }
    } else {
      const password = z.string().min(12).max(200).parse(await readPassword());
      const { data, error } = await client.auth.admin.createUser({
        email, password, email_confirm: true,
      });
      if (error || !data.user) throw new Error("Akun Auth belum dibuat. Jika email sudah terdaftar, gunakan --user-id dari dashboard Supabase.");
      userId = data.user.id; created = true;
    }
    try {
      await query(`INSERT INTO printing.admin_users (id,name,email,role)
        VALUES ($1,$2,$3,$4)`, [userId,input.name,email,input.role]);
    } catch (error) {
      if (created) {
        const cleanup = await client.auth.admin.deleteUser(userId);
        if (cleanup.error) console.error("Pencatatan database gagal; hapus akun Auth yatim melalui dashboard. UUID: " + userId);
      }
      throw error;
    }
    console.log("Admin berhasil dibuat. UUID: " + userId + " | Peran: " + input.role);
  } catch (error) {
    // Jangan mencetak object SDK yang mungkin membawa kredensial/response.
    console.error(error instanceof Error ? error.message : "Pembuatan admin gagal"); process.exitCode = 1;
  } finally { delete process.env.ADMIN_PASSWORD; await closeDatabase(); }
}
void main();
