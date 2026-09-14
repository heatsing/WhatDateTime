import Link from "@/components/link";
import { Icon } from "@/components/icon";

const groups = [
  {
    title: "Date tools",
    links: [
      ["Date Calculator", "/calculators/date-calculator"],
      ["Days Between Dates", "/calculators/time-difference"],
      ["Days Until Date", "/calculators/days-until"],
      ["Calendar Generator", "/calculators/calendar"],
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
    title: "About",
    links: [
      ["About Us", "/about"],
      ["Methodology", "/calculation-methodology"],
      ["Data Sources", "/data-sources"],
      ["Privacy Policy", "/privacy-policy"],
      ["Terms of Use", "/terms-of-use"],
    ],
  },
] as const;

export function Footer({ pathname = "/" }: { pathname?: string }) {
  void pathname;
  return (
    <footer className="border-t border-[#cfd9e6] bg-[#f7f9fc] text-ink">
      <div className="mx-auto grid max-w-[90rem] gap-10 px-5 py-12 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-10 xl:px-14">
        <div>
          <Link href="/" className="inline-flex items-center gap-2 font-display text-lg font-bold tracking-[-0.02em] text-[#10264b]">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-[#0969da] text-white"><Icon name="calendar" className="h-5 w-5" /></span>
            WhatDateTime
          </Link>
          <p className="mt-3 max-w-xs text-sm leading-6 text-ink/55">Accurate date and time tools for everyday planning.</p>
          <div className="mt-4 flex max-w-sm flex-wrap gap-x-4 gap-y-2">
            <Link className="text-xs text-ink/55 hover:text-fern hover:underline" href="/about">About</Link>
            <Link className="text-xs text-ink/55 hover:text-fern hover:underline" href="/calculation-methodology">Methodology</Link>
            <Link className="text-xs text-ink/55 hover:text-fern hover:underline" href="/data-sources">Data sources</Link>
            <Link className="text-xs text-ink/55 hover:text-fern hover:underline" href="/contact-and-corrections">Corrections</Link>
            <Link className="text-xs text-ink/55 hover:text-fern hover:underline" href="/privacy-policy">Privacy</Link>
            <Link className="text-xs text-ink/55 hover:text-fern hover:underline" href="/terms-of-use">Terms</Link>
          </div>
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
      <div className="border-t border-[#d8e1ed] px-5 py-5 text-center text-xs text-ink/45">
        © {new Date().getFullYear()} WhatDateTime
      </div>
    </footer>
  );
}
