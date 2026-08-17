export type Player = {
  id: string;
  name: string;
};

// Los 12 jugadores de la Liga Interna RDA, ya sorteados.
export const PLAYERS: Player[] = [
  { id: "depa", name: "Depa" },
  { id: "ronan", name: "Ronan" },
  { id: "eltoro", name: "El Toro" },
  { id: "rocker", name: "Rocker" },
  { id: "ghosti", name: "Ghosti" },
  { id: "peluca", name: "Peluca" },
  { id: "giancrack", name: "Giancrack" },
  { id: "masa", name: "Masa" },
  { id: "ian", name: "Ian" },
  { id: "lucas", name: "Lucas" },
  { id: "infernus", name: "Infernus" },
  { id: "karnage", name: "Karnage" },
];

export const PLAYERS_BY_ID: Record<string, Player> = Object.fromEntries(
  PLAYERS.map((p) => [p.id, p])
);

export function playerName(id: string | null | undefined): string {
  if (!id) return "?";
  return PLAYERS_BY_ID[id]?.name ?? id;
}
