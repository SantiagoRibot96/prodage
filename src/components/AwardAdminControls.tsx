"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Player } from "@/lib/data/players";
import type { AwardCategory } from "@/lib/types";

export default function AwardAdminControls({
  category,
  players,
  closed,
  winnerPlayerId,
}: {
  category: AwardCategory;
  players: Player[];
  closed: boolean;
  winnerPlayerId: string | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [winner, setWinner] = useState(winnerPlayerId ?? "");
  const [error, setError] = useState<string | null>(null);

  async function toggleClosed(next: boolean) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/awards/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, closed: next }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo actualizar.");
        return;
      }
      router.refresh();
    } catch {
      setError("No se pudo actualizar.");
    } finally {
      setLoading(false);
    }
  }

  async function declareWinner() {
    if (!winner) return;
    const name = players.find((p) => p.id === winner)?.name ?? winner;
    if (!confirm(`¿Declarar a ${name} como ganador real de esta categoría? Se revela a todos.`)) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/awards/winner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, playerId: winner }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo declarar el ganador.");
        return;
      }
      router.refresh();
    } catch {
      setError("No se pudo declarar el ganador.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-3 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-rda-muted">
          {closed ? "Votación cerrada" : "Votación abierta"}
        </span>
        <button
          type="button"
          className="btn-secondary !px-3 !py-1 text-xs"
          disabled={loading}
          onClick={() => toggleClosed(!closed)}
        >
          {closed ? "Reabrir votación" : "Cerrar votación"}
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <select
          className="input max-w-xs"
          value={winner}
          onChange={(e) => setWinner(e.target.value)}
        >
          <option value="">Elegí el ganador real</option>
          {players.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="btn-primary shrink-0 !px-3 !py-1 text-xs"
          disabled={loading || !winner}
          onClick={declareWinner}
        >
          Declarar ganador
        </button>
      </div>
      {error && <p className="text-xs text-rda-lose">{error}</p>}
    </div>
  );
}
