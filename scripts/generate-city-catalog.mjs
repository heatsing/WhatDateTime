// Mechanical projection of the EXISTING city inventory; never creates city pairs.
import fs from "node:fs";
const pairs = JSON.parse(fs.readFileSync("data/timezone.json", "utf8"));
const groups = [
  [
    "United States",
    "north-america",
    "north",
    "new-york los-angeles chicago san-francisco honolulu washington-dc boston miami dallas houston denver phoenix seattle",
  ],
  ["United Kingdom", "europe", "north", "london"],
  ["Japan", "asia", "none", "tokyo osaka"],
  ["France", "europe", "north", "paris"],
  ["Australia", "oceania", "south", "sydney melbourne perth brisbane adelaide"],
  ["Singapore", "asia", "none", "singapore"],
  ["United Arab Emirates", "asia", "none", "dubai"],
  ["Canada", "north-america", "north", "toronto vancouver montreal"],
  ["Germany", "europe", "north", "berlin"],
  ["Mexico", "north-america", "none", "mexico-city"],
  ["Brazil", "south-america", "none", "sao-paulo"],
  ["Argentina", "south-america", "none", "buenos-aires"],
  ["Spain", "europe", "north", "madrid"],
  ["Italy", "europe", "north", "rome"],
  ["Netherlands", "europe", "north", "amsterdam"],
  ["Switzerland", "europe", "north", "zurich"],
  ["Russia", "europe", "none", "moscow"],
  ["Türkiye", "europe", "none", "istanbul"],
  ["Egypt", "africa", "north", "cairo"],
  ["South Africa", "africa", "none", "johannesburg cape-town"],
  ["India", "asia", "none", "mumbai delhi"],
  ["Thailand", "asia", "none", "bangkok"],
  ["Hong Kong", "asia", "none", "hong-kong"],
  ["China", "asia", "none", "shanghai beijing"],
  ["South Korea", "asia", "none", "seoul"],
  ["New Zealand", "oceania", "south", "auckland wellington"],
  ["Peru", "south-america", "none", "lima"],
  ["Colombia", "south-america", "none", "bogota"],
  ["Chile", "south-america", "south", "santiago"],
  ["Portugal", "europe", "north", "lisbon"],
  ["Ireland", "europe", "seasonal", "dublin"],
  ["Belgium", "europe", "north", "brussels"],
  ["Austria", "europe", "north", "vienna"],
  ["Czechia", "europe", "north", "prague"],
  ["Poland", "europe", "north", "warsaw"],
  ["Sweden", "europe", "north", "stockholm"],
  ["Norway", "europe", "north", "oslo"],
  ["Denmark", "europe", "north", "copenhagen"],
  ["Finland", "europe", "north", "helsinki"],
  ["Greece", "europe", "north", "athens"],
  ["Ukraine", "europe", "north", "kyiv"],
  ["Romania", "europe", "north", "bucharest"],
  ["Saudi Arabia", "asia", "none", "riyadh"],
  ["Qatar", "asia", "none", "doha"],
  ["Israel", "asia", "north", "jerusalem"],
  ["Iran", "asia", "none", "tehran"],
  ["Pakistan", "asia", "none", "karachi"],
  ["Bangladesh", "asia", "none", "dhaka"],
  ["Nepal", "asia", "none", "kathmandu"],
  ["Sri Lanka", "asia", "none", "colombo"],
  ["Indonesia", "asia", "none", "jakarta"],
  ["Philippines", "asia", "none", "manila"],
  ["Taiwan", "asia", "none", "taipei"],
  ["Malaysia", "asia", "none", "kuala-lumpur"],
  ["Vietnam", "asia", "none", "ho-chi-minh-city"],
  ["Kenya", "africa", "none", "nairobi"],
  ["Nigeria", "africa", "none", "lagos"],
  ["Morocco", "africa", "ramadan", "casablanca"],
  ["Ghana", "africa", "none", "accra"],
];
const locations = new Map(
  groups.flatMap(([country, region, seasonalPolicy, slugs]) =>
    slugs.split(" ").map((slug) => [slug, { country, region, seasonalPolicy }]),
  ),
);
const cities = new Map();
for (const p of pairs) {
  for (const side of ["from", "to"]) {
    const name = p[`${side}City`],
      zone = p[`${side}Zone`];
    const slug = name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-");
    const location = locations.get(slug);
    if (!location) throw new Error(`Missing location: ${slug}`);
    cities.set(slug, {
      slug,
      name,
      zone,
      ...location,
      ...(["honolulu", "phoenix", "perth", "brisbane"].includes(slug)
        ? { seasonalPolicy: "none" }
        : {}),
    });
  }
}
fs.writeFileSync(
  "data/cities.json",
  JSON.stringify([...cities.values()], null, 2) + "\n",
);
console.log(`Projected ${cities.size} existing cities; no pair URLs added.`);
