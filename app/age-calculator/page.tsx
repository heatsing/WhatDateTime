import { permanentRedirect } from "next/navigation";

export default function LegacyAgeCalculator() {
  permanentRedirect("/calculators/age-calculator");
}
