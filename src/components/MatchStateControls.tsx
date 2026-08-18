"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MatchStateControls({
  matchId,
  inProgress,
}: {
  matchId: string;
  inProgress: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle(next: boolean) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/match-state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId, inProgress: next }),
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

  return (
    <div className="card mb-6 flex items-center justify-between gap-3 p-3">
      <div>
        <p className="text-sm font-medium">
          {inProgress ? "🔴 Partida en curso" : "Partida sin empezar"}
        </p>
        <p className="text-xs text-rda-muted">
          {inProgress
            ? "Los pronósticos para este partido ya están cerrados."
            : "Marcala en curso para cerrar los pronósticos apenas arranque la serie."}
        </p>
        {error && <p className="mt-1 text-xs text-rda-lose">{error}</p>}
      </div>
      {inProgress ? (
        <button
          type="button"
          className="btn-secondary shrink-0 !px-3 !py-1.5 text-xs"
          onClick={() => toggle(false)}
          disabled={loading}
        >
          {loading ? "..." : "Reabrir pronósticos"}
        </button>
      ) : (
        <button
          type="button"
          className="btn-primary shrink-0 !px-3 !py-1.5 text-xs"
          onClick={() => toggle(true)}
          disabled={loading}
        >
          {loading ? "..." : "Marcar en curso"}
        </button>
      )}
    </div>
  );
}
