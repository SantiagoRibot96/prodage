import { kv, KEYS } from "@/lib/kv";
import { listUsers } from "@/lib/repo/users";
import type { Prediction, SeriesScore } from "@/lib/types";

export async function getPrediction(
  matchId: string,
  userId: string
): Promise<Prediction | null> {
  const p = await kv.get<Prediction>(KEYS.prediction(matchId, userId));
  return p ?? null;
}

export async function listPredictionsForMatch(matchId: string): Promise<Prediction[]> {
  const userIds = (await kv.smembers(KEYS.userIdsByMatch(matchId))) as string[];
  if (!userIds || userIds.length === 0) return [];
  const preds = await Promise.all(userIds.map((uid) => getPrediction(matchId, uid)));
  return preds.filter((p): p is Prediction => !!p);
}

export async function listPredictionsForUser(userId: string): Promise<Prediction[]> {
  const matchIds = (await kv.smembers(KEYS.matchIdsByUser(userId))) as string[];
  if (!matchIds || matchIds.length === 0) return [];
  const preds = await Promise.all(matchIds.map((mid) => getPrediction(mid, userId)));
  return preds.filter((p): p is Prediction => !!p);
}

/**
 * Crea el pronóstico de un usuario para un partido. A propósito NO permite
 * sobreescribir uno ya existente: una vez confirmado, un pronóstico es
 * definitivo para el usuario (solo el admin puede deshacerlo, ver
 * deletePrediction).
 */
export async function createPrediction(params: {
  matchId: string;
  userId: string;
  predictedWinnerId: string;
  predictedScore: SeriesScore;
}): Promise<Prediction> {
  const existing = await getPrediction(params.matchId, params.userId);
  if (existing) {
    throw new Error("ALREADY_PREDICTED");
  }
  const now = new Date().toISOString();
  const prediction: Prediction = {
    matchId: params.matchId,
    userId: params.userId,
    predictedWinnerId: params.predictedWinnerId,
    predictedScore: params.predictedScore,
    createdAt: now,
    updatedAt: now,
  };
  await kv.set(KEYS.prediction(params.matchId, params.userId), prediction);
  await kv.sadd(KEYS.userIdsByMatch(params.matchId), params.userId);
  await kv.sadd(KEYS.matchIdsByUser(params.userId), params.matchId);
  return prediction;
}

/** Solo para uso del admin: deshace el pronóstico de un usuario para un partido. */
export async function deletePrediction(matchId: string, userId: string): Promise<void> {
  await kv.del(KEYS.prediction(matchId, userId));
  await kv.srem(KEYS.userIdsByMatch(matchId), userId);
  await kv.srem(KEYS.matchIdsByUser(userId), matchId);
}

/** Cuántos pronósticos hay cargados en total (para mostrar antes de un reinicio). */
export async function countAllPredictions(): Promise<number> {
  const users = await listUsers();
  const counts = await Promise.all(
    users.map(async (u) => ((await kv.smembers(KEYS.matchIdsByUser(u.id))) as string[]).length)
  );
  return counts.reduce((sum, n) => sum + n, 0);
}

/**
 * Solo para uso del admin: borra TODOS los pronósticos de TODOS los usuarios
 * (para "arrancar de cero" el prode). No toca resultados, tabla oficial,
 * playoffs, ni ningún otro dato del torneo — solo la tabla de pronósticos.
 */
export async function deleteAllPredictions(): Promise<number> {
  const users = await listUsers();
  let total = 0;
  for (const u of users) {
    const matchIds = (await kv.smembers(KEYS.matchIdsByUser(u.id))) as string[];
    for (const matchId of matchIds) {
      await kv.del(KEYS.prediction(matchId, u.id));
      await kv.srem(KEYS.userIdsByMatch(matchId), u.id);
      await kv.srem(KEYS.matchIdsByUser(u.id), matchId);
      total += 1;
    }
  }
  return total;
}
