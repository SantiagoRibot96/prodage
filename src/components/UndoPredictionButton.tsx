"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UndoPredictionButton({
  matchId,
  userId,
  username,
}: {
  matchId: string;
  userId: string;
  username: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    if (!confirm(`¿Deshacer el pronóstico de ${username} para este partido? Va a poder volver a pronosticar.`)) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/predictions?matchId=${encodeURIComponent(matchId)}&userId=${encodeURIComponent(userId)}`,
        { method: "DELETE" }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "No se pudo deshacer.");
        return;
      }
      router.refresh();
    } catch {
      setError("No se pudo deshacer.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <span>
      <button
        type="button"
        className="text-xs text-rda-lose hover:underline disabled:opacity-50"
        onClick={onClick}
        disabled={loading}
      >
        {loading ? "..." : "Deshacer"}
      </button>
      {error && <span className="ml-2 text-xs text-rda-lose">{error}</span>}
    </span>
  );
}
