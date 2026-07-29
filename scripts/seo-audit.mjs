import { readFileSync } from "node:fs";

const expectedCounts = {
  "days-from-today.json": 365,
  "days-ago.json": 365,
  "hours-from-now.json": 500,
  "hours-ago.json": 500,
  "weeks.json": 200,
  "months.json": 300,
  "years.json": 300,
  "business-days.json": 1000,
  "date-difference.json": 500,
  "timezone.json": 1000,
};

const sourcePages = [];
for (const [file, expected] of Object.entries(expectedCounts)) {
  const records = JSON.parse(
    readFileSync(new URL(`../data/${file}`, import.meta.url), "utf8"),
  );
  if (records.length !== expected) {
    throw new Error(`${file}: expected ${expected}, received ${records.length}`);
  }
  sourcePages.push(...records);
}

const pageIndex = JSON.parse(
  readFileSync(new URL("../data/tools/index.json", import.meta.url), "utf8"),
);
const dataFiles = [...new Set(pageIndex.map((page) => page.dataFile))];
const pages = dataFiles.flatMap((file) =>
  JSON.parse(
    readFileSync(new URL(`../data/tools/${file}`, import.meta.url), "utf8"),
  ),
);
const sourceBySlug = new Map(sourcePages.map((page) => [page.slug, page]));
const pageBySlug = new Map(pages.map((page) => [page.slug, page]));
const indexBySlug = new Map(pageIndex.map((page) => [page.slug, page]));

function fail(message) {
  throw new Error(`SEO audit failed: ${message}`);
}

function titleCase(value) {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function humanDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

function relativePhrase(page) {
  const unit =
    page.unit === "business-day"
      ? page.amount === 1
        ? "business day"
        : "business days"
      : page.amount === 1
        ? page.unit
        : `${page.unit}s`;
  const suffix =
    page.type === "hours-from-now"
      ? "from now"
      : page.direction === "past"
        ? "ago"
        : "from today";
  return `${page.amount} ${unit} ${suffix}`;
}

function legacySEO(page) {
  if (page.kind === "relative") {
    const phrase = relativePhrase(page);
    const includeTime = page.unit === "hour";
    return {
      title: `${titleCase(phrase)} - Calculate Exact ${includeTime ? "Time" : "Date"}`,
      description: `Find out ${includeTime ? "the exact date and time" : "what date it will be"} ${phrase}. Use our free ${includeTime ? "time" : "date"} calculator for an instant, accurate answer.`,
    };
  }
  if (page.kind === "difference") {
    const start = humanDate(page.start);
    const end = humanDate(page.end);
    return {
      title: `Days Between ${start} and ${end} - Date Difference`,
      description: `Calculate the exact number of days between ${start} and ${end}. Get a clear date difference with a free online calculator.`,
    };
  }
  return {
    title: `${page.fromCity} to ${page.toCity} Time Converter`,
    description: `Convert time from ${page.fromCity} to ${page.toCity}. Compare current local times and time-zone offsets instantly.`,
  };
}

if (
  pages.length !== sourcePages.length ||
  pageIndex.length !== pages.length ||
  pages.length < 5000
) {
  fail(`expected ${sourcePages.length} enriched pages, received ${pages.length}`);
}
if (pageBySlug.size !== pages.length) fail("duplicate enriched URL slug");

const introFrequency = new Map();
const exampleFrequency = new Map();
const faqQuestionFrequency = new Map();
const faqPairFrequency = new Map();
const contentUnitFrequency = new Map();

function increment(map, value) {
  map.set(value, (map.get(value) ?? 0) + 1);
}

for (const page of pages) {
  const source = sourceBySlug.get(page.slug);
  const indexEntry = indexBySlug.get(page.slug);
  if (!source) fail(`${page.slug}: URL was not present in the original corpus`);
  if (!indexEntry) fail(`${page.slug}: missing from lightweight route index`);
  if (indexEntry.type !== page.type || indexEntry.kind !== page.kind) {
    fail(`${page.slug}: route index and content record disagree`);
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(page.slug)) {
    fail(`${page.slug}: invalid URL slug`);
  }

  const legacy = legacySEO(source);
  if (page.title !== legacy.title) fail(`${page.slug}: title changed`);
  if (page.description !== legacy.description) {
    fail(`${page.slug}: meta description changed`);
  }

  const requiredStrings = [
    "title",
    "description",
    "h1",
    "eyebrow",
    "intro",
  ];
  for (const key of requiredStrings) {
    if (typeof page[key] !== "string" || page[key].trim().length < 10) {
      fail(`${page.slug}: missing or thin ${key}`);
    }
  }
  for (const [key, minimum] of [
    ["useCases", 3],
    ["examples", 3],
    ["tips", 3],
    ["faq", 5],
    ["relatedLinks", 4],
    ["keywords", 5],
  ]) {
    if (!Array.isArray(page[key]) || page[key].length < minimum) {
      fail(`${page.slug}: ${key} must contain at least ${minimum} items`);
    }
  }
  if (page.content?.sections?.length !== 3) {
    fail(`${page.slug}: content must provide exactly three UI sections`);
  }
  if (
    !page.searchIntent?.category ||
    !page.searchIntent?.rationale ||
    page.searchIntent?.evidence !== "modeled"
  ) {
    fail(`${page.slug}: missing transparent search-intent model`);
  }
  if (
    !page.seoScore ||
    page.seoScore.score < 75 ||
    !["A", "B"].includes(page.seoScore.grade) ||
    !["index", "index-observe"].includes(page.seoScore.action)
  ) {
    fail(`${page.slug}: page quality score is below the indexable gate`);
  }
  for (const factor of [
    "content",
    "searchIntent",
    "internalLinks",
    "contentLength",
    "templateSimilarity",
  ]) {
    if (typeof page.seoScore.factors?.[factor] !== "number") {
      fail(`${page.slug}: missing SEO score factor ${factor}`);
    }
  }
  if (JSON.stringify(page).includes("{{result}}")) {
    fail(`${page.slug}: unresolved real-time content placeholder`);
  }

  increment(introFrequency, page.intro);
  for (const example of page.examples) increment(exampleFrequency, example);
  for (const faq of page.faq) {
    increment(faqQuestionFrequency, faq.question);
    increment(faqPairFrequency, `${faq.question}\n${faq.answer}`);
  }

  const units = [
    page.intro,
    ...page.useCases,
    ...page.examples,
    ...page.tips,
    ...page.faq.map((faq) => `${faq.question}\n${faq.answer}`),
    ...page.content.sections.map(
      (section) => `${section.title}\n${section.text}`,
    ),
  ];
  page.__auditUnits = units;

  const relatedSet = new Set(page.relatedLinks);
  if (
    relatedSet.size !== page.relatedLinks.length ||
    relatedSet.has(page.slug)
  ) {
    fail(`${page.slug}: related links contain duplicates or a self-link`);
  }
  for (const slug of page.relatedLinks) {
    const related = pageBySlug.get(slug);
    if (!related) fail(`${page.slug}: related URL ${slug} does not exist`);
    if (page.kind === "relative" && related.type !== page.type) {
      fail(`${page.slug}: relative link ${slug} is not the same calculator type`);
    }
    if (
      page.kind === "timezone" &&
      (related.kind !== "timezone" ||
        ![
          page.fromCity,
          page.toCity,
        ].some(
          (city) =>
            city === related.fromCity || city === related.toCity,
        ))
    ) {
      fail(`${page.slug}: timezone link ${slug} has no useful city relationship`);
    }
    if (page.kind === "difference" && related.kind !== "difference") {
      fail(`${page.slug}: date-difference link ${slug} is not relevant`);
    }
  }

  const serialized = JSON.stringify(page);
  if (page.kind === "relative") {
    if (
      !serialized.includes(String(page.amount)) ||
      !serialized.includes(relativePhrase(page))
    ) {
      fail(`${page.slug}: relative content lacks page-specific calculations`);
    }
  } else if (page.kind === "difference") {
    if (!serialized.includes(humanDate(page.start)) || !serialized.includes(humanDate(page.end))) {
      fail(`${page.slug}: date-difference content lacks both endpoint dates`);
    }
  } else if (
    !serialized.includes(page.fromZone) ||
    !serialized.includes(page.toZone)
  ) {
    fail(`${page.slug}: timezone content lacks both IANA zones`);
  }
}

for (const [label, frequency] of [
  ["intro", introFrequency],
  ["example", exampleFrequency],
  ["FAQ question", faqQuestionFrequency],
  ["FAQ pair", faqPairFrequency],
]) {
  const duplicate = [...frequency.entries()].find(([, count]) => count > 1);
  if (duplicate) fail(`duplicate ${label}: ${duplicate[0]}`);
}

for (const page of pages) {
  for (const unit of page.__auditUnits) increment(contentUnitFrequency, unit);
}

const incomingLinks = new Map(pages.map((page) => [page.slug, 0]));
for (const page of pages) {
  for (const slug of page.relatedLinks) {
    incomingLinks.set(slug, (incomingLinks.get(slug) ?? 0) + 1);
  }
}
const orphan = [...incomingLinks.entries()].find(([, count]) => count === 0);
if (orphan) fail(`${orphan[0]}: page has no crawlable related-page entry`);

let minimumUniqueRatio = 1;
let totalUniqueRatio = 0;
for (const page of pages) {
  const uniqueUnits = page.__auditUnits.filter(
    (unit) => contentUnitFrequency.get(unit) === 1,
  ).length;
  const ratio = uniqueUnits / page.__auditUnits.length;
  minimumUniqueRatio = Math.min(minimumUniqueRatio, ratio);
  totalUniqueRatio += ratio;
  if (ratio <= 0.7) {
    fail(
      `${page.slug}: independent content ratio ${(ratio * 100).toFixed(1)}% is not above 70%`,
    );
  }
  delete page.__auditUnits;
}

const averageUniqueRatio = totalUniqueRatio / pages.length;
console.log(
  [
    `SEO audit passed: ${pages.length} unchanged unique URLs`,
    `minimum independent content ratio: ${(minimumUniqueRatio * 100).toFixed(1)}%`,
    `average independent content ratio: ${(averageUniqueRatio * 100).toFixed(1)}%`,
    "duplicate intros: 0; duplicate examples: 0; duplicate FAQs: 0",
    "titles and meta descriptions match the original SEO output",
    "all related links are valid, non-self, and category-relevant",
    "all pages have at least one incoming programmatic HTML link",
    "all pages pass the A/B indexable SEO quality gate",
  ].join("\n"),
);
