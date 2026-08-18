import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { AWARD_CATEGORY_KEYS } from "@/lib/data/awards";
import { deleteVote } from "@/lib/repo/awards";
import type { AwardCategory } from "@/lib/types";

export async function DELETE(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") as AwardCategory | null;
  const userId = searchParams.get("userId");

  if (!category || !AWARD_CATEGORY_KEYS.includes(category)) {
    return NextResponse.json({ error: "Categoría inválida." }, { status: 400 });
  }
  if (!userId) {
    return NextResponse.json({ error: "Falta el usuario." }, { status: 400 });
  }

  await deleteVote(category, userId);
  return NextResponse.json({ ok: true });
}
