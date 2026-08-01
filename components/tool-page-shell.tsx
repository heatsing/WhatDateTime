import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { FaqSection } from "@/components/faq-section";
import { JsonLd } from "@/components/json-ld";
import { Icon } from "@/components/icon";
import {
  breadcrumbSchema,
  faqSchema,
  webApplicationSchema,
} from "@/lib/structured-data";

const calculatorLinks = [
  { title: "Date Calculator", href: "/calculators/date-calculator" },
  { title: "Time Difference", href: "/calculators/time-difference" },
  { title: "Age Calculator", href: "/calculators/age-calculator" },
  { title: "Countdown Timer", href: "/calculators/countdown" },
  { title: "Time Zone Converter", href: "/calculators/timezone-converter" },
] as const;

export function ToolPageShell({
  title,
  eyebrow,
  description,
  path,
  faqs,
  steps,
  children,
}: {
  title: string;
  eyebrow: string;
  description: string;
  path: string;
  faqs: ReadonlyArray<{ question: string; answer: string }>;
  steps: ReadonlyArray<{ title: string; text: string }>;
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd data={[
        faqSchema(faqs),
        webApplicationSchema(title, description, path),
        breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: title, path },
        ]),
      ]} />
      <section className="relative overflow-hidden px-5 pb-14 pt-8 sm:px-8 sm:pb-18 sm:pt-10">
        <div className="absolute left-1/2 top-20 -z-10 h-80 w-80 -translate-x-1/2 rounded-full bg-lime/20 blur-3xl" />
        <div className="mx-auto max-w-5xl">
          <Breadcrumbs items={[{ label: title }]} />
          <div className="mx-auto mt-8 max-w-3xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-fern">{eyebrow}</p>
            <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight tracking-[-0.035em] text-ink sm:text-5xl">
              {title}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-ink/60 sm:text-lg">{description}</p>
          </div>
          <div className="mt-8">{children}</div>
          <div className="mx-auto mt-16 max-w-3xl">
            <div className="text-center">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-fern">How it works</p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink">
                A clear answer in three steps
              </h2>
            </div>
            <div className="mt-8 divide-y divide-ink/10 border-y border-ink/10">
              {steps.map((step, index) => (
                <div key={step.title} className="grid gap-3 py-6 sm:grid-cols-[2.25rem_1fr] sm:gap-5">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-lime text-xs font-extrabold text-ink">{index + 1}</span>
                  <div>
                    <h3 className="font-display text-lg font-bold text-ink">{step.title}</h3>
                    <p className="mt-2 text-base leading-7 text-ink/60">{step.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 rounded-[1.5rem] bg-mist p-6 sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-fern">Calculation notes</p>
              <h2 className="mt-3 font-display text-2xl font-bold text-ink">How the result is interpreted</h2>
              <p className="mt-3 text-base leading-8 text-ink/65">
                The calculator uses the values entered above and keeps calendar dates, clock times, and time-zone rules explicit. Review the result details and assumptions before using an answer for a deadline or schedule.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-ink px-5 py-14 text-white sm:px-8 sm:py-16">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-lime">More tools</p>
          <h2 className="mt-3 font-display text-2xl font-bold sm:text-3xl">Related calculators</h2>
          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {calculatorLinks.filter((link) => link.href !== path).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group flex min-h-12 items-center justify-between gap-3 rounded-xl bg-white/[0.07] px-4 py-3 text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                {link.title}
                <Icon name="arrow" className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-mist px-5 py-16 sm:px-8 sm:py-20">
        <FaqSection faqs={faqs} />
      </section>
    </>
  );
}
