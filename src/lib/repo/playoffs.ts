import { kv, KEYS } from "@/lib/kv";
import type { PlayoffsState } from "@/lib/types";

export async function getPlayoffs(): Promise<PlayoffsState | null> {
  const s = await kv.get<PlayoffsState>(KEYS.playoffsState);
  return s ?? null;
}

export async function savePlayoffs(state: PlayoffsState): Promise<void> {
  await kv.set(KEYS.playoffsState, state);
}
