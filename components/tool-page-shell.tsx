import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { FaqSection } from "@/components/faq-section";
import { JsonLd } from "@/components/json-ld";
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
      <section className="border-b border-[#E5E8EB] bg-white px-5 pb-14 pt-7 sm:px-8 sm:pb-16 sm:pt-9">
        <div className="mx-auto max-w-6xl">
          <Breadcrumbs items={[{ label: title }]} />
          <div className="mt-8 max-w-3xl">
            <p className="text-sm font-medium text-fern">{eyebrow}</p>
            <h1 className="mt-2 font-display text-3xl font-bold leading-tight tracking-[-0.025em] text-ink sm:text-4xl">
              {title}
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-ink/60">{description}</p>
          </div>
          <div className="mt-7">{children}</div>
          <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_0.8fr]">
            <section>
              <h2 className="font-display text-2xl font-semibold text-ink">How it works</h2>
              <div className="mt-5 divide-y divide-[#E5E8EB] border-y border-[#E5E8EB]">
              {steps.map((step, index) => (
                <div key={step.title} className="grid grid-cols-[1.75rem_1fr] gap-4 py-5">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-[#E7F0F8] text-xs font-bold text-fern">{index + 1}</span>
                  <div>
                    <h3 className="font-display text-base font-semibold text-ink">{step.title}</h3>
                    <p className="mt-1.5 text-sm leading-6 text-ink/60">{step.text}</p>
                  </div>
                </div>
              ))}
              </div>
            </section>
            <aside className="rounded-lg border border-[#D9DEE5] bg-mist p-6">
              <h2 className="font-display text-xl font-semibold text-ink">Calculation notes</h2>
              <p className="mt-3 text-sm leading-7 text-ink/65">
                The calculator uses the values entered above and keeps calendar dates, clock times, and time-zone rules explicit. Review the result details and assumptions before using an answer for a deadline or schedule.
              </p>
            </aside>
          </div>
        </div>
      </section>

      <section className="border-b border-[#E5E8EB] bg-mist px-5 py-12 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display text-2xl font-semibold text-ink">Related calculators</h2>
          <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {calculatorLinks.filter((link) => link.href !== path).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md border border-[#D9DEE5] bg-white px-4 py-3 text-sm font-medium text-ink/70 hover:border-[#AAB7C2] hover:text-fern"
              >
                {link.title}
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-white px-5 py-14 sm:px-8 sm:py-16">
        <FaqSection faqs={faqs} />
      </section>
    </>
  );
}
