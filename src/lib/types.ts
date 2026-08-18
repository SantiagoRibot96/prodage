export type MatchResultStatus = "played" | "admin_win" | "no_contest";
export type SeriesScore = "2-0" | "2-1";
export type Stage = "group" | "semi" | "final";

export type GameResult = {
  gameNumber: 1 | 2 | 3;
  map: string;
  winnerId: string; // playerId
  civA: string; // civ usada por playerA en este mapa
  civB: string; // civ usada por playerB en este mapa
};

export type MatchResult = {
  matchId: string;
  stage: Stage;
  playerAId: string;
  playerBId: string;
  status: MatchResultStatus;
  winnerId: string | null;
  score: SeriesScore | null; // null si status === "no_contest"
  games: GameResult[];
  bansA: string[]; // 2 civs baneadas por playerA (no las puede usar nadie en la serie)
  bansB: string[]; // 2 civs baneadas por playerB
  note?: string;
  enteredBy: string; // username del admin
  enteredAt: string; // ISO date
  updatedAt: string; // ISO date
};

export type Prediction = {
  matchId: string;
  userId: string;
  predictedWinnerId: string;
  predictedScore: SeriesScore;
  createdAt: string;
  updatedAt: string;
};

export type User = {
  id: string;
  username: string; // guardado en minúsculas
  displayUsername: string; // tal cual lo escribió el usuario
  passwordHash: string;
  playerId: string | null; // null si es una cuenta de invitado (no juega el torneo)
  isAdmin: boolean;
  createdAt: string;
};

export type PublicUser = Omit<User, "passwordHash">;

export type PlayoffSlot = {
  playerId: string | null;
  seed: number | null;
  fromMatchId?: string; // si viene del ganador de otro cruce (para la final)
};

export type PlayoffMatch = {
  id: string; // "semi-1" | "semi-2" | "final"
  stage: "semi" | "final";
  label: string;
  a: PlayoffSlot;
  b: PlayoffSlot;
};

export type PlayoffsState = {
  generatedAt: string;
  seeds: { seed: number; playerId: string }[]; // top 4 al momento de generar
  matches: PlayoffMatch[];
};

export type StandingsRow = {
  playerId: string;
  played: number;
  won: number;
  lost: number;
  points: number;
  mapsWon: number;
  mapsLost: number;
  rank: number;
};

export type ProdeRow = {
  userId: string;
  playerId: string | null;
  displayUsername: string;
  points: number;
  exactCount: number;
  winnerOnlyCount: number;
  missedCount: number;
  predictedCount: number;
};

/**
 * Premios de la temporada (encuesta entre amigos, no suma puntos al prode):
 * cada usuario vota una vez por categoría, sin poder cambiarlo. El admin
 * puede cerrar la votación de una categoría y, cuando quiera, declarar el
 * ganador real (eso revela cómo votó todo el mundo).
 */
export type AwardCategory = "campeon" | "revelacion" | "promesa";

export type AwardVote = {
  category: AwardCategory;
  userId: string;
  playerId: string;
  createdAt: string;
};

export type AwardState = {
  category: AwardCategory;
  closed: boolean;
  winnerPlayerId: string | null;
  closedAt?: string;
  revealedAt?: string;
};
