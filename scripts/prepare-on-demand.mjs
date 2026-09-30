import fs from "node:fs";
import path from "node:path";
import { getPageIndexEligibility } from "../lib/indexEligibility.ts";
import { cities } from "../lib/indexEligibility.ts";
import { cityLinks } from "../lib/siteInventory.ts";
const output = path.resolve("workers/generated");
fs.mkdirSync(output, { recursive: true });
const index = JSON.parse(fs.readFileSync("data/tools/index.json", "utf8"));
const rows = [];
const keys = [
  "kind",
  "type",
  "slug",
  "title",
  "description",
  "h1",
  "amount",
  "unit",
  "direction",
  "start",
  "end",
  "fromCity",
  "fromZone",
  "toCity",
  "toZone",
  "faq",
];
for (const file of new Set(index.map((p) => p.dataFile))) {
  for (const page of JSON.parse(
    fs.readFileSync(`data/tools/${file}`, "utf8"),
  )) {
    if (getPageIndexEligibility(page).indexable) continue;
    const data = Object.fromEntries(
      keys.filter((k) => k in page).map((k) => [k, page[k]]),
    );
    if (page.kind === "relative" && page.direction === "past")
      data.h1 = page.title;
    if (page.kind === "timezone") delete data.faq; // factual FAQs come from the shared time-zone engine
    rows.push(data);
  }
}
fs.writeFileSync(path.join(output, "routes.json"), JSON.stringify(rows));
fs.writeFileSync(
  path.join(output, "city-links.json"),
  JSON.stringify(
    Object.fromEntries(cities.map((c) => [c.slug, cityLinks(c.slug)])),
  ),
);
fs.writeFileSync(
  path.join(output, "aliases.json"),
  JSON.stringify(
    Object.fromEntries(
      fs
        .readFileSync("public/_redirects", "utf8")
        .split(/\r?\n/)
        .filter((line) => line.startsWith("/"))
        .map((line) => {
          const [source, target] = line.trim().split(/\s+/);
          return [source.slice(1), target];
        }),
    ),
  ),
);
const shellPath = path.resolve("dist/render-shell/index.html");
if (!shellPath.startsWith(path.resolve("dist") + path.sep))
  throw new Error("Unsafe generated shell path");
if (!process.argv.includes("--manifest-only")) {
  if (!fs.existsSync(shellPath))
    throw new Error(
      "Build shell missing; run astro build before preparing the fallback Worker",
    );
  const shell = fs.readFileSync(shellPath, "utf8");
  for (const marker of [
    "__WDT_TITLE__",
    "__WDT_DESCRIPTION__",
    "__WDT_PROPS__",
    '<div id="on-demand-content"></div>',
  ])
    if (!shell.includes(marker))
      throw new Error(`Missing shell marker: ${marker}`);
  fs.writeFileSync(path.join(output, "on-demand-shell.html"), shell);
  // Only this build-generated placeholder is removed, never a public content URL.
  fs.rmSync(shellPath);
}
console.log(
  `${rows.length} known noindex routes prepared for on-demand SSR (no page HTML generated).`,
);
