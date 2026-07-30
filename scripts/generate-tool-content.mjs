import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import {
  addBusinessDays,
  addDays,
  addHours,
  addMonths,
  addWeeks,
  addYears,
  differenceInCalendarDays,
  format,
  parseISO,
  subDays,
  subHours,
} from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

const sourceFiles = [
  "days-from-today.json",
  "days-ago.json",
  "hours-from-now.json",
  "hours-ago.json",
  "weeks.json",
  "months.json",
  "years.json",
  "business-days.json",
  "date-difference.json",
  "timezone.json",
];

const dataFileByType = {
  "days-from-today": "days-from-today.json",
  "days-ago": "days-ago.json",
  "hours-from-now": "hours-from-now.json",
  "hours-ago": "hours-ago.json",
  "weeks-from-today": "weeks-from-today.json",
  "months-from-today": "months-from-today.json",
  "years-from-today": "years-from-today.json",
  "business-days-from-today": "business-days-from-today.json",
  "date-difference": "date-difference.json",
  "timezone-converter": "timezone-converter.json",
};

const sourcePages = sourceFiles.flatMap((file) =>
  JSON.parse(
    readFileSync(new URL(`../data/${file}`, import.meta.url), "utf8"),
  ),
);
const editorialOverrides = JSON.parse(
  readFileSync(
    new URL("../data/editorial-cohort-01.json", import.meta.url),
    "utf8",
  ),
);
const editorialOverrideBySlug = new Map(
  editorialOverrides.map((override) => [override.slug, override]),
);

const bySlug = new Map(sourcePages.map((page) => [page.slug, page]));
const byRelativeKey = new Map(
  sourcePages
    .filter((page) => page.kind === "relative")
    .map((page) => [`${page.type}:${page.amount}`, page]),
);

const maxByType = {
  "days-from-today": 365,
  "days-ago": 365,
  "hours-from-now": 500,
  "hours-ago": 500,
  "weeks-from-today": 200,
  "months-from-today": 300,
  "years-from-today": 300,
  "business-days-from-today": 1000,
};

const anchors = [
  new Date("2026-01-15T10:00:00Z"),
  new Date("2026-04-06T14:00:00Z"),
  new Date("2026-09-21T08:00:00Z"),
];

const relativeContexts = {
  day: [
    "delivery and return windows",
    "medical follow-up dates",
    "school and course deadlines",
    "travel and reservation planning",
    "invoice and payment reminders",
    "event preparation milestones",
  ],
  hour: [
    "support handoffs and service windows",
    "travel arrivals and layovers",
    "release and maintenance schedules",
    "medication and care reminders",
    "auction and promotion deadlines",
    "shift changes and staffing plans",
  ],
  week: [
    "project sprints and review cycles",
    "training and study plans",
    "prenatal and health appointments",
    "campaign and content calendars",
    "lease and contract milestones",
    "trip and event preparation",
  ],
  month: [
    "subscription and renewal planning",
    "financial reporting periods",
    "product roadmaps and launches",
    "visa and document deadlines",
    "seasonal maintenance schedules",
    "long-term learning goals",
  ],
  year: [
    "retirement and savings projections",
    "license and certification renewals",
    "anniversary and reunion planning",
    "education and career timelines",
    "property and warranty milestones",
    "long-range business planning",
  ],
  "business-day": [
    "invoice and settlement terms",
    "shipping and fulfillment estimates",
    "application review windows",
    "contract response deadlines",
    "procurement and approval cycles",
    "customer-service commitments",
  ],
};

function hash(value) {
  let result = 2166136261;
  for (const char of value) {
    result ^= char.charCodeAt(0);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

function pick(list, seed, offset = 0) {
  return list[(hash(seed) + offset * 7) % list.length];
}

function titleCase(value) {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function plural(amount, unit) {
  const clean = unit.replace("-", " ");
  return amount === 1 ? clean : `${clean}s`;
}

function relativePhrase(page) {
  const suffix =
    page.type === "hours-from-now"
      ? "from now"
      : page.direction === "past"
        ? "ago"
        : "from today";
  return `${page.amount} ${plural(page.amount, page.unit)} ${suffix}`;
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

function longDate(value, includeTime = false) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    ...(includeTime
      ? { hour: "numeric", minute: "2-digit", timeZone: "UTC" }
      : { timeZone: "UTC" }),
  }).format(value);
}

function applyRelative(page, date) {
  const amount = page.direction === "past" ? -page.amount : page.amount;
  if (page.unit === "hour") return addHours(date, amount);
  if (page.unit === "day") return addDays(date, amount);
  if (page.unit === "week") return addWeeks(date, amount);
  if (page.unit === "month") return addMonths(date, amount);
  if (page.unit === "year") return addYears(date, amount);
  return addBusinessDays(date, amount);
}

function durationDetail(page) {
  if (page.unit === "hour") {
    const days = Math.floor(page.amount / 24);
    const hours = page.amount % 24;
    return `${days} complete ${days === 1 ? "day" : "days"} and ${hours} additional ${hours === 1 ? "hour" : "hours"}`;
  }
  if (page.unit === "day") {
    const weeks = Math.floor(page.amount / 7);
    const days = page.amount % 7;
    return `${weeks} complete ${weeks === 1 ? "week" : "weeks"} and ${days} additional ${days === 1 ? "day" : "days"}`;
  }
  if (page.unit === "week") {
    return `${(page.amount * 7).toLocaleString("en-US")} calendar days`;
  }
  if (page.unit === "month") {
    const years = Math.floor(page.amount / 12);
    const months = page.amount % 12;
    return `${years} complete ${years === 1 ? "year" : "years"} and ${months} additional ${months === 1 ? "month" : "months"}`;
  }
  if (page.unit === "year") {
    return `${(page.amount * 12).toLocaleString("en-US")} calendar months`;
  }
  const workWeeks = Math.floor(page.amount / 5);
  const workDays = page.amount % 5;
  return `${workWeeks} five-day work ${workWeeks === 1 ? "week" : "weeks"} and ${workDays} additional business ${workDays === 1 ? "day" : "days"}`;
}

function relativeRelated(page) {
  const candidates = [
    Math.max(1, Math.round(page.amount / 2)),
    page.amount + 7,
    page.amount * 2,
    page.amount * 3,
    7,
    14,
    30,
    90,
  ];
  const related = [];
  for (const amount of candidates) {
    if (amount === page.amount || amount > maxByType[page.type]) continue;
    const match = byRelativeKey.get(`${page.type}:${amount}`);
    if (match && !related.includes(match.slug)) related.push(match.slug);
    if (related.length === 6) break;
  }
  return related;
}

function relativeContent(page) {
  const phrase = relativePhrase(page);
  const phraseTitle = titleCase(phrase);
  const includeTime = page.unit === "hour";
  const action = page.direction === "future" ? "add" : "subtract";
  const contexts = relativeContexts[page.unit];
  const contextA = pick(contexts, page.slug, 0);
  const contextB = pick(contexts, page.slug, 1);
  const contextC = pick(contexts, page.slug, 2);
  const detail = durationDetail(page);
  const examples = anchors.map((anchor, index) => {
    const result = applyRelative(page, anchor);
    return `Starting from ${longDate(anchor, includeTime)}, ${phrase} lands on ${longDate(result, includeTime)}; this ${index === 0 ? "shows the direct calendar offset" : index === 1 ? "tests the interval across a different season" : "provides another fixed reference point"}.`;
  });
  const weekendRule =
    page.unit === "business-day"
      ? "Saturday and Sunday are skipped, but public holidays are not removed because holiday calendars vary by location."
      : "Every calendar day is counted, including Saturdays and Sundays.";
  const intro = `${phraseTitle} is a ${page.direction === "future" ? "forward" : "backward"} ${page.unit.replace("-", " ")} calculation equal to ${detail}. This page is designed for ${contextA}, with a selectable start date when today is not the date you need.`;
  const useCases = [
    `Use a ${page.amount}-${page.unit} offset to set ${contextA} without counting calendar boundaries manually.`,
    `Compare the ${phrase} result with an existing date used for ${contextB}.`,
    `Record the calculated endpoint when coordinating ${contextC} across a shared schedule.`,
  ];
  const tips = [
    `${weekendRule} This distinction is especially important for a ${page.amount}-${page.unit} interval.`,
    `For ${phrase}, keep the selected start date and device time zone consistent when sharing the answer.`,
    `If the endpoint must include both the starting and ending dates, document that inclusive-count rule separately from this ${action} operation.`,
  ];
  const faq = [
    {
      question: `What ${includeTime ? "time" : "date"} is ${phrase}?`,
      answer: `Use the live calculator with the current local date and time to get the exact ${phrase} result. The displayed answer updates after the page loads.`,
    },
    {
      question: `How is the ${phrase} calculation performed?`,
      answer: `The engine ${action}s ${page.amount} ${plural(page.amount, page.unit)} from the selected starting point and applies real month lengths and leap-year rules.`,
    },
    {
      question: `What duration does ${phrase} represent?`,
      answer: `${phraseTitle} represents ${detail}. Calendar months and years retain their calendar meaning rather than using a fixed number of days.`,
    },
    {
      question: `Are weekends counted in the ${phrase} result?`,
      answer: weekendRule,
    },
    {
      question: `Can the starting date for ${phrase} be changed?`,
      answer: `Yes. Choose another start date in the calculator to measure the same ${page.amount}-${page.unit} interval from that date.`,
    },
  ];
  const title = `${phraseTitle} - Calculate Exact ${includeTime ? "Time" : "Date"}`;
  const description = `Find out ${includeTime ? "the exact date and time" : "what date it will be"} ${phrase}. Use our free ${includeTime ? "time" : "date"} calculator for an instant, accurate answer.`;

  return {
    ...page,
    title,
    description,
    h1: `What ${includeTime ? "Time" : "Date"} Is ${phraseTitle}?`,
    eyebrow: includeTime ? "Exact date and time" : "Exact calendar date",
    intro,
    useCases,
    examples,
    tips,
    faq,
    relatedLinks: relativeRelated(page),
    keywords: [
      phrase,
      `${phrase} calculator`,
      `${page.amount} ${plural(page.amount, page.unit)} date`,
      includeTime ? "time from now" : "date from today",
      contextA,
    ],
    content: {
      sections: [
        {
          title: `How to calculate ${phrase}`,
          text: `${intro} Start with the selected date, then ${action} the interval. ${weekendRule}`,
        },
        {
          title: `Understanding a ${page.amount}-${page.unit} interval`,
          text: `${phraseTitle} represents ${detail}. For a concrete check, ${examples[hash(page.slug) % examples.length]}`,
        },
        {
          title: `Practical uses and accuracy tips for ${phrase}`,
          text: `${useCases[0]} ${useCases[1]} ${tips[1]}`,
        },
      ],
    },
  };
}

function countWeekdays(start, end) {
  let weekdays = 0;
  let cursor = start;
  while (cursor < end) {
    const day = cursor.getUTCDay();
    if (day !== 0 && day !== 6) weekdays += 1;
    cursor = addDays(cursor, 1);
  }
  return weekdays;
}

function differenceRelated(page) {
  const differencePages = sourcePages.filter(
    (candidate) => candidate.kind === "difference",
  );
  const index = differencePages.findIndex(
    (candidate) => candidate.slug === page.slug,
  );
  const related = [];
  for (let distance = 1; related.length < 6; distance += 1) {
    for (const candidateIndex of [index - distance, index + distance]) {
      const candidate = differencePages[candidateIndex];
      if (candidate) related.push(candidate.slug);
      if (related.length === 6) break;
    }
  }
  return related;
}

function differenceContent(page) {
  const startDate = parseISO(page.start);
  const endDate = parseISO(page.end);
  const start = humanDate(page.start);
  const end = humanDate(page.end);
  const days = Math.abs(differenceInCalendarDays(endDate, startDate));
  const weeks = Math.floor(days / 7);
  const remainingDays = days % 7;
  const weekdays = countWeekdays(startDate, endDate);
  const weekendDays = days - weekdays;
  const inclusiveDays = days + 1;
  const intro = `The interval from ${start} to ${end} spans ${days.toLocaleString("en-US")} elapsed calendar days, or ${weeks} complete ${weeks === 1 ? "week" : "weeks"} plus ${remainingDays} ${remainingDays === 1 ? "day" : "days"}. The calculator measures date boundaries rather than clock hours.`;
  const differenceScenarios = [
    "project planning and milestone reviews",
    "age and anniversary calculations",
    "deadline and compliance tracking",
    "event and travel preparation",
    "billing and contract periods",
    "hotel stays and service windows",
  ];
  const scenarioA = pick(differenceScenarios, page.slug, 0);
  const scenarioB = pick(differenceScenarios, page.slug, 1);
  const useCases = [
    `Use the ${start}–${end} interval for ${scenarioA}, where an exact elapsed-day count prevents schedule ambiguity.`,
    `Compare the ${days}-day span with an inclusive policy for ${scenarioB}; counting both endpoints would total ${inclusiveDays} days.`,
    `Separate the interval into approximately ${weekdays} weekdays and ${weekendDays} weekend days for early capacity planning.`,
  ];
  const examples = [
    `An elapsed-day schedule beginning on ${start} reaches its endpoint on ${end} after ${days} date changes.`,
    `If ${start} is labeled day one, then ${end} becomes day ${inclusiveDays} under inclusive counting.`,
    `Expressed in weeks, the same ${start} to ${end} period is ${weeks} weeks and ${remainingDays} days.`,
  ];
  const tips = [
    `Choose elapsed counting for durations and inclusive counting only when a rule explicitly includes ${start} and ${end}.`,
    `The ${days}-day result includes Saturdays and Sundays; use a business-day calculator when working days are required.`,
    `Leap days and unequal month lengths between ${start} and ${end} are handled by calendar arithmetic automatically.`,
  ];
  const faq = [
    {
      question: `How many days are between ${start} and ${end}?`,
      answer: `There are ${days.toLocaleString("en-US")} elapsed calendar days between ${start} and ${end}.`,
    },
    {
      question: `What is the inclusive day count from ${start} through ${end}?`,
      answer: `Counting both endpoints produces ${inclusiveDays.toLocaleString("en-US")} days, one more than the standard elapsed difference.`,
    },
    {
      question: `How many weeks fit between ${start} and ${end}?`,
      answer: `The interval contains ${weeks} complete ${weeks === 1 ? "week" : "weeks"} and ${remainingDays} remaining ${remainingDays === 1 ? "day" : "days"}.`,
    },
    {
      question: `Are weekends included between ${start} and ${end}?`,
      answer: `Yes. The ${days}-day total includes all calendar days, including approximately ${weekendDays} Saturday or Sunday dates.`,
    },
    {
      question: `Does the ${start} to ${end} calculation handle leap years?`,
      answer: `Yes. The engine uses the actual calendar and includes February 29 whenever it falls inside this specific interval.`,
    },
  ];
  const title = `Days Between ${start} and ${end} - Date Difference`;
  const description = `Calculate the exact number of days between ${start} and ${end}. Get a clear date difference with a free online calculator.`;

  return {
    ...page,
    title,
    description,
    h1: `How Many Days Are Between ${start} and ${end}?`,
    eyebrow: "Date difference answer",
    intro,
    useCases,
    examples,
    tips,
    faq,
    relatedLinks: differenceRelated(page),
    keywords: [
      `days between ${start} and ${end}`,
      `${start} to ${end} date difference`,
      `${days} day interval`,
      "inclusive date count",
      "calendar day calculator",
    ],
    content: {
      sections: [
        {
          title: `How to calculate days between ${start} and ${end}`,
          text: `${intro} Real calendar arithmetic prevents errors caused by different month lengths.`,
        },
        {
          title: `Elapsed versus inclusive counting for ${start} and ${end}`,
          text: `${examples[1]} ${tips[0]}`,
        },
        {
          title: `Planning with this ${days}-day date difference`,
          text: `${useCases[0]} ${useCases[2]} ${tips[2]}`,
        },
      ],
    },
  };
}

function zoneOffset(date, zone) {
  return formatInTimeZone(date, zone, "xxx");
}

function timezoneRelated(page) {
  const timezonePages = sourcePages.filter(
    (candidate) => candidate.kind === "timezone",
  );
  const sameOrigin = timezonePages.filter(
    (candidate) => candidate.fromCity === page.fromCity,
  );
  const index = sameOrigin.findIndex(
    (candidate) => candidate.slug === page.slug,
  );
  const candidates = [];

  for (const distance of [1, -1, 2, -2]) {
    const candidate =
      sameOrigin[(index + distance + sameOrigin.length) % sameOrigin.length];
    if (candidate) candidates.push(candidate);
  }

  const reciprocal = timezonePages.find(
    (candidate) =>
      candidate.fromCity === page.toCity &&
      candidate.toCity === page.fromCity,
  );
  if (reciprocal) candidates.push(reciprocal);

  const sameDestination = timezonePages.find(
    (candidate) =>
      candidate.toCity === page.toCity &&
      candidate.fromCity !== page.fromCity,
  );
  if (sameDestination) candidates.push(sameDestination);

  for (const candidate of timezonePages) {
    if (
      candidate.fromCity === page.fromCity &&
      ["London", "New York", "Tokyo", "Singapore"].includes(candidate.toCity)
    ) {
      candidates.push(candidate);
    }
  }

  return [...new Set(candidates.map((candidate) => candidate.slug))]
    .filter((slug) => slug !== page.slug)
    .slice(0, 6);
}

function convertedExample(page, isoDate) {
  const instant = new Date(isoDate);
  const from = formatInTimeZone(
    instant,
    page.fromZone,
    "MMMM d, yyyy 'at' h:mm a zzz",
  );
  const to = formatInTimeZone(
    instant,
    page.toZone,
    "MMMM d, yyyy 'at' h:mm a zzz",
  );
  return `${from} in ${page.fromCity} is the same instant as ${to} in ${page.toCity}.`;
}

function timezoneContent(page) {
  const pair = `${page.fromCity} to ${page.toCity}`;
  const january = new Date("2026-01-15T15:00:00Z");
  const july = new Date("2026-07-15T15:00:00Z");
  const fromWinter = zoneOffset(january, page.fromZone);
  const toWinter = zoneOffset(january, page.toZone);
  const fromSummer = zoneOffset(july, page.fromZone);
  const toSummer = zoneOffset(july, page.toZone);
  const seasonal =
    fromWinter !== fromSummer || toWinter !== toSummer
      ? `At least one side changes offset during the year (${fromWinter}/${toWinter} in January and ${fromSummer}/${toSummer} in July), so the gap is date-sensitive.`
      : `The sampled January and July offsets remain ${fromWinter} and ${toWinter}, but the selected date is still used for authoritative conversion.`;
  const examples = [
    convertedExample(page, "2026-01-15T15:00:00Z"),
    convertedExample(page, "2026-04-15T08:30:00Z"),
    convertedExample(page, "2026-09-15T20:00:00Z"),
  ];
  const intro = `This ${pair} converter maps a wall-clock time from the IANA zone ${page.fromZone} to ${page.toZone}. It preserves the same instant while changing the local date, time, and zone abbreviation shown for ${page.toCity}.`;
  const useCases = [
    `Schedule a ${page.fromCity} meeting with attendees in ${page.toCity} without assuming a fixed year-round offset.`,
    `Check whether a ${page.fromCity} flight, livestream, or deadline falls on the same calendar date in ${page.toCity}.`,
    `Plan remote-team coverage between ${page.fromCity} and ${page.toCity} using the selected date's official zone rules.`,
  ];
  const tips = [
    `${seasonal}`,
    `Enter the time as it appears in ${page.fromCity}; the converter interprets it in ${page.fromZone}, not in the device's local zone.`,
    `For repeated ${pair} events, recheck dates around daylight-saving transitions instead of copying a previous conversion.`,
  ];
  const faq = [
    {
      question: `How do I convert ${page.fromCity} time to ${page.toCity} time?`,
      answer: `Choose the local date and time in ${page.fromCity}. The converter interprets it in ${page.fromZone} and displays the matching moment in ${page.toZone}.`,
    },
    {
      question: `Is the ${pair} time difference fixed all year?`,
      answer: seasonal,
    },
    {
      question: `Does the ${pair} converter handle daylight saving time?`,
      answer: `Yes. It uses IANA rules for ${page.fromZone} and ${page.toZone} on the selected date.`,
    },
    {
      question: `Can ${page.fromCity} and ${page.toCity} show different calendar dates?`,
      answer: `Yes. A conversion can cross midnight or the International Date Line, so ${page.toCity} may be on the previous or next date.`,
    },
    {
      question: `Which time zones represent ${page.fromCity} and ${page.toCity}?`,
      answer: `${page.fromCity} uses ${page.fromZone}, while ${page.toCity} uses ${page.toZone} in this calculator.`,
    },
  ];
  const title = `${page.fromCity} to ${page.toCity} Time Converter`;
  const description = `Convert time from ${page.fromCity} to ${page.toCity}. Compare current local times and time-zone offsets instantly.`;

  return {
    ...page,
    title,
    description,
    h1: `${page.fromCity} to ${page.toCity} Time`,
    eyebrow: "World time conversion",
    intro,
    useCases,
    examples,
    tips,
    faq,
    relatedLinks: timezoneRelated(page),
    keywords: [
      `${page.fromCity} to ${page.toCity} time`,
      `${pair} time converter`,
      `${page.fromCity} time zone`,
      `${page.toCity} local time`,
      "international meeting planner",
    ],
    content: {
      sections: [
        {
          title: `How to convert ${page.fromCity} time to ${page.toCity} time`,
          text: `${intro} ${tips[1]}`,
        },
        {
          title: `Seasonal offset details for ${page.fromCity} and ${page.toCity}`,
          text: `${seasonal} ${examples[hash(page.slug) % examples.length]}`,
        },
        {
          title: `Practical uses for the ${pair} conversion`,
          text: `${useCases[0]} ${useCases[1]} ${tips[2]}`,
        },
      ],
    },
  };
}

const contentPages = sourcePages.map((page) => {
  const generated =
    page.kind === "relative"
      ? relativeContent(page)
      : page.kind === "difference"
        ? differenceContent(page)
        : timezoneContent(page);
  const override = editorialOverrideBySlug.get(page.slug);
  if (!override) return generated;
  const { slug: _slug, ...editorial } = override;
  return { ...generated, ...editorial };
});

for (const override of editorialOverrides) {
  if (!bySlug.has(override.slug)) {
    throw new Error(`Editorial override does not match a route: ${override.slug}`);
  }
  if (override.content?.sections?.length !== 3 || override.faq?.length !== 5) {
    throw new Error(
      `${override.slug}: editorial content requires three sections and five FAQs`,
    );
  }
}

function scorePage(page) {
  const commonAmounts = new Set([
    1, 2, 3, 5, 7, 10, 14, 21, 24, 30, 45, 60, 90, 100, 180, 365,
  ]);
  const contentScore =
    Math.min(7, Math.floor(page.intro.length / 35)) +
    Math.min(7, page.examples.length * 2) +
    Math.min(7, page.useCases.length * 2) +
    Math.min(7, page.tips.length * 2) +
    Math.min(7, page.faq.length);
  const intentScore =
    page.kind === "timezone"
      ? 22
      : page.kind === "difference"
        ? 14
        : commonAmounts.has(page.amount)
          ? 26
          : 18;
  const internalLinkScore = Math.min(15, page.relatedLinks.length * 3);
  const contentLength = [
    page.intro,
    ...page.examples,
    ...page.useCases,
    ...page.tips,
    ...page.faq.flatMap((item) => [item.question, item.answer]),
    ...page.content.sections.flatMap((section) => [
      section.title,
      section.text,
    ]),
  ].join(" ").length;
  const contentLengthScore =
    contentLength >= 2600 ? 10 : contentLength >= 1800 ? 7 : 4;
  const templateSimilarityScore =
    new Set([
      page.intro,
      ...page.examples,
      ...page.useCases,
      ...page.tips,
      ...page.faq.map((item) => `${item.question}:${item.answer}`),
    ]).size >= 15
      ? 10
      : 5;
  const score = Math.min(
    100,
    contentScore +
      intentScore +
      internalLinkScore +
      contentLengthScore +
      templateSimilarityScore,
  );
  const grade = score >= 90 ? "A" : score >= 75 ? "B" : "C";

  return {
    ...page,
    updatedAt: null,
    searchIntent: {
      category:
        page.kind === "timezone"
          ? "international time coordination"
          : page.kind === "difference"
            ? "fixed date interval calculation"
            : "relative date or time calculation",
      evidence: "modeled",
      rationale:
        page.kind === "timezone"
          ? "Supports meetings, travel, deadlines, and daylight-saving checks."
          : page.kind === "difference"
            ? "Answers an exact interval question with inclusive and weekday context."
            : "Answers a direct date-offset query with calendar rules and examples.",
    },
    seoScore: {
      score,
      grade,
      action: grade === "A" ? "index" : "index-observe",
      factors: {
        content: contentScore,
        searchIntent: intentScore,
        internalLinks: internalLinkScore,
        contentLength: contentLengthScore,
        templateSimilarity: templateSimilarityScore,
      },
    },
  };
}

const enrichedPages = contentPages.map(scorePage);

for (const page of enrichedPages) {
  for (const slug of page.relatedLinks) {
    if (!bySlug.has(slug)) {
      throw new Error(`${page.slug}: related page ${slug} does not exist`);
    }
  }
}

const targetDir = new URL("../data/tools/", import.meta.url);
mkdirSync(targetDir, { recursive: true });
const runtimeDir = new URL("../data/runtime-tools/", import.meta.url);
mkdirSync(runtimeDir, { recursive: true });

for (const [type, file] of Object.entries(dataFileByType)) {
  const records = enrichedPages.filter((page) => page.type === type);
  writeFileSync(
    new URL(file, targetDir),
    `${JSON.stringify(records, null, 2)}\n`,
  );
  const runtimeRecords = records.map((page) => ({
    kind: page.kind,
    slug: page.slug,
    type: page.type,
    ...(page.kind === "relative"
      ? {
          amount: page.amount,
          unit: page.unit,
          direction: page.direction,
        }
      : page.kind === "difference"
        ? { start: page.start, end: page.end }
        : {
            fromCity: page.fromCity,
            fromZone: page.fromZone,
            toCity: page.toCity,
            toZone: page.toZone,
          }),
    title: page.title,
    description: page.description,
    h1: page.h1,
    eyebrow: page.eyebrow,
    faq: page.faq,
    relatedLinks: page.relatedLinks,
    updatedAt: page.updatedAt,
    content: page.content,
  }));
  writeFileSync(
    new URL(file, runtimeDir),
    `${JSON.stringify({
      encoding: "gzip-base64",
      data: gzipSync(JSON.stringify(runtimeRecords), { level: 9 }).toString(
        "base64",
      ),
    })}\n`,
  );
  console.log(`${file}: ${records.length} enriched records`);
}

const pageIndex = enrichedPages.map((page) => ({
  slug: page.slug,
  kind: page.kind,
  type: page.type,
  dataFile: dataFileByType[page.type],
  updatedAt: page.updatedAt,
}));
writeFileSync(
  new URL("index.json", targetDir),
  `${JSON.stringify(pageIndex, null, 2)}\n`,
);
console.log(`Generated ${enrichedPages.length} independent tool page records`);
