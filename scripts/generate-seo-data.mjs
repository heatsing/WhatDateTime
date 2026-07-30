import { mkdirSync, writeFileSync } from "node:fs";
import { addDays, format } from "date-fns";

const dataDir = new URL("../data/", import.meta.url);
mkdirSync(dataDir, { recursive: true });

function plural(value, singular) {
  return value === 1 ? singular : `${singular}s`;
}

function relativePages({
  count,
  type,
  unit,
  direction,
  suffix,
}) {
  return Array.from({ length: count }, (_, index) => {
    const amount = index + 1;
    return {
      kind: "relative",
      slug: `${amount}-${plural(amount, unit === "business-day" ? "business-day" : unit)}-${suffix}`,
      type,
      amount,
      unit,
      direction,
    };
  });
}

const cities = [
  ["New York", "new-york", "America/New_York"],
  ["London", "london", "Europe/London"],
  ["Tokyo", "tokyo", "Asia/Tokyo"],
  ["Los Angeles", "los-angeles", "America/Los_Angeles"],
  ["Paris", "paris", "Europe/Paris"],
  ["Sydney", "sydney", "Australia/Sydney"],
  ["Singapore", "singapore", "Asia/Singapore"],
  ["Dubai", "dubai", "Asia/Dubai"],
  ["Toronto", "toronto", "America/Toronto"],
  ["Berlin", "berlin", "Europe/Berlin"],
  ["Chicago", "chicago", "America/Chicago"],
  ["San Francisco", "san-francisco", "America/Los_Angeles"],
  ["Vancouver", "vancouver", "America/Vancouver"],
  ["Mexico City", "mexico-city", "America/Mexico_City"],
  ["São Paulo", "sao-paulo", "America/Sao_Paulo"],
  ["Buenos Aires", "buenos-aires", "America/Argentina/Buenos_Aires"],
  ["Madrid", "madrid", "Europe/Madrid"],
  ["Rome", "rome", "Europe/Rome"],
  ["Amsterdam", "amsterdam", "Europe/Amsterdam"],
  ["Zurich", "zurich", "Europe/Zurich"],
  ["Moscow", "moscow", "Europe/Moscow"],
  ["Istanbul", "istanbul", "Europe/Istanbul"],
  ["Cairo", "cairo", "Africa/Cairo"],
  ["Johannesburg", "johannesburg", "Africa/Johannesburg"],
  ["Mumbai", "mumbai", "Asia/Kolkata"],
  ["Delhi", "delhi", "Asia/Kolkata"],
  ["Bangkok", "bangkok", "Asia/Bangkok"],
  ["Hong Kong", "hong-kong", "Asia/Hong_Kong"],
  ["Shanghai", "shanghai", "Asia/Shanghai"],
  ["Seoul", "seoul", "Asia/Seoul"],
  ["Melbourne", "melbourne", "Australia/Melbourne"],
  ["Auckland", "auckland", "Pacific/Auckland"],
  ["Honolulu", "honolulu", "Pacific/Honolulu"],
  ["Washington DC", "washington-dc", "America/New_York"],
  ["Boston", "boston", "America/New_York"],
  ["Miami", "miami", "America/New_York"],
  ["Dallas", "dallas", "America/Chicago"],
  ["Houston", "houston", "America/Chicago"],
  ["Denver", "denver", "America/Denver"],
  ["Phoenix", "phoenix", "America/Phoenix"],
  ["Seattle", "seattle", "America/Los_Angeles"],
  ["Montreal", "montreal", "America/Toronto"],
  ["Lima", "lima", "America/Lima"],
  ["Bogota", "bogota", "America/Bogota"],
  ["Santiago", "santiago", "America/Santiago"],
  ["Lisbon", "lisbon", "Europe/Lisbon"],
  ["Dublin", "dublin", "Europe/Dublin"],
  ["Brussels", "brussels", "Europe/Brussels"],
  ["Vienna", "vienna", "Europe/Vienna"],
  ["Prague", "prague", "Europe/Prague"],
  ["Warsaw", "warsaw", "Europe/Warsaw"],
  ["Stockholm", "stockholm", "Europe/Stockholm"],
  ["Oslo", "oslo", "Europe/Oslo"],
  ["Copenhagen", "copenhagen", "Europe/Copenhagen"],
  ["Helsinki", "helsinki", "Europe/Helsinki"],
  ["Athens", "athens", "Europe/Athens"],
  ["Kyiv", "kyiv", "Europe/Kyiv"],
  ["Bucharest", "bucharest", "Europe/Bucharest"],
  ["Riyadh", "riyadh", "Asia/Riyadh"],
  ["Doha", "doha", "Asia/Qatar"],
  ["Jerusalem", "jerusalem", "Asia/Jerusalem"],
  ["Tehran", "tehran", "Asia/Tehran"],
  ["Karachi", "karachi", "Asia/Karachi"],
  ["Dhaka", "dhaka", "Asia/Dhaka"],
  ["Kathmandu", "kathmandu", "Asia/Kathmandu"],
  ["Colombo", "colombo", "Asia/Colombo"],
  ["Jakarta", "jakarta", "Asia/Jakarta"],
  ["Manila", "manila", "Asia/Manila"],
  ["Taipei", "taipei", "Asia/Taipei"],
  ["Kuala Lumpur", "kuala-lumpur", "Asia/Kuala_Lumpur"],
  ["Ho Chi Minh City", "ho-chi-minh-city", "Asia/Ho_Chi_Minh"],
  ["Osaka", "osaka", "Asia/Tokyo"],
  ["Beijing", "beijing", "Asia/Shanghai"],
  ["Perth", "perth", "Australia/Perth"],
  ["Brisbane", "brisbane", "Australia/Brisbane"],
  ["Adelaide", "adelaide", "Australia/Adelaide"],
  ["Wellington", "wellington", "Pacific/Auckland"],
  ["Nairobi", "nairobi", "Africa/Nairobi"],
  ["Lagos", "lagos", "Africa/Lagos"],
  ["Casablanca", "casablanca", "Africa/Casablanca"],
  ["Cape Town", "cape-town", "Africa/Johannesburg"],
  ["Accra", "accra", "Africa/Accra"],
];

const timezonePageTarget = 5964;
const timezonePages = [];
for (const [fromCity, fromSlug, fromZone] of cities) {
  for (const [toCity, toSlug, toZone] of cities) {
    if (fromSlug === toSlug) continue;
    timezonePages.push({
      kind: "timezone",
      slug: `${fromSlug}-to-${toSlug}-time`,
      type: "timezone-converter",
      fromCity,
      fromZone,
      toCity,
      toZone,
    });
    if (timezonePages.length === timezonePageTarget) break;
  }
  if (timezonePages.length === timezonePageTarget) break;
}

const differenceStart = new Date(Date.UTC(2026, 0, 1));
const differencePages = Array.from({ length: 500 }, (_, index) => {
  const start = addDays(differenceStart, index);
  const end = addDays(start, (index % 180) + 1);
  const startSlug = format(start, "MMMM-d-yyyy").toLowerCase();
  const endSlug = format(end, "MMMM-d-yyyy").toLowerCase();
  return {
    kind: "difference",
    slug: `days-between-${startSlug}-and-${endSlug}`,
    type: "date-difference",
    start: format(start, "yyyy-MM-dd"),
    end: format(end, "yyyy-MM-dd"),
  };
});

const files = {
  "days-from-today.json": relativePages({
    count: 365,
    type: "days-from-today",
    unit: "day",
    direction: "future",
    suffix: "from-today",
  }),
  "days-ago.json": relativePages({
    count: 365,
    type: "days-ago",
    unit: "day",
    direction: "past",
    suffix: "ago",
  }),
  "hours-from-now.json": relativePages({
    count: 500,
    type: "hours-from-now",
    unit: "hour",
    direction: "future",
    suffix: "from-now",
  }),
  "hours-ago.json": relativePages({
    count: 500,
    type: "hours-ago",
    unit: "hour",
    direction: "past",
    suffix: "ago",
  }),
  "weeks.json": relativePages({
    count: 200,
    type: "weeks-from-today",
    unit: "week",
    direction: "future",
    suffix: "from-today",
  }),
  "months.json": relativePages({
    count: 300,
    type: "months-from-today",
    unit: "month",
    direction: "future",
    suffix: "from-today",
  }),
  "years.json": relativePages({
    count: 300,
    type: "years-from-today",
    unit: "year",
    direction: "future",
    suffix: "from-today",
  }),
  "business-days.json": relativePages({
    count: 1000,
    type: "business-days-from-today",
    unit: "business-day",
    direction: "future",
    suffix: "from-today",
  }),
  "date-difference.json": differencePages,
  "timezone.json": timezonePages,
};

let total = 0;
for (const [file, records] of Object.entries(files)) {
  writeFileSync(
    new URL(file, dataDir),
    `${JSON.stringify(records, null, 2)}\n`,
  );
  total += records.length;
  console.log(`${file}: ${records.length}`);
}

console.log(`Total SEO pages: ${total}`);
