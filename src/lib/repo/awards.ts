import { kv, KEYS } from "@/lib/kv";
import { AWARD_CATEGORY_KEYS } from "@/lib/data/awards";
import type { AwardCategory, AwardState, AwardVote } from "@/lib/types";

export async function getVote(category: AwardCategory, userId: string): Promise<AwardVote | null> {
  const v = await kv.get<AwardVote>(KEYS.awardVote(category, userId));
  return v ?? null;
}

export async function listVotes(category: AwardCategory): Promise<AwardVote[]> {
  const userIds = (await kv.smembers(KEYS.awardVoters(category))) as string[];
  if (!userIds || userIds.length === 0) return [];
  const votes = await Promise.all(userIds.map((uid) => getVote(category, uid)));
  return votes.filter((v): v is AwardVote => !!v);
}

/** Crea el voto de un usuario para una categoría. No permite sobreescribir uno ya existente. */
export async function createVote(params: {
  category: AwardCategory;
  userId: string;
  playerId: string;
}): Promise<AwardVote> {
  const existing = await getVote(params.category, params.userId);
  if (existing) {
    throw new Error("ALREADY_VOTED");
  }
  const vote: AwardVote = {
    category: params.category,
    userId: params.userId,
    playerId: params.playerId,
    createdAt: new Date().toISOString(),
  };
  await kv.set(KEYS.awardVote(params.category, params.userId), vote);
  await kv.sadd(KEYS.awardVoters(params.category), params.userId);
  return vote;
}

/** Solo para uso del admin: deshace el voto de un usuario en una categoría. */
export async function deleteVote(category: AwardCategory, userId: string): Promise<void> {
  await kv.del(KEYS.awardVote(category, userId));
  await kv.srem(KEYS.awardVoters(category), userId);
}

export async function getState(category: AwardCategory): Promise<AwardState> {
  const s = await kv.get<AwardState>(KEYS.awardState(category));
  return s ?? { category, closed: false, winnerPlayerId: null };
}

export async function getAllStates(): Promise<Record<AwardCategory, AwardState>> {
  const states = await Promise.all(AWARD_CATEGORY_KEYS.map((c) => getState(c)));
  return Object.fromEntries(AWARD_CATEGORY_KEYS.map((c, i) => [c, states[i]])) as Record<
    AwardCategory,
    AwardState
  >;
}

export async function setClosed(category: AwardCategory, closed: boolean): Promise<AwardState> {
  const state = await getState(category);
  const next: AwardState = {
    ...state,
    closed,
    closedAt: closed ? new Date().toISOString() : state.closedAt,
  };
  await kv.set(KEYS.awardState(category), next);
  return next;
}

/** Declara el ganador real: además cierra la votación de esa categoría (revela todo). */
export async function declareWinner(category: AwardCategory, playerId: string): Promise<AwardState> {
  const state = await getState(category);
  const next: AwardState = {
    ...state,
    winnerPlayerId: playerId,
    closed: true,
    closedAt: state.closedAt ?? new Date().toISOString(),
    revealedAt: new Date().toISOString(),
  };
  await kv.set(KEYS.awardState(category), next);
  return next;
}
