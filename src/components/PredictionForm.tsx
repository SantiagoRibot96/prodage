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
}: {
  matchId: string;
  playerA: { id: string; name: string };
  playerB: { id: string; name: string };
  initial: { predictedWinnerId: string; predictedScore: SeriesScore } | null;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Choice | null>(
    initial ? { winnerId: initial.predictedWinnerId, score: initial.predictedScore } : null
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(!!initial);
  const [error, setError] = useState<string | null>(null);

  const options: { key: string; label: string; winnerId: string; score: SeriesScore }[] = [
    { key: "a20", label: `${playerA.name} 2-0`, winnerId: playerA.id, score: "2-0" },
    { key: "a21", label: `${playerA.name} 2-1`, winnerId: playerA.id, score: "2-1" },
    { key: "b21", label: `${playerB.name} 2-1`, winnerId: playerB.id, score: "2-1" },
    { key: "b20", label: `${playerB.name} 2-0`, winnerId: playerB.id, score: "2-0" },
  ];

  async function save(opt: Choice) {
    setSelected(opt);
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId,
          predictedWinnerId: opt.winnerId,
          predictedScore: opt.score,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo guardar el pronóstico.");
        return;
      }
      setSaved(true);
      router.refresh();
    } catch {
      setError("No se pudo guardar el pronóstico.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-2">
        {options.map((opt) => {
          const active = selected?.winnerId === opt.winnerId && selected?.score === opt.score;
          return (
            <button
              key={opt.key}
              type="button"
              disabled={saving}
              onClick={() => save({ winnerId: opt.winnerId, score: opt.score })}
              className={`rounded-md border px-2 py-2 text-sm transition-colors ${
                active
                  ? "border-rda-gold bg-rda-gold/10 text-rda-gold"
                  : "border-rda-border bg-rda-bg text-rda-text hover:border-rda-gold/60"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      <div className="mt-2 h-4 text-xs">
        {saving && <span className="text-rda-muted">Guardando...</span>}
        {!saving && saved && <span className="text-rda-win">✓ Pronóstico guardado</span>}
        {error && <span className="text-rda-lose">{error}</span>}
      </div>
    </div>
  );
}
