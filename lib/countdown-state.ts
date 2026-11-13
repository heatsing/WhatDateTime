export type CountdownTarget = { name: string; instant: string; zone: string };
export const countdownStorageKey = "whatdatetime.countdown.v1";
export function countdownSeconds(instant: string, now: number): number {
  // Do not announce Time's up while a fractional second still remains.
  return Math.max(0, Math.ceil((Date.parse(instant) - now) / 1000));
}
export function validCountdown(value: unknown): CountdownTarget | null {
  if (!value || typeof value !== "object") return null;
  const p = value as Record<string, unknown>;
  if (
    typeof p.name !== "string" ||
    p.name.length > 100 ||
    typeof p.instant !== "string" ||
    !/^\d{4}-\d\d-\d\dT.*Z$/.test(p.instant) ||
    !Number.isFinite(Date.parse(p.instant)) ||
    typeof p.zone !== "string"
  )
    return null;
  try {
    new Intl.DateTimeFormat("en", { timeZone: p.zone }).format();
  } catch {
    return null;
  }
  const date = new Date(p.instant);
  const instant = date.toISOString();
  if (
    date.getUTCFullYear() < 1 ||
    (p.instant !== instant && p.instant !== instant.replace(".000Z", "Z"))
  )
    return null;
  return { name: p.name, instant, zone: p.zone };
}
export function countdownHash(target: CountdownTarget) {
  return (
    "#" +
    new URLSearchParams({
      event: target.name,
      due: target.instant,
      zone: target.zone,
    }).toString()
  );
}
export function parseCountdownHash(hash: string) {
  const p = new URLSearchParams(hash.replace(/^#/, ""));
  return validCountdown({
    name: p.get("event") || "",
    instant: p.get("due"),
    zone: p.get("zone"),
  });
}
