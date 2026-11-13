// Keep blank drafts distinct from zero. Calendar units cannot be fractional.
export function parseOffsetAmount(raw: string, unit: string): number {
  const amount = raw.trim() === "" ? NaN : Number(raw);
  if (!Number.isFinite(amount) || amount < 0 || amount > 10000) return NaN;
  const ticks = unit === "hour" ? amount * 60 : amount;
  return Math.abs(ticks - Math.round(ticks)) < 1e-8 ? amount : NaN;
}

export function offsetInputHelp(unit: string): string {
  return unit === "hour"
    ? "Enter 0–10,000 hours in whole minutes (for example, 1.5 hours)."
    : "Enter a whole-number amount from 0 to 10,000. Zero keeps the starting date.";
}
