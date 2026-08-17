import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { kv, KEYS } from "@/lib/kv";
import type { User, PublicUser } from "@/lib/types";

export function toPublicUser(u: User): PublicUser {
  const { passwordHash, ...rest } = u;
  return rest;
}

export async function getUserById(id: string): Promise<User | null> {
  const u = await kv.get<User>(KEYS.userById(id));
  return u ?? null;
}

export async function getUserByUsername(username: string): Promise<User | null> {
  const id = await kv.get<string>(KEYS.userIdByUsername(username.toLowerCase()));
  if (!id) return null;
  return getUserById(id);
}

export async function getUserIdByPlayer(playerId: string): Promise<string | null> {
  const id = await kv.get<string>(KEYS.userIdByPlayer(playerId));
  return id ?? null;
}

export async function listUsers(): Promise<User[]> {
  const ids = (await kv.smembers(KEYS.allUserIds)) as string[];
  if (!ids || ids.length === 0) return [];
  const users = await Promise.all(ids.map((id) => getUserById(id)));
  return users.filter((u): u is User => !!u);
}

export async function listTakenPlayerIds(): Promise<Set<string>> {
  const users = await listUsers();
  return new Set(users.map((u) => u.playerId));
}

export async function createUser(params: {
  username: string;
  password: string;
  playerId: string;
  isAdmin: boolean;
}): Promise<User> {
  const usernameLower = params.username.trim().toLowerCase();

  const existing = await getUserByUsername(usernameLower);
  if (existing) {
    throw new Error("Ese nombre de usuario ya está en uso.");
  }
  const playerTaken = await getUserIdByPlayer(params.playerId);
  if (playerTaken) {
    throw new Error("Ese jugador ya tiene una cuenta asociada.");
  }

  const passwordHash = await bcrypt.hash(params.password, 10);
  const user: User = {
    id: randomUUID(),
    username: usernameLower,
    displayUsername: params.username.trim(),
    passwordHash,
    playerId: params.playerId,
    isAdmin: params.isAdmin,
    createdAt: new Date().toISOString(),
  };

  await kv.set(KEYS.userById(user.id), user);
  await kv.set(KEYS.userIdByUsername(usernameLower), user.id);
  await kv.set(KEYS.userIdByPlayer(params.playerId), user.id);
  await kv.sadd(KEYS.allUserIds, user.id);

  return user;
}

export async function verifyPassword(user: User, password: string): Promise<boolean> {
  return bcrypt.compare(password, user.passwordHash);
}
