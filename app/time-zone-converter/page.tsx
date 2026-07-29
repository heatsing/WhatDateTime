import { permanentRedirect } from "next/navigation";

export default function LegacyTimeZoneConverter() {
  permanentRedirect("/calculators/timezone-converter");
}
