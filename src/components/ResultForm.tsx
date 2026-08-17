"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CIVS } from "@/lib/data/civs";
import { ADMIN_MAP, MAP_POOL } from "@/lib/data/maps";
import type { MatchResult, MatchResultStatus, SeriesScore } from "@/lib/types";

type GameDraft = { map: string; winnerId: string; civA: string; civB: string };

const NONE = "";

export default function ResultForm({
  matchId,
  playerA,
  playerB,
  existing,
}: {
  matchId: string;
  playerA: { id: string; name: string };
  playerB: { id: string; name: string };
  existing: MatchResult | null;
}) {
  const router = useRouter();

  const [status, setStatus] = useState<MatchResultStatus>(existing?.status ?? "played");
  const [winnerId, setWinnerId] = useState<string>(existing?.winnerId ?? playerA.id);
  const [score, setScore] = useState<SeriesScore>(existing?.score ?? "2-0");
  const [includeDetail, setIncludeDetail] = useState<boolean>(
    existing ? existing.games.length > 0 : true
  );
  const [note, setNote] = useState(existing?.note ?? "");

  const gamesNeeded = score === "2-0" ? 2 : 3;

  const [games, setGames] = useState<GameDraft[]>(() => {
    if (existing && existing.games.length > 0) {
      return existing.games.map((g) => ({ map: g.map, winnerId: g.winnerId, civA: g.civA, civB: g.civB }));
    }
    return Array.from({ length: gamesNeeded }, (_, i) => ({
      map: i === 0 ? ADMIN_MAP : NONE,
      winnerId: NONE,
      civA: NONE,
      civB: NONE,
    }));
  });

  const [bansA, setBansA] = useState<[string, string]>([existing?.bansA[0] ?? NONE, existing?.bansA[1] ?? NONE]);
  const [bansB, setBansB] = useState<[string, string]>([existing?.bansB[0] ?? NONE, existing?.bansB[1] ?? NONE]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  function updateGamesLength(newScore: SeriesScore) {
    const needed = newScore === "2-0" ? 2 : 3;
    setGames((prev) => {
      const next = [...prev];
      while (next.length < needed) {
        next.push({ map: NONE, winnerId: NONE, civA: NONE, civB: NONE });
      }
      return next.slice(0, needed);
    });
  }

  function setGame(idx: number, patch: Partial<GameDraft>) {
    setGames((prev) => prev.map((g, i) => (i === idx ? { ...g, ...patch } : g)));
  }

  const usedCivsA = useMemo(() => games.map((g) => g.civA).filter(Boolean), [games]);
  const usedCivsB = useMemo(() => games.map((g) => g.civB).filter(Boolean), [games]);
  const bannedCivs = useMemo(() => [...bansA, ...bansB].filter(Boolean), [bansA, bansB]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOkMsg(null);
    setSaving(true);

    const body: any = {
      matchId,
      status,
      bansA: bansA.filter(Boolean),
      bansB: bansB.filter(Boolean),
      note: note || undefined,
    };

    if (status !== "no_contest") {
      body.winnerId = winnerId;
      body.score = score;
      if (status === "played" || includeDetail) {
        body.games = games.map((g, i) => ({
          gameNumber: i + 1,
          map: g.map,
          winnerId: g.winnerId,
          civA: g.civA,
          civB: g.civB,
        }));
      } else {
        body.games = [];
      }
    }

    try {
      const res = await fetch("/api/admin/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo guardar el resultado.");
        return;
      }
      setOkMsg("Resultado guardado.");
      router.refresh();
    } catch {
      setError("No se pudo guardar el resultado.");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!confirm("¿Borrar este resultado y reabrir los pronósticos?")) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/results?matchId=${encodeURIComponent(matchId)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "No se pudo borrar el resultado.");
        return;
      }
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  const showGames = status === "played" || (status === "admin_win" && includeDetail);

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label className="label">Estado del partido</label>
        <div className="flex flex-wrap gap-2">
          {(
            [
              { v: "played", l: "Jugado" },
              { v: "admin_win", l: "Admin Win" },
              { v: "no_contest", l: "Sin contienda" },
            ] as { v: MatchResultStatus; l: string }[]
          ).map((opt) => (
            <button
              key={opt.v}
              type="button"
              onClick={() => setStatus(opt.v)}
              className={`rounded-md border px-3 py-1.5 text-sm ${
                status === opt.v
                  ? "border-rda-gold bg-rda-gold/10 text-rda-gold"
                  : "border-rda-border text-rda-text hover:border-rda-gold/60"
              }`}
            >
              {opt.l}
            </button>
          ))}
        </div>
      </div>

      {status !== "no_contest" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Ganador de la serie</label>
            <select
              className="input"
              value={winnerId}
              onChange={(e) => setWinnerId(e.target.value)}
            >
              <option value={playerA.id}>{playerA.name}</option>
              <option value={playerB.id}>{playerB.name}</option>
            </select>
          </div>
          <div>
            <label className="label">Marcador</label>
            <select
              className="input"
              value={score}
              onChange={(e) => {
                const v = e.target.value as SeriesScore;
                setScore(v);
                updateGamesLength(v);
              }}
            >
              <option value="2-0">2-0</option>
              <option value="2-1">2-1</option>
            </select>
          </div>
        </div>
      )}

      {status === "admin_win" && (
        <label className="flex items-center gap-2 text-sm text-rda-muted">
          <input
            type="checkbox"
            checked={includeDetail}
            onChange={(e) => setIncludeDetail(e.target.checked)}
          />
          Cargar detalle de mapas/civs igual (si se llegó a jugar algo)
        </label>
      )}

      {status === "no_contest" && (
        <p className="text-sm text-rda-muted">
          Ningún jugador tuvo voluntad de jugar la fecha: 0 puntos para ambos, no afecta mapas
          ganados/perdidos.
        </p>
      )}

      {showGames && (
        <div>
          <label className="label">Mapas jugados</label>
          <div className="space-y-3">
            {games.map((g, i) => (
              <div key={i} className="card grid gap-2 p-3 sm:grid-cols-4">
                <div>
                  <span className="mb-1 block text-xs text-rda-muted">Mapa {i + 1}</span>
                  {i === 0 ? (
                    <input className="input" value={ADMIN_MAP} disabled />
                  ) : (
                    <select
                      className="input"
                      value={g.map}
                      onChange={(e) => setGame(i, { map: e.target.value })}
                    >
                      <option value="">Elegí mapa</option>
                      {MAP_POOL.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div>
                  <span className="mb-1 block text-xs text-rda-muted">Ganador del mapa</span>
                  <select
                    className="input"
                    value={g.winnerId}
                    onChange={(e) => setGame(i, { winnerId: e.target.value })}
                  >
                    <option value="">Elegí</option>
                    <option value={playerA.id}>{playerA.name}</option>
                    <option value={playerB.id}>{playerB.name}</option>
                  </select>
                </div>
                <div>
                  <span className="mb-1 block text-xs text-rda-muted">Civ {playerA.name}</span>
                  <select
                    className="input"
                    value={g.civA}
                    onChange={(e) => setGame(i, { civA: e.target.value })}
                  >
                    <option value="">Elegí civ</option>
                    {CIVS.map((c) => (
                      <option
                        key={c}
                        value={c}
                        disabled={(usedCivsA.includes(c) && g.civA !== c) || bannedCivs.includes(c)}
                      >
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <span className="mb-1 block text-xs text-rda-muted">Civ {playerB.name}</span>
                  <select
                    className="input"
                    value={g.civB}
                    onChange={(e) => setGame(i, { civB: e.target.value })}
                  >
                    <option value="">Elegí civ</option>
                    {CIVS.map((c) => (
                      <option
                        key={c}
                        value={c}
                        disabled={(usedCivsB.includes(c) && g.civB !== c) || bannedCivs.includes(c)}
                      >
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {status !== "no_contest" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Civs baneadas por {playerA.name}</label>
            <div className="grid grid-cols-2 gap-2">
              {[0, 1].map((i) => (
                <select
                  key={i}
                  className="input"
                  value={bansA[i]}
                  onChange={(e) =>
                    setBansA((prev) => {
                      const next = [...prev] as [string, string];
                      next[i] = e.target.value;
                      return next;
                    })
                  }
                >
                  <option value="">Sin banear</option>
                  {CIVS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Civs baneadas por {playerB.name}</label>
            <div className="grid grid-cols-2 gap-2">
              {[0, 1].map((i) => (
                <select
                  key={i}
                  className="input"
                  value={bansB[i]}
                  onChange={(e) =>
                    setBansB((prev) => {
                      const next = [...prev] as [string, string];
                      next[i] = e.target.value;
                      return next;
                    })
                  }
                >
                  <option value="">Sin banear</option>
                  {CIVS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              ))}
            </div>
          </div>
        </div>
      )}

      <div>
        <label className="label">Nota (opcional)</label>
        <input
          className="input"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ej: no se presentó, admin win por incomparecencia..."
        />
      </div>

      {error && <p className="text-sm text-rda-lose">{error}</p>}
      {okMsg && <p className="text-sm text-rda-win">{okMsg}</p>}

      <div className="flex gap-3">
        <button className="btn-primary" disabled={saving}>
          {saving ? "Guardando..." : existing ? "Actualizar resultado" : "Guardar resultado"}
        </button>
        {existing && (
          <button type="button" className="btn-secondary" disabled={saving} onClick={onDelete}>
            Borrar resultado
          </button>
        )}
      </div>
    </form>
  );
}
