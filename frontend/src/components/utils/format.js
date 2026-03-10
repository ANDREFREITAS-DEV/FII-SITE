export function formatBRL(v) {
  if (v === null || v === undefined || Number.isNaN(Number(v))) return "-";
  return Number(v).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

export function signedBRL(v) {
  if (v === null || v === undefined || Number.isNaN(Number(v))) return "-";
  const n = Number(v);
  const sign = n > 0 ? "+" : "";
  return sign + n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function pct(v) {
  if (v === null || v === undefined || Number.isNaN(Number(v))) return "-";
  return `${Number(v).toFixed(2)}%`;
}

export function formatRelativeTime(timestamp) {
  if (!timestamp) return "Nunca atualizado";
  const now = new Date();
  const updated = new Date(timestamp);
  const diffMin = Math.floor((now - updated) / 60000);

  if (diffMin < 1) return "Agora mesmo";
  if (diffMin === 1) return "Há 1 minuto";

  return `Há ${diffMin} minutos`;
}

export function statusColor(timestamp) {
  if (!timestamp) return "neg";

  const now = new Date();
  const updated = new Date(timestamp);
  const diffMin = Math.floor((now - updated) / 60000);

  if (diffMin <= 5) return "pos";
  if (diffMin <= 15) return "warn";

  return "neg";
}