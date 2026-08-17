// Map pool (handbook, sección 5): el juego 1 siempre es el "Admin Map" (Arabia).
// El perdedor de cada mapa elige el siguiente entre el resto del pool (sin repetir).
export const ADMIN_MAP = "Arabia";

export const MAP_POOL: string[] = [
  "Tormenta de Polvo",
  "Socotra",
  "Land Nomad",
  "Mega Random",
  "Arena",
  "Claro Africano",
];

export const ALL_MAPS: string[] = [ADMIN_MAP, ...MAP_POOL];
