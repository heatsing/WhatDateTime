export type TrustPageData = {
  slug: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
  sections: Array<{ title: string; paragraphs: string[] }>;
};

export const trustPages = {
  about: {
    slug: "about",
    title: "About WhatDateTime | Date and Time Calculation Tools",
    description: "Learn how WhatDateTime creates free date, duration, business-day, and time-zone calculations with transparent methods and static SEO pages.",
    h1: "About WhatDateTime",
    intro: "WhatDateTime is a focused collection of date and time utilities built to answer common calendar questions clearly and reproducibly.",
    sections: [
      { title: "What the site provides", paragraphs: ["The site covers relative date arithmetic, elapsed date differences, weekday-based business-day estimates, and conversions between named world time zones.", "Each answer page includes the inputs, direct result, worked calculation, nearby references, and links back to the relevant calculator."] },
      { title: "How pages are maintained", paragraphs: ["Programmatic pages are generated from a typed route inventory and deterministic calculation code. Technical checks compare metadata, canonical URLs, structured data, internal links, and sitemap coverage before deployment.", "Date-dependent answers are rebuilt regularly while content revision dates change only when the method, explanatory content, structured data, links, or time-zone data are materially revised."] },
    ],
  },
  methodology: {
    slug: "calculation-methodology",
    title: "Calculation Methodology | WhatDateTime",
    description: "Review the calendar arithmetic, leap-year, elapsed-day, business-day, and time-zone methods used by WhatDateTime calculators.",
    h1: "Calculation Methodology",
    intro: "The calculators use explicit calendar rules so that the displayed answer, formula, and structured data describe the same calculation.",
    sections: [
      { title: "Calendar and leap-year rules", paragraphs: ["Relative day and week calculations move through real calendar dates. Month and year calculations respect varying month lengths, and leap years follow the Gregorian rule: years divisible by four are leap years except century years not divisible by 400.", "When a target month does not contain the original day number, calendar arithmetic resolves to a valid date in that month rather than inventing a date."] },
      { title: "Elapsed and inclusive duration", paragraphs: ["Date-difference pages report elapsed date boundaries by default. An inclusive count adds one day because it includes both the start and end dates.", "Reversing the endpoints changes direction but not the absolute elapsed duration shown on fixed difference pages."] },
      { title: "Business-day convention", paragraphs: ["Business-day calculations count Monday through Friday and skip Saturdays and Sundays. Public holidays are not removed because holiday calendars differ by country, region, employer, and year.", "Users applying a statutory or company calendar should adjust the result for holidays relevant to their location."] },
    ],
  },
  sources: {
    slug: "data-sources",
    title: "Data Sources | WhatDateTime",
    description: "See the calendar and IANA time-zone data foundations used for date arithmetic, UTC offsets, and daylight-saving conversions on WhatDateTime.",
    h1: "Data Sources",
    intro: "WhatDateTime relies on established calendar behavior and named IANA time zones rather than maintaining an unverified database of offsets.",
    sections: [
      { title: "Calendar calculations", paragraphs: ["Date arithmetic is implemented with date-fns, using Gregorian calendar dates supplied by the browser or the static build reference time.", "Fixed date-difference pages use their stated start and end dates and do not depend on the visitor's current date."] },
      { title: "Time-zone calculations", paragraphs: ["City conversions use IANA identifiers such as America/New_York and Europe/London through date-fns-tz and the JavaScript runtime's time-zone data.", "IANA rules encode historical and scheduled offset transitions. Daylight-saving behavior is evaluated for the selected instant, rather than assumed from a permanent city abbreviation."] },
      { title: "Known limits", paragraphs: ["Future civil-time rules can change after governments announce new policy. Results should be rechecked for high-stakes travel or legal deadlines when a jurisdiction changes its time-zone rules.", "Business-day estimates do not include a country-specific public-holiday dataset."] },
    ],
  },
  corrections: {
    slug: "contact-and-corrections",
    title: "Contact and Corrections | WhatDateTime",
    description: "Report a calculation, time-zone, content, accessibility, or broken-link issue so the WhatDateTime result and supporting explanation can be reviewed.",
    h1: "Contact and Corrections",
    intro: "Calculation accuracy matters. Reports should include enough detail to reproduce the exact result and identify whether the issue is data, wording, or interface related.",
    sections: [
      { title: "How to report an issue", paragraphs: ["Open an issue in the public WhatDateTime GitHub repository and include the affected URL, the inputs used, the displayed result, the expected result, and the visitor time zone when relevant.", "For a time-zone report, also include the local date and time because daylight-saving offsets depend on the instant being converted."] },
      { title: "Review process", paragraphs: ["Reports are checked against the calculation code and the relevant calendar or IANA time-zone rule. Confirmed corrections are applied to the shared generator so metadata, visible answers, formulas, schema, and related results remain consistent.", "Material corrections receive a new content revision date and are validated by the production SEO checks before deployment."] },
    ],
  },
  privacy: {
    slug: "privacy-policy",
    title: "Privacy Policy | WhatDateTime",
    description: "Read how WhatDateTime handles calculator inputs, browser-based date calculations, basic analytics, and links to external services.",
    h1: "Privacy Policy",
    intro: "WhatDateTime calculators are designed to run in the browser without requiring an account or storing calculator inputs in a site database.",
    sections: [
      { title: "Calculator inputs", paragraphs: ["Dates, times, amounts, and selected zones entered into the calculators are processed in the browser for the requested result. The site does not provide account registration and does not maintain a database of calculator histories.", "Avoid entering confidential information into any public website input, even when the field is intended for a simple calculation."] },
      { title: "Analytics and infrastructure", paragraphs: ["The site uses Google Analytics to understand aggregate usage and Cloudflare to deliver and protect static assets. Those providers may process technical information such as IP address, browser type, referring page, and request timing under their own policies.", "Browser controls, consent mechanisms where applicable, and network privacy tools can limit analytics storage."] },
      { title: "External links", paragraphs: ["Links to third-party websites are provided for reference or issue reporting. WhatDateTime does not control the privacy practices of those services."] },
    ],
  },
  terms: {
    slug: "terms-of-use",
    title: "Terms of Use | WhatDateTime",
    description: "Review the terms for using WhatDateTime date, business-day, duration, calendar, countdown, and time-zone calculation tools.",
    h1: "Terms of Use",
    intro: "The tools provide general informational calculations and should be checked against authoritative requirements for high-stakes decisions.",
    sections: [
      { title: "Permitted use", paragraphs: ["You may use the calculators for personal, educational, and professional planning. Automated access must not disrupt availability, evade security controls, or misrepresent WhatDateTime content as an official legal or governmental determination."] },
      { title: "Accuracy and responsibility", paragraphs: ["The site aims to provide deterministic results but cannot guarantee that every external time-zone rule, public holiday, device clock, or user input is correct in every circumstance.", "Legal filing dates, medical schedules, financial settlement dates, travel departures, and contractual deadlines should be confirmed with the responsible authority or provider."] },
      { title: "Changes", paragraphs: ["Calculation methods, explanatory content, and these terms may be updated when errors are corrected or underlying rules change. Material page revisions are reflected in the site's stable revision data."] },
    ],
  },
} satisfies Record<string, TrustPageData>;
