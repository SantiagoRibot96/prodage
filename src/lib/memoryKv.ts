// Almacenamiento en memoria usado SOLO como fallback de desarrollo local
// cuando no hay credenciales de Redis configuradas (ver lib/kv.ts). Los datos
// se pierden al reiniciar `npm run dev`. En producción (Vercel) esto nunca se
// usa: ahí sí hace falta conectar Redis de verdad.
//
// Se cuelga de `globalThis` (patrón típico en Next.js dev) porque el servidor
// de desarrollo puede recompilar este módulo por separado para distintas
// rutas; sin esto, cada ruta vería su propia copia vacía del store.

declare global {
  // eslint-disable-next-line no-var
  var __prodeMemStore: Map<string, unknown> | undefined;
  // eslint-disable-next-line no-var
  var __prodeMemSets: Map<string, Set<string>> | undefined;
}

const store = globalThis.__prodeMemStore ?? (globalThis.__prodeMemStore = new Map());
const sets = globalThis.__prodeMemSets ?? (globalThis.__prodeMemSets = new Map());

export const memoryKv = {
  async get<T = unknown>(key: string): Promise<T | null> {
    return store.has(key) ? (store.get(key) as T) : null;
  },
  async set(key: string, value: unknown): Promise<"OK"> {
    store.set(key, value);
    return "OK";
  },
  async del(key: string): Promise<number> {
    const had = store.delete(key);
    sets.delete(key);
    return had ? 1 : 0;
  },
  async sadd(key: string, member: string): Promise<number> {
    let s = sets.get(key);
    if (!s) {
      s = new Set();
      sets.set(key, s);
    }
    const isNew = !s.has(member);
    s.add(member);
    return isNew ? 1 : 0;
  },
  async smembers(key: string): Promise<string[]> {
    return Array.from(sets.get(key) ?? []);
  },
  async srem(key: string, member: string): Promise<number> {
    const s = sets.get(key);
    if (!s) return 0;
    return s.delete(member) ? 1 : 0;
  },
};
