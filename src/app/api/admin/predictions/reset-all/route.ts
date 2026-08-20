import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { deleteAllPredictions } from "@/lib/repo/predictions";

/**
 * Borra TODOS los pronósticos de TODOS los usuarios (para reiniciar el
 * prode desde cero). No toca resultados, tabla oficial, playoffs ni ningún
 * otro dato del torneo.
 */
export async function POST() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const deletedCount = await deleteAllPredictions();
  return NextResponse.json({ ok: true, deletedCount });
}
