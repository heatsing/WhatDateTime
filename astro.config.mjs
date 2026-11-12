import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";

// Build examples have an explicit UTC basis, never the developer machine zone.
process.env.TZ = "UTC";

export default defineConfig({
  site: "https://whatdatetime.com",
  output: "static",
  // Static exports do not benefit from streaming. React 18's streamed output in
  // this runtime can insert NUL bytes at multibyte text boundaries; keep the
  // render-to-string path consistent with the on-demand renderer instead.
  integrations: [react({ experimentalDisableStreaming: true }), tailwind()],
});
