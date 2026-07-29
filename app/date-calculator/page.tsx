import { permanentRedirect } from "next/navigation";

export default function LegacyDateCalculator() {
  permanentRedirect("/calculators/date-calculator");
}
