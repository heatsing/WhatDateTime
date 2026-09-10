import revisions from "@/data/seo-revisions.json";
import type { SEOPage, SEOPageIndex } from "@/lib/seoGenerator";

export type PageFamily = SEOPageIndex["type"];

const familyDetails: Record<
  PageFamily,
  { label: string; hubName: string; hubPath: string; sitemap: string }
> = {
  "days-from-today": {
    label: "Days From Today",
    hubName: "Date Calculator",
    hubPath: "/calculators/date-calculator",
    sitemap: "sitemap-days-from-today.xml",
  },
  "days-ago": {
    label: "Days Ago",
    hubName: "Date Calculator",
    hubPath: "/calculators/date-calculator",
    sitemap: "sitemap-days-ago.xml",
  },
  "hours-from-now": {
    label: "Hours From Now",
    hubName: "Date Calculator",
    hubPath: "/calculators/date-calculator",
    sitemap: "sitemap-hours-from-now.xml",
  },
  "hours-ago": {
    label: "Hours Ago",
    hubName: "Date Calculator",
    hubPath: "/calculators/date-calculator",
    sitemap: "sitemap-hours-ago.xml",
  },
  "weeks-from-today": {
    label: "Weeks From Today",
    hubName: "Date Calculator",
    hubPath: "/calculators/date-calculator",
    sitemap: "sitemap-weeks-from-today.xml",
  },
  "months-from-today": {
    label: "Months From Today",
    hubName: "Date Calculator",
    hubPath: "/calculators/date-calculator",
    sitemap: "sitemap-months-from-today.xml",
  },
  "years-from-today": {
    label: "Years From Today",
    hubName: "Date Calculator",
    hubPath: "/calculators/date-calculator",
    sitemap: "sitemap-years-from-today.xml",
  },
  "business-days-from-today": {
    label: "Business Days From Today",
    hubName: "Date Calculator",
    hubPath: "/calculators/date-calculator",
    sitemap: "sitemap-business-days-from-today.xml",
  },
  "date-difference": {
    label: "Date Differences",
    hubName: "Time Difference Calculator",
    hubPath: "/calculators/time-difference",
    sitemap: "sitemap-date-differences.xml",
  },
  "timezone-converter": {
    label: "City Time Conversions",
    hubName: "Time Zone Converter",
    hubPath: "/calculators/timezone-converter",
    sitemap: "sitemap-time-zone-conversions.xml",
  },
};

export function getFamilyDetails(page: Pick<SEOPage, "type">) {
  return familyDetails[page.type];
}

export function getContentRevision(page: Pick<SEOPage, "type">) {
  return revisions[page.type] ?? revisions.site;
}

export function getSiteRevision() {
  return revisions.site;
}

export function getSitemapBaseName(type: PageFamily) {
  return familyDetails[type].sitemap.replace(/\.xml$/, "");
}
