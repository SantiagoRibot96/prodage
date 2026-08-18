import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { AWARD_CATEGORY_KEYS } from "@/lib/data/awards";
import { setClosed } from "@/lib/repo/awards";
import type { AwardCategory } from "@/lib/types";

export async function POST(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const category: AwardCategory = body?.category;
  const closed: boolean = body?.closed;

  if (!AWARD_CATEGORY_KEYS.includes(category)) {
    return NextResponse.json({ error: "Categoría inválida." }, { status: 400 });
  }
  if (typeof closed !== "boolean") {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }

  const state = await setClosed(category, closed);
  return NextResponse.json({ ok: true, state });
}
