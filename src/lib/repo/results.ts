import { kv, KEYS } from "@/lib/kv";
import type { MatchResult } from "@/lib/types";

export async function getResult(matchId: string): Promise<MatchResult | null> {
  const r = await kv.get<MatchResult>(KEYS.result(matchId));
  return r ?? null;
}

export async function listResults(): Promise<MatchResult[]> {
  const ids = (await kv.smembers(KEYS.allResultIds)) as string[];
  if (!ids || ids.length === 0) return [];
  const results = await Promise.all(ids.map((id) => getResult(id)));
  return results.filter((r): r is MatchResult => !!r);
}

export async function saveResult(result: MatchResult): Promise<void> {
  await kv.set(KEYS.result(result.matchId), result);
  await kv.sadd(KEYS.allResultIds, result.matchId);
}

export async function deleteResult(matchId: string): Promise<void> {
  await kv.del(KEYS.result(matchId));
  await kv.srem(KEYS.allResultIds, matchId);
}
