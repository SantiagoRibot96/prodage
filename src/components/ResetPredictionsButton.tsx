"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const CONFIRM_PHRASE = "REINICIAR PRODE";

export default function ResetPredictionsButton({ currentCount }: { currentCount: number }) {
  const router = useRouter();
  const [typed, setTyped] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<number | null>(null);

  const enabled = typed.trim() === CONFIRM_PHRASE && !loading && currentCount > 0;

  async function onReset() {
    if (!enabled) return;
    if (
      !confirm(
        `Esto borra los ${currentCount} pronósticos cargados de TODOS los usuarios (no toca resultados, tabla ni playoffs). ¿Confirmás?`
      )
    ) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/predictions/reset-all", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo reiniciar.");
        return;
      }
      setDone(data.deletedCount);
      setTyped("");
      router.refresh();
    } catch {
      setError("No se pudo reiniciar.");
    } finally {
      setLoading(false);
    }
  }

  if (currentCount === 0 && done === null) {
    return <p className="text-sm text-rda-muted">No hay pronósticos cargados todavía.</p>;
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-rda-muted">
        Hay <strong className="text-rda-text">{currentCount}</strong> pronóstico
        {currentCount === 1 ? "" : "s"} cargado{currentCount === 1 ? "" : "s"} en total, de todos
        los usuarios y todas las fechas. Esta acción los borra todos (no se puede deshacer) y NO
        toca resultados, tabla oficial, ni playoffs.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <input
          className="input max-w-xs"
          placeholder={`Escribí "${CONFIRM_PHRASE}" para confirmar`}
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
        />
        <button
          type="button"
          className="btn-primary !bg-rda-lose !text-white shrink-0 !px-3 !py-1.5 text-xs disabled:opacity-40"
          disabled={!enabled}
          onClick={onReset}
        >
          {loading ? "Reiniciando..." : "Reiniciar todos los pronósticos"}
        </button>
      </div>
      {error && <p className="text-xs text-rda-lose">{error}</p>}
      {done !== null && (
        <p className="text-xs text-rda-win">Listo: se borraron {done} pronósticos. El prode arrancó de cero.</p>
      )}
    </div>
  );
}
