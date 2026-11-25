import pg, { type PoolClient, type QueryResultRow } from "pg";
import { databaseConfig } from "./env";

const globalDb = globalThis as unknown as { printingPool?: pg.Pool };
export function pool() {
  if (!globalDb.printingPool) {
    globalDb.printingPool = new pg.Pool(databaseConfig());
    globalDb.printingPool.on("error", () => console.error(JSON.stringify({ event: "database_pool_error" })));
  }
  return globalDb.printingPool;
}
export async function query<T extends QueryResultRow = QueryResultRow>(sql: string, values: unknown[] = []) {
  return pool().query<T>(sql, values);
}
export async function transaction<T>(work: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool().connect();
  try {
    await client.query("BEGIN");
    const result = await work(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
export async function closeDatabase() {
  const db = globalDb.printingPool;
  delete globalDb.printingPool;
  if (db) await db.end();
}
export async function audit(
  db: PoolClient, actorId: string, action: string, entity: string, id: string,
  metadata: Record<string, unknown> = {},
) {
  await db.query(
    "INSERT INTO printing.audit_logs (actor_id, action, entity_type, entity_id, metadata) VALUES ($1,$2,$3,$4,$5)",
    [actorId, action, entity, id, JSON.stringify(metadata)],
  );
}
