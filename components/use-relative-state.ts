import { useEffect, useMemo, useSyncExternalStore } from "react";
import type { RelativeCalculationInput } from "@/lib/pageCalculations";
import type { RelativeState } from "@/lib/relative-state";

const states = new Map<string, RelativeState>();
const listeners = new Set<() => void>();
const emit = () => listeners.forEach(fn => fn());
let timer: ReturnType<typeof setInterval> | undefined;
function tick() {
  const instant = new Date(Math.floor(Date.now() / 60000) * 60000).toISOString();
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  let changed = false;
  states.forEach((state, key) => {
    if (state.mode !== "custom" && (state.instant !== instant || state.zone !== zone || state.mode !== "live")) {
      states.set(key, { ...state, mode: "live", instant, zone }); changed = true;
    }
  });
  if (changed) emit();
}
function subscribe(fn: () => void) {
  listeners.add(fn);
  if (!timer) {
    timer = setInterval(tick, 1000);
    window.addEventListener("focus", tick);
    document.addEventListener("visibilitychange", tick);
  }
  return () => {
    listeners.delete(fn);
    if (!listeners.size) {
      clearInterval(timer); timer = undefined;
      window.removeEventListener("focus", tick);
      document.removeEventListener("visibilitychange", tick);
    }
  };
}
export function useRelativeState(page: RelativeCalculationInput, referenceTime: string) {
  const key = `${page.type}:${page.amount}`;
  const initial = useMemo<RelativeState>(() => ({ page, instant: referenceTime, zone: "UTC", mode: "example" }), [key, referenceTime]);
  const state = useSyncExternalStore(subscribe, () => states.get(key) || initial, () => initial);
  useEffect(() => { if (!states.has(key)) states.set(key, initial); tick(); }, [key, initial]);
  const update = (next: RelativeState) => { states.set(key, next); emit(); };
  return { state, update, hold: () => update({ ...state, mode: "custom" }), reset: () => {
    states.set(key, initial); tick();
  } };
}
