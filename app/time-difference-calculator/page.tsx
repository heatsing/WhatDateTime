import { permanentRedirect } from "next/navigation";

export default function LegacyTimeDifferenceCalculator() {
  permanentRedirect("/calculators/time-difference");
}
