import { kv, KEYS } from "@/lib/kv";

// Estado transitorio "la partida se está jugando ahora mismo", cargado por el
// admin. Mientras está activo, se bloquean los pronósticos para ese partido
// aunque todavía no haya un resultado cargado. Es independiente del
// resultado final (ver repo/results.ts).

export async function listInProgressIds(): Promise<Set<string>> {
  const ids = (await kv.smembers(KEYS.inProgressSet)) as string[];
  return new Set(ids ?? []);
}

export async function isInProgress(matchId: string): Promise<boolean> {
  const ids = await listInProgressIds();
  return ids.has(matchId);
}

export async function setInProgress(matchId: string): Promise<void> {
  await kv.sadd(KEYS.inProgressSet, matchId);
}

export async function clearInProgress(matchId: string): Promise<void> {
  await kv.srem(KEYS.inProgressSet, matchId);
}
