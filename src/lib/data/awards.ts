import type { AwardCategory } from "@/lib/types";

export const AWARD_CATEGORIES: {
  key: AwardCategory;
  label: string;
  description: string;
}[] = [
  {
    key: "campeon",
    label: "Campeón",
    description: "¿Quién creés que se corona campeón del torneo?",
  },
  {
    key: "revelacion",
    label: "Revelación",
    description: "El jugador que más te sorprendió para bien.",
  },
  {
    key: "promesa",
    label: "Promesa",
    description: "El jugador con más margen para crecer de acá en más.",
  },
];

export const AWARD_CATEGORY_KEYS: AwardCategory[] = AWARD_CATEGORIES.map((c) => c.key);

export function awardLabel(category: AwardCategory): string {
  return AWARD_CATEGORIES.find((c) => c.key === category)?.label ?? category;
}
