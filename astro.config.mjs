import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
  site: "https://whatdatetime.com",
  output: "static",
  // Static exports do not benefit from streaming. React 18's streamed output in
  // this runtime can insert NUL bytes at multibyte text boundaries; keep the
  // render-to-string path consistent with the on-demand renderer instead.
  integrations: [react({ experimentalDisableStreaming: true }), tailwind()],
});
