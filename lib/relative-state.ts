import { formatInTimeZone, fromZonedTime, toZonedTime } from "date-fns-tz";
import { calculateRelativeDate } from "./dateCalculator";
import type { RelativeCalculationInput } from "./pageCalculations";

export type RelativeState = {
  page: RelativeCalculationInput;
  instant: string;
  zone: string;
  mode: "example" | "live" | "custom";
  inputError?: string;
};
export function relativeResult(state: RelativeState, page = state.page) {
  const instant = new Date(state.instant);
  if (page.unit === "hour")
    return calculateRelativeDate(
      instant,
      page.amount,
      page.unit,
      page.direction,
    );
  return fromZonedTime(
    calculateRelativeDate(
      toZonedTime(instant, state.zone),
      page.amount,
      page.unit,
      page.direction,
    ),
    state.zone,
  );
}
export function relativeText(state: RelativeState, page = state.page) {
  return formatInTimeZone(
    relativeResult(state, page),
    state.zone,
    page.unit === "hour"
      ? "EEEE, MMMM d, yyyy 'at' h:mm a"
      : "EEEE, MMMM d, yyyy",
  );
}
export function relativeFormula(state: RelativeState) {
  const pattern =
    state.page.unit === "hour" ? "MMM d, yyyy h:mm a" : "MMMM d, yyyy";
  return `${formatInTimeZone(new Date(state.instant), state.zone, pattern)} ${state.page.direction === "future" ? "+" : "−"} ${state.page.amount} ${state.page.unit.replace("-", " ")}${state.page.amount === 1 ? "" : "s"} = ${relativeText(state)} (${state.zone}).`;
}
