"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SeriesScore } from "@/lib/types";

type Choice = { winnerId: string; score: SeriesScore };

export default function PredictionForm({
  matchId,
  playerA,
  playerB,
  initial,
  locked = false,
}: {
  matchId: string;
  playerA: { id: string; name: string };
  playerB: { id: string; name: string };
  initial: { predictedWinnerId: string; predictedScore: SeriesScore } | null;
  /** true si el admin marcó la partida "en curso": ya no se aceptan pronósticos nuevos. */
  locked?: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState<Choice | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const options: { key: string; label: string; winnerId: string; score: SeriesScore }[] = [
    { key: "a20", label: `${playerA.name} 2-0`, winnerId: playerA.id, score: "2-0" },
    { key: "a21", label: `${playerA.name} 2-1`, winnerId: playerA.id, score: "2-1" },
    { key: "b21", label: `${playerB.name} 2-1`, winnerId: playerB.id, score: "2-1" },
    { key: "b20", label: `${playerB.name} 2-0`, winnerId: playerB.id, score: "2-0" },
  ];

  // Ya pronosticaste: es definitivo, se muestra de solo lectura.
  if (initial) {
    return (
      <div className="rounded-md border border-rda-gold/40 bg-rda-gold/10 p-3 text-center">
        <p className="text-sm text-rda-gold">
          Ya pronosticaste:{" "}
          <span className="font-semibold">
            {initial.predictedWinnerId === playerA.id ? playerA.name : playerB.name}{" "}
            {initial.predictedScore}
          </span>
        </p>
        <p className="mt-1 text-xs text-rda-muted">Los pronósticos no se pueden cambiar.</p>
      </div>
    );
  }

  // Todavía no pronosticaste, pero el admin cerró los pronósticos.
  if (locked) {
    return (
      <div className="rounded-md border border-rda-lose/40 bg-rda-lose/10 p-3 text-center">
        <p className="text-sm text-rda-lose">🔴 Partida en curso</p>
        <p className="mt-1 text-xs text-rda-muted">Los pronósticos para este partido están cerrados.</p>
      </div>
    );
  }

  async function confirm() {
    if (!pending) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId,
          predictedWinnerId: pending.winnerId,
          predictedScore: pending.score,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo guardar el pronóstico.");
        return;
      }
      router.refresh();
    } catch {
      setError("No se pudo guardar el pronóstico.");
    } finally {
      setSaving(false);
    }
  }

  if (pending) {
    const label = `${pending.winnerId === playerA.id ? playerA.name : playerB.name} ${pending.score}`;
    return (
      <div>
        <p className="mb-2 text-center text-sm">
          Elegiste: <span className="font-semibold text-rda-gold">{label}</span>
        </p>
        <p className="mb-3 text-center text-xs text-rda-muted">
          Una vez confirmado no se puede deshacer. ¿Confirmás?
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            className="btn-secondary flex-1 !py-1.5 text-sm"
            onClick={() => setPending(null)}
            disabled={saving}
          >
            Cambiar
          </button>
          <button
            type="button"
            className="btn-primary flex-1 !py-1.5 text-sm"
            onClick={confirm}
            disabled={saving}
          >
            {saving ? "Confirmando..." : "Confirmar"}
          </button>
        </div>
        {error && <p className="mt-2 text-center text-xs text-rda-lose">{error}</p>}
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-2">
        {options.map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => setPending({ winnerId: opt.winnerId, score: opt.score })}
            className="rounded-md border border-rda-border bg-rda-bg px-2 py-2 text-sm text-rda-text transition-colors hover:border-rda-gold/60"
          >
            {opt.label}
          </button>
        ))}
      </div>
      {error && <p className="mt-2 text-center text-xs text-rda-lose">{error}</p>}
    </div>
  );
}
