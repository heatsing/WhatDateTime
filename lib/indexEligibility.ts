import policy from "../data/index-policy.json" with { type: "json" };
import cityData from "../data/cities.json" with { type: "json" };

export type SeoPageEligibility = {
  indexable: boolean;
  reason: string;
  priority: number;
};
export type City = {
  slug: string;
  name: string;
  zone: string;
  country: string;
  region: string;
  seasonalPolicy: string;
  priority: 1 | 2 | 3 | 4 | 5;
};
export type PageIdentity = { slug: string; kind: string; type: string };
export const cities: City[] = cityData.map((city) => ({
  ...city,
  priority: policy.priority5.includes(city.slug)
    ? 5
    : policy.priority4.includes(city.slug)
      ? 4
      : 3,
}));
const bySlug = new Map(cities.map((city) => [city.slug, city]));
export const getCity = (slug: string) => bySlug.get(slug);
export const regions = [...new Set(cities.map((city) => city.region))];
export const regionName = (slug: string) =>
  slug.replace(/\b[a-z]/g, (c) => c.toUpperCase()).replaceAll("-", " ");
export function getCityIndexEligibility(city: City): SeoPageEligibility {
  return {
    indexable: city.priority >= 3,
    reason: "Curated city with an IANA zone and a functional time hub",
    priority: city.priority,
  };
}
export function getProtectedEligibility(
  slug: string,
): SeoPageEligibility | undefined {
  const evidence = (policy.protected as Record<string, string>)[slug];
  if (evidence)
    return { indexable: true, reason: `Protected: ${evidence}`, priority: 5 };
  if (policy.curated.includes(slug))
    return {
      indexable: true,
      reason: "Existing editorial cohort retained; no traffic claim",
      priority: 4,
    };
}
export function getCityPairIndexEligibility(
  from: City,
  to: City,
  slug = `${from.slug}-to-${to.slug}-time`,
): SeoPageEligibility {
  const protection = getProtectedEligibility(slug);
  if (protection) return protection;
  const indexable =
    from.slug !== to.slug &&
    ((Math.max(from.priority, to.priority) === 5 &&
      Math.min(from.priority, to.priority) >= 3) ||
      (from.priority >= 4 && to.priority >= 4));
  return {
    indexable,
    priority: indexable ? 4 : 2,
    reason: indexable
      ? `Editorial city priorities ${from.priority}+${to.priority}`
      : `Long-tail pair (${from.priority}+${to.priority}); retain tool, await demand evidence`,
  };
}
export function getPairCities(slug: string): [City, City] | undefined {
  const parts = slug.replace(/-time$/, "").split("-to-");
  const from = bySlug.get(parts[0]),
    to = bySlug.get(parts[1]);
  return from && to ? [from, to] : undefined;
}
export function getPageIndexEligibility(
  page: PageIdentity,
): SeoPageEligibility {
  const protectedPage = getProtectedEligibility(page.slug);
  if (protectedPage) return protectedPage;
  if (page.kind === "timezone") {
    const pair = getPairCities(page.slug);
    if (!pair) throw new Error(`Unknown city in ${page.slug}`);
    return getCityPairIndexEligibility(...pair, page.slug);
  }
  if (page.kind === "relative") {
    const rule = (
      policy.relative as Record<string, { max: number; extra: number[] }>
    )[page.type];
    const amount = Number(page.slug.match(/^\d+/)?.[0]);
    const indexable =
      !!rule &&
      ((amount > 0 && amount <= rule.max) || rule.extra.includes(amount));
    return {
      indexable,
      priority: indexable ? 4 : 2,
      reason: indexable
        ? "Curated relative-date range or reference interval"
        : "Long-tail interval; tool retained, await demand evidence",
    };
  }
  return {
    indexable: false,
    priority: 1,
    reason: "Uncurated fixed-date pair; tool retained, await demand evidence",
  };
}
export const robotsFor = (eligibility: SeoPageEligibility) =>
  eligibility.indexable
    ? "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
    : "noindex, follow";
