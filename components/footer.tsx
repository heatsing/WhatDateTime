import Link from "next/link";
import { Icon } from "@/components/icon";

const calculatorLinks = [
  ["Date Calculator", "/date-calculator"],
  ["Time Difference", "/time-difference-calculator"],
  ["Age Calculator", "/age-calculator"],
  ["Countdown Timer", "/countdown-timer"],
  ["Time Zone Converter", "/time-zone-converter"],
] as const;

const quickLinks = [
  ["24 hours from now", "/hours-from-now/24"],
  ["30 days from today", "/days-from-today/30"],
  ["8 weeks from today", "/weeks-from-today/8"],
  ["6 months from today", "/months-from-today/6"],
  ["7 days ago", "/days-ago/7"],
] as const;

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-ink text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-lime text-ink">
              <Icon name="spark" className="h-5 w-5" />
            </span>
            <span className="font-display text-lg font-bold">ChronoCraft</span>
          </Link>
          <p className="mt-5 max-w-sm text-sm leading-7 text-white/55">
            Free, focused date and time tools made for quick answers and confident planning.
          </p>
        </div>
        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-lime">Calculators</h2>
          <ul className="mt-5 space-y-3">
            {calculatorLinks.map(([label, href]) => (
              <li key={href}>
                <Link className="text-sm text-white/60 transition hover:text-white" href={href}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-lime">Popular answers</h2>
          <ul className="mt-5 space-y-3">
            {quickLinks.map(([label, href]) => (
              <li key={href}>
                <Link className="text-sm text-white/60 transition hover:text-white" href={href}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 px-5 py-5 text-center text-xs text-white/40">
        © {new Date().getFullYear()} ChronoCraft. Time, made simple.
      </div>
    </footer>
  );
}
