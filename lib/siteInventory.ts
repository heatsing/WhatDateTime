import pageIndex from "../data/tools/index.json" with { type: "json" };
import {
  cities,
  regions,
  regionName,
  getPairCities,
  getPageIndexEligibility,
  getCityIndexEligibility,
} from "./indexEligibility.ts";
export const coreSlugs = [
  "",
  "calculators/date-calculator",
  "calculators/time-difference",
  "calculators/age-calculator",
  "calculators/countdown",
  "calculators/timezone-converter",
  "calculators/days-until",
  "calculators/day-of-week",
  "calculators/days-in-month",
  "calculators/weeks-in-year",
  "calculators/calendar",
  "calculators/half-birthday",
  "calculators/weeks-and-days-ago",
  "about",
  "calculation-methodology",
  "data-sources",
  "contact-and-corrections",
  "privacy-policy",
  "terms-of-use",
];
export const indexablePages = pageIndex.filter(
  (p) => getPageIndexEligibility(p).indexable,
);
export const indexablePairs = indexablePages.filter(
  (p) => p.kind === "timezone",
);
export const directorySize = 30;
export type ToolLink = { path: string; label: string };
const pairLink = (slug: string): ToolLink => {
  const [a, b] = getPairCities(slug)!;
  return { path: `/${slug}`, label: `${a.name} to ${b.name}` };
};
export function cityPairs(slug: string) {
  return indexablePairs
    .filter((p) => {
      const [a, b] = getPairCities(p.slug)!;
      return a.slug === slug || b.slug === slug;
    })
    .sort((a, b) => {
      const pa = getPairCities(a.slug)!,
        pb = getPairCities(b.slug)!;
      return (
        pb[0].priority + pb[1].priority - pa[0].priority - pa[1].priority ||
        a.slug.localeCompare(b.slug)
      );
    });
}
export function relatedPairLinks(slug: string): ToolLink[] {
  const pair = getPairCities(slug);
  if (!pair) return [];
  return [
    ...new Set(
      [...cityPairs(pair[0].slug), ...cityPairs(pair[1].slug)].map(
        (p) => p.slug,
      ),
    ),
  ]
    .filter((s) => s !== slug)
    .slice(0, 10)
    .map(pairLink);
}
export function cityLinks(slug: string): ToolLink[] {
  return cityPairs(slug)
    .slice(0, 8)
    .map((p) => pairLink(p.slug));
}
export type HubRoute = {
  slug: string;
  kind: "root" | "region" | "city" | "directory";
  title: string;
  description: string;
  city?: string;
  region?: string;
  part?: number;
};
export const hubRoutes: HubRoute[] = [
  {
    slug: "time",
    kind: "root",
    title: "World Clock: Cities and Time Zones",
    description:
      "Find local city times by region. Compare UTC offsets, clock changes and office hours, or open a city-to-city time converter.",
  },
  ...regions.map((region) => ({
    slug: `time/regions/${region}`,
    kind: "region" as const,
    region,
    title: `Current Time in ${regionName(region)} Cities`,
    description: `Browse ${regionName(region)} city clocks, IANA time zones and daylight saving rules. Open a city hub to compare local dates and plan working hours.`,
  })),
  ...cities
    .filter((c) => getCityIndexEligibility(c).indexable)
    .flatMap((city) => {
      const count = Math.ceil(cityPairs(city.slug).length / directorySize);
      return [
        {
          slug: `time/${city.slug}`,
          kind: "city" as const,
          city: city.slug,
          title: `Current Time in ${city.name}, ${city.country}`,
          description: `Check ${city.name}'s local time in ${city.zone}, UTC offset and clock-change schedule. Compare city clocks and convert 9 AM–5 PM working hours.`,
        },
        ...Array.from({ length: count }, (_, i) => ({
          slug: `time/${city.slug}/conversions${i ? `/${i + 1}` : ""}`,
          kind: "directory" as const,
          city: city.slug,
          part: i + 1,
          title: `${city.name} Time Conversions${i ? ` — Page ${i + 1}` : ""}`,
          description: `Browse ${city.name}'s curated city-to-city time converters, ${i * directorySize + 1}–${Math.min((i + 1) * directorySize, cityPairs(city.slug).length)} of ${cityPairs(city.slug).length}. Each includes a 24-hour table and office-hours overlap.`,
        })),
      ];
    }),
];
export const calculationDirectories = [
  ...new Set(
    indexablePages.filter((p) => p.kind === "relative").map((p) => p.type),
  ),
].flatMap((type) => {
  const pages = indexablePages.filter((p) => p.type === type);
  return Array.from(
    { length: Math.ceil(pages.length / directorySize) },
    (_, i) => ({
      slug: `calculations/${type}${i ? `/${i + 1}` : ""}`,
      type,
      part: i + 1,
      parts: Math.ceil(pages.length / directorySize),
      title: `${regionName(type)} Calculations${i ? ` — Page ${i + 1}` : ""}`,
      description: `Browse selected ${type.replaceAll("-", " ")} answers, ${i * directorySize + 1}–${Math.min((i + 1) * directorySize, pages.length)} of ${pages.length}. Open a result to adjust the start date and calculation.`,
      links: pages
        .slice(i * directorySize, (i + 1) * directorySize)
        .map((p) => ({
          path: `/${p.slug}`,
          label: p.slug.replaceAll("-", " "),
        })),
    }),
  );
});
export const allPublicSlugs = [
  ...coreSlugs,
  ...pageIndex.map((p) => p.slug),
  ...hubRoutes.map((p) => p.slug),
  ...calculationDirectories.map((p) => p.slug),
];
export const allIndexableSlugs = [
  ...coreSlugs,
  ...indexablePages.map((p) => p.slug),
  ...hubRoutes.map((p) => p.slug),
  ...calculationDirectories.map((p) => p.slug),
];
export function directoryLinks(city: string, part: number): ToolLink[] {
  return cityPairs(city)
    .slice((part - 1) * directorySize, part * directorySize)
    .map((p) => pairLink(p.slug));
}
