import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "WhatDateTime Date & Time Calculators",
    short_name: "WhatDateTime",
    description: "Fast, free date and time calculators.",
    start_url: "/",
    display: "standalone",
    background_color: "#FBFCF9",
    theme_color: "#10212B",
  };
}
