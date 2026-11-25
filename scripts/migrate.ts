import "dotenv/config";
import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import pg from "pg";
import { databaseConfig } from "../src/lib/env";

export async function migrate(connectionString = process.env.MIGRATION_DATABASE_URL || process.env.DATABASE_URL) {
  const client = new pg.Client(databaseConfig(connectionString));
  await client.connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(hashtext('cinderella_schema_migrations'))");
    await client.query("CREATE SCHEMA IF NOT EXISTS backend_meta");
    await client.query("REVOKE ALL ON SCHEMA backend_meta FROM PUBLIC");
    await client.query(`CREATE TABLE IF NOT EXISTS backend_meta.schema_migrations (
      name text PRIMARY KEY, sha256 text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now()
    )`);
    await client.query("REVOKE ALL ON backend_meta.schema_migrations FROM PUBLIC");
    const directory = path.join(process.cwd(), "migrations");
    const files = (await readdir(directory)).filter(file => /^\d+_.+\.sql$/.test(file)).sort();
    for (const file of files) {
      const sql = await readFile(path.join(directory, file), "utf8");
      const checksum = createHash("sha256").update(sql).digest("hex");
      const previous = await client.query<{ sha256: string }>("SELECT sha256 FROM backend_meta.schema_migrations WHERE name=$1", [file]);
      if (previous.rows[0]) {
        if (previous.rows[0].sha256 !== checksum) throw new Error("Migrasi yang sudah diterapkan berubah: " + file + ". Buat migrasi baru.");
        continue;
      }
      await client.query(sql);
      await client.query("INSERT INTO backend_meta.schema_migrations (name,sha256) VALUES ($1,$2)", [file,checksum]);
      console.log("Migrasi berhasil: " + file);
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally { await client.end(); }
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  migrate().catch(error => { console.error(error instanceof Error ? error.message : "Migrasi gagal"); process.exitCode = 1; });
}
