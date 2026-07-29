import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ChronoCraft Date & Time Calculators",
    short_name: "ChronoCraft",
    description: "Fast, free date and time calculators.",
    start_url: "/",
    display: "standalone",
    background_color: "#FBFCF9",
    theme_color: "#10212B",
  };
}
