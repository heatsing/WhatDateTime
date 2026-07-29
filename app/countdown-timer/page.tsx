import { permanentRedirect } from "next/navigation";

export default function LegacyCountdownTimer() {
  permanentRedirect("/calculators/countdown");
}
