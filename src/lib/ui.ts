export const OUTCOME_STYLE: Record<string, string> = {
  exacto: "bg-rda-win/20 text-rda-win border-rda-win/40",
  ganador: "bg-rda-draw/20 text-rda-draw border-rda-draw/40",
  fallado: "bg-rda-lose/20 text-rda-lose border-rda-lose/40",
  pendiente: "bg-rda-panel2 text-rda-muted border-rda-border",
};

export const OUTCOME_LABEL: Record<string, string> = {
  exacto: "Exacto · +3",
  ganador: "Ganador · +1",
  fallado: "Fallado · 0",
  pendiente: "Sin resultado",
};
