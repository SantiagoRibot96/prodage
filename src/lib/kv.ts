import { Redis } from "@upstash/redis";
import { memoryKv } from "@/lib/memoryKv";

// Acepta tanto las variables del integration "Redis" (Upstash) del Marketplace
// de Vercel (UPSTASH_REDIS_REST_URL/TOKEN) como las del viejo "Vercel KV"
// (KV_REST_API_URL/TOKEN), por si ya tenías uno conectado.
const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL ?? "";
const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN ?? "";
const hasRedisConfig = Boolean(url && token);

export interface KvLike {
  get<T = unknown>(key: string): Promise<T | null>;
  set(key: string, value: unknown): Promise<unknown>;
  del(key: string): Promise<number>;
  sadd(key: string, member: string): Promise<number>;
  smembers(key: string): Promise<string[]>;
  srem(key: string, member: string): Promise<number>;
}

if (!hasRedisConfig && process.env.NODE_ENV !== "production") {
  // eslint-disable-next-line no-console
  console.warn(
    "[prode] No hay Redis configurado (falta UPSTASH_REDIS_REST_URL/TOKEN en .env.local). " +
      "Usando almacenamiento en memoria SOLO para desarrollo: los datos se pierden al reiniciar `npm run dev`."
  );
}

export const kv: KvLike =
  hasRedisConfig || process.env.NODE_ENV === "production"
    ? (new Redis({ url, token }) as unknown as KvLike)
    : memoryKv;

// Convención de claves usadas en Redis. Todo se guarda como JSON.
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
