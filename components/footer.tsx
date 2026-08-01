import Link from "next/link";

const groups = [
  {
    title: "Date tools",
    links: [
      ["Date Calculator", "/calculators/date-calculator"],
      ["Days Between Dates", "/calculators/time-difference"],
      ["Age Calculator", "/calculators/age-calculator"],
    ],
  },
  {
    title: "Time tools",
    links: [
      ["Current Time", "/"],
      ["Time Zone Converter", "/calculators/timezone-converter"],
      ["Countdown", "/calculators/countdown"],
    ],
  },
  {
    title: "Popular answers",
    links: [
      ["24 hours from now", "/24-hours-from-now"],
      ["30 days from today", "/30-days-from-today"],
      ["8 weeks from today", "/8-weeks-from-today"],
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-[#D9DEE5] bg-white text-ink">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Link href="/" className="font-display text-lg font-bold tracking-[-0.02em]">WhatDateTime</Link>
          <p className="mt-3 max-w-xs text-sm leading-6 text-ink/55">Accurate date and time tools for everyday planning.</p>
        </div>
        {groups.map((group) => (
          <div key={group.title}>
            <h2 className="text-sm font-semibold text-ink">{group.title}</h2>
            <ul className="mt-3 space-y-2.5">
              {group.links.map(([label, href]) => (
                <li key={href}><Link className="text-sm text-ink/55 hover:text-fern hover:underline" href={href}>{label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-[#E5E8EB] px-5 py-5 text-center text-xs text-ink/45">
        © {new Date().getFullYear()} WhatDateTime
      </div>
    </footer>
  );
}
