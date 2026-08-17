export type ScheduledMatch = {
  id: string;
  fecha: number;
  playerAId: string;
  playerBId: string;
};

export type Fecha = {
  number: number;
  label: string; // rango de fechas, ej "14 al 20 de Agosto"
  matches: ScheduledMatch[];
};

// pares [jugadorA, jugadorB] por fecha, tal cual el fixture ya sorteado.
const RAW_SCHEDULE: { label: string; pairs: [string, string][] }[] = [
  {
    label: "14 al 20 de Agosto",
    pairs: [
      ["depa", "ronan"],
      ["eltoro", "rocker"],
      ["ghosti", "peluca"],
      ["giancrack", "masa"],
      ["ian", "lucas"],
      ["infernus", "karnage"],
    ],
  },
  {
    label: "21 al 27 de Agosto",
    pairs: [
      ["depa", "rocker"],
      ["ronan", "peluca"],
      ["eltoro", "masa"],
      ["ghosti", "lucas"],
      ["giancrack", "karnage"],
      ["ian", "infernus"],
    ],
  },
  {
    label: "28 de Agosto al 3 de Septiembre",
    pairs: [
      ["depa", "peluca"],
      ["rocker", "masa"],
      ["ronan", "lucas"],
      ["eltoro", "karnage"],
      ["ghosti", "infernus"],
      ["giancrack", "ian"],
    ],
  },
  {
    label: "4 al 10 de Septiembre",
    pairs: [
      ["depa", "masa"],
      ["peluca", "lucas"],
      ["rocker", "karnage"],
      ["ronan", "infernus"],
      ["eltoro", "ian"],
      ["ghosti", "giancrack"],
    ],
  },
  {
    label: "11 al 17 de Septiembre",
    pairs: [
      ["depa", "lucas"],
      ["masa", "karnage"],
      ["peluca", "infernus"],
      ["rocker", "ian"],
      ["ronan", "giancrack"],
      ["eltoro", "ghosti"],
    ],
  },
  {
    label: "18 al 24 de Septiembre",
    pairs: [
      ["depa", "karnage"],
      ["lucas", "infernus"],
      ["masa", "ian"],
      ["peluca", "giancrack"],
      ["rocker", "ghosti"],
      ["ronan", "eltoro"],
    ],
  },
  {
    label: "25 de Septiembre al 1 de Octubre",
    pairs: [
      ["depa", "infernus"],
      ["karnage", "ian"],
      ["lucas", "giancrack"],
      ["masa", "ghosti"],
      ["peluca", "eltoro"],
      ["rocker", "ronan"],
    ],
  },
  {
    label: "2 al 8 de Octubre",
    pairs: [
      ["depa", "ian"],
      ["infernus", "giancrack"],
      ["karnage", "ghosti"],
      ["lucas", "eltoro"],
      ["masa", "ronan"],
      ["peluca", "rocker"],
    ],
  },
  {
    label: "9 al 15 de Octubre",
    pairs: [
      ["depa", "giancrack"],
      ["ian", "ghosti"],
      ["infernus", "eltoro"],
      ["karnage", "ronan"],
      ["lucas", "rocker"],
      ["masa", "peluca"],
    ],
  },
  {
    label: "16 al 22 de Octubre",
    pairs: [
      ["depa", "ghosti"],
      ["giancrack", "eltoro"],
      ["ian", "ronan"],
      ["infernus", "rocker"],
      ["karnage", "peluca"],
      ["lucas", "masa"],
    ],
  },
  {
    label: "23 al 29 de Octubre",
    pairs: [
      ["depa", "eltoro"],
      ["ghosti", "ronan"],
      ["giancrack", "rocker"],
      ["ian", "peluca"],
      ["infernus", "masa"],
      ["karnage", "lucas"],
    ],
  },
];

export const FECHAS: Fecha[] = RAW_SCHEDULE.map((f, idx) => {
  const number = idx + 1;
  return {
    number,
    label: f.label,
    matches: f.pairs.map(([a, b], i) => ({
      id: `f${number}-${a}-${b}`,
      fecha: number,
      playerAId: a,
      playerBId: b,
    })),
  };
});

export const ALL_GROUP_MATCHES: ScheduledMatch[] = FECHAS.flatMap((f) => f.matches);

export const GROUP_MATCHES_BY_ID: Record<string, ScheduledMatch> = Object.fromEntries(
  ALL_GROUP_MATCHES.map((m) => [m.id, m])
);

export function fechaOf(matchId: string): Fecha | undefined {
  const m = GROUP_MATCHES_BY_ID[matchId];
  if (!m) return undefined;
  return FECHAS.find((f) => f.number === m.fecha);
}
