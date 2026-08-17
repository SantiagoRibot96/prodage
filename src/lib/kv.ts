import { Redis } from "@upstash/redis";

// Acepta tanto las variables del integration "Redis" (Upstash) del Marketplace
// de Vercel (UPSTASH_REDIS_REST_URL/TOKEN) como las del viejo "Vercel KV"
// (KV_REST_API_URL/TOKEN), por si ya tenías uno conectado.
const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL ?? "";
const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN ?? "";

export const kv = new Redis({ url, token });

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
} as const;
