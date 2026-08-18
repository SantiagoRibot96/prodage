import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { memoryKv } from "@/lib/memoryKv";

/**
 * Capa de "KV" (clave -> JSON, + sets) usada por todo el resto de la app
 * (repo/*.ts). Por debajo NO es Redis: es Postgres (Neon), con dos tablas
 * muy simples que emulan lo poco que necesitamos de Redis (GET/SET/DEL y
 * SADD/SMEMBERS/SREM). Se eligió así -en vez de un esquema relacional- para
 * no tener que tocar el resto del código de la app; a esta escala (una
 * docena de amigos, un puñado de partidos) no hace falta más.
 *
 * Neon tiene plan gratis (a diferencia de Redis/Upstash en el Marketplace de
 * Vercel al momento de escribir esto), por eso el cambio.
 *
 * IMPORTANTE: el cliente de Neon se crea de forma perezosa (recién adentro
 * de getSql(), memoizado) y nunca en el top-level del módulo. Next.js puede
 * agrupar este archivo en un chunk compartido por muchas rutas (por ejemplo
 * porque lo importan varias páginas), y si algo acá arriba llamara a neon()
 * al importar el módulo, alcanzaría con que UNA sola página estática
 * (como /login, que ni siquiera toca la base) cargue ese chunk durante el
 * build para que reviente el prerender con "Invalid URL", aunque
 * DATABASE_URL esté perfecta. Por eso getSql() solo se ejecuta en el
 * momento real de una consulta (siempre en runtime, nunca en build, porque
 * todas las páginas que tocan la base están marcadas force-dynamic).
 */

function readConnectionString(): string {
  return (
    process.env.DATABASE_URL ??
    process.env.POSTGRES_URL ??
    process.env.POSTGRES_PRISMA_URL ??
    process.env.POSTGRES_URL_NON_POOLING ??
    ""
  );
}

const hasDbConfig = Boolean(readConnectionString());

export interface KvLike {
  get<T = unknown>(key: string): Promise<T | null>;
  set(key: string, value: unknown): Promise<unknown>;
  del(key: string): Promise<number>;
  sadd(key: string, member: string): Promise<number>;
  smembers(key: string): Promise<string[]>;
  srem(key: string, member: string): Promise<number>;
}

let cachedSql: NeonQueryFunction<false, false> | null = null;

function getSql(): NeonQueryFunction<false, false> {
  if (!cachedSql) {
    const connectionString = readConnectionString();
    if (!connectionString) {
      throw new Error(
        "Falta DATABASE_URL: conectá una base de datos Postgres (Neon) desde Vercel " +
          "(Storage → Marketplace → Neon) y agregá la variable de entorno. " +
          "En local podés dejarla vacía para usar el almacenamiento en memoria de desarrollo."
      );
    }
    cachedSql = neon(connectionString);
  }
  return cachedSql;
}

let schemaReady: Promise<void> | null = null;
function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    const sql = getSql();
    schemaReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS kv_store (
          key   TEXT PRIMARY KEY,
          value JSONB NOT NULL
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS kv_set_members (
          key    TEXT NOT NULL,
          member TEXT NOT NULL,
          PRIMARY KEY (key, member)
        )
      `;
    })();
  }
  return schemaReady;
}

const postgresKv: KvLike = {
  async get<T = unknown>(key: string): Promise<T | null> {
    await ensureSchema();
    const sql = getSql();
    const rows = await sql`SELECT value FROM kv_store WHERE key = ${key}`;
    return (rows[0]?.value as T) ?? null;
  },

  async set(key: string, value: unknown): Promise<unknown> {
    await ensureSchema();
    const sql = getSql();
    await sql`
      INSERT INTO kv_store (key, value)
      VALUES (${key}, ${JSON.stringify(value)}::jsonb)
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
    `;
    return "OK";
  },

  async del(key: string): Promise<number> {
    await ensureSchema();
    const sql = getSql();
    const rows = await sql`DELETE FROM kv_store WHERE key = ${key} RETURNING key`;
    return rows.length;
  },

  async sadd(key: string, member: string): Promise<number> {
    await ensureSchema();
    const sql = getSql();
    const rows = await sql`
      INSERT INTO kv_set_members (key, member)
      VALUES (${key}, ${member})
      ON CONFLICT (key, member) DO NOTHING
      RETURNING member
    `;
    return rows.length;
  },

  async smembers(key: string): Promise<string[]> {
    await ensureSchema();
    const sql = getSql();
    const rows = await sql`SELECT member FROM kv_set_members WHERE key = ${key}`;
    return rows.map((r) => r.member as string);
  },

  async srem(key: string, member: string): Promise<number> {
    await ensureSchema();
    const sql = getSql();
    const rows = await sql`
      DELETE FROM kv_set_members WHERE key = ${key} AND member = ${member}
      RETURNING member
    `;
    return rows.length;
  },
};

export const kv: KvLike =
  hasDbConfig || process.env.NODE_ENV === "production" ? postgresKv : memoryKv;

// Convención de claves. Todo se guarda como JSON (o como filas de un "set").
export const KEYS = {
  userById: (id: string) => `user:byId:${id}`,
  userIdByUsername: (usernameLower: string) => `user:byUsername:${usernameLower}`,
  userIdByPlayer: (playerId: string) => `user:byPlayer:${playerId}`,
  allUserIds: "users:all",

  result: (matchId: string) => `result:${matchId}`,
  allResultIds: "results:all",

  prediction: (matchId: string, userId: string) => `pred:${matchId}:${userId}`,
  userIdsByMatch: (matchId: string) => `pred:byMatch:${matchId}`,
  matchIdsByUser: (userId: string) => `pred:byUser:${userId}`,

  playoffsState: "playoffs:state",

  inProgressSet: "matchState:inProgress",
} as const;
