import Link from "@/components/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { FaqSection } from "@/components/faq-section";
import { JsonLd } from "@/components/json-ld";
import { ChevronRight } from "lucide-react";
import { breadcrumbSchema, faqSchema, webApplicationSchema } from "@/lib/structured-data";

const calculatorLinks = [
  { title: "Date Calculator", detail: "Add or subtract calendar units.", href: "/calculators/date-calculator" },
  { title: "Days Between Dates", detail: "Measure the interval between dates.", href: "/calculators/time-difference" },
  { title: "Days Until Date", detail: "Count days until a target date.", href: "/calculators/days-until" },
  { title: "Business Days Calculator", detail: "Calculate working-day deadlines.", href: "/30-business-days-from-today" },
  { title: "Age Calculator", detail: "Find an exact age from a birth date.", href: "/calculators/age-calculator" },
  { title: "Day of the Week", detail: "Identify the weekday for any date.", href: "/calculators/day-of-week" },
  { title: "Calendar Generator", detail: "View any month and year.", href: "/calculators/calendar" },
  { title: "Weeks and Days Ago", detail: "Combine weeks and days in the past.", href: "/calculators/weeks-and-days-ago" },
  { title: "Countdown Timer", detail: "Track time until a future moment.", href: "/calculators/countdown" },
  { title: "Time Zone Converter", detail: "Convert time between world cities.", href: "/calculators/timezone-converter" },
] as const;

type CalculatorLink = (typeof calculatorLinks)[number];

function SidebarLinks({ title, links }: { title: string; links: ReadonlyArray<CalculatorLink> }) {
  return (
    <section className="rounded-sm border border-[#d8e1ed] bg-white p-4">
      <h2 className="font-display text-lg font-bold text-[#10264b]">{title}</h2>
      <div className="mt-3 border-t border-[#d8e1ed]">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="group block border-b border-[#e2e7ee] py-3 last:border-b-0">
            <span className="flex items-center justify-between gap-3 text-sm font-semibold text-[#0969da] group-hover:underline">{link.title}<ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" /></span>
            <span className="mt-1 block text-xs leading-5 text-[#536b8d]">{link.detail}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function ToolPageShell({ title, description, seoDescription = description, path, faqs, steps, methodology, accuracy, useCases, children }: {
  title: string;
  eyebrow: string;
  description: string;
  seoDescription?: string;
  path: string;
  faqs: ReadonlyArray<{ question: string; answer: string }>;
  steps: ReadonlyArray<{ title: string; text: string }>;
  methodology: { title: string; paragraphs: ReadonlyArray<string> };
  accuracy: { title: string; text: string };
  useCases: ReadonlyArray<string>;
  children: React.ReactNode;
}) {
  const related = calculatorLinks.filter((link) => link.href !== path);

  return (
    <>
      <JsonLd data={[
        faqSchema(faqs),
        webApplicationSchema(title, seoDescription, path),
        breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Calculators", path: "/calculators/date-calculator" }, { name: title, path }]),
      ]} />

      <div className="bg-white px-4 pb-14 pt-6 sm:px-6 lg:px-10 xl:px-14">
        <div className="mx-auto max-w-[90rem]">
          <Breadcrumbs items={[{ label: "Calculators", href: "/calculators/date-calculator" }, { label: title }]} />
          <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-8 xl:grid-cols-[minmax(0,1fr)_320px] xl:gap-10">
            <div className="min-w-0">
              <header>
                <h1 className="font-display text-[38px] font-bold leading-tight tracking-[-0.04em] text-[#0c2146] sm:text-[46px]">{title}</h1>
                <p className="mt-2 text-lg leading-7 text-[#263d60]">{description}</p>
                <p className="mt-3 max-w-4xl text-sm leading-6 text-[#536b8d]">{seoDescription}</p>
              </header>

              <div className="mt-7">{children}</div>

              <section className="mt-10">
                <h2 className="font-display text-[28px] font-bold tracking-[-0.03em] text-[#10264b]">How to Use the {title}</h2>
                <ol className="mt-5 grid gap-6 sm:grid-cols-3">
                  {steps.map((step, index) => (
                    <li key={step.title} className="grid grid-cols-[2.5rem_1fr] gap-3 sm:block">
                      <span className="grid h-10 w-10 place-items-center rounded-full bg-[#0b74e5] text-sm font-bold text-white">{index + 1}</span>
                      <div className="sm:mt-3"><h3 className="font-semibold text-[#10264b]">{step.title}</h3><p className="mt-1 text-sm leading-6 text-[#536b8d]">{step.text}</p></div>
                    </li>
                  ))}
                </ol>
              </section>

              <section className="mt-10">
                <h2 className="font-display text-[28px] font-bold tracking-[-0.03em] text-[#10264b]">{methodology.title}</h2>
                <div className="mt-3 space-y-3 text-[15px] leading-7 text-[#405776]">
                  {methodology.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                </div>
                <aside className="mt-5 border-l-4 border-[#0b74e5] bg-[#edf6ff] px-5 py-4">
                  <h3 className="font-semibold text-[#075fc5]">{accuracy.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-[#405776]">{accuracy.text}</p>
                </aside>
              </section>

              <section className="mt-10">
                <h2 className="font-display text-[28px] font-bold tracking-[-0.03em] text-[#10264b]">Common Ways to Use This Tool</h2>
                <ul className="mt-4 grid list-disc gap-x-8 gap-y-2 pl-5 text-sm leading-6 text-[#405776] sm:grid-cols-2">
                  {useCases.map((useCase) => <li key={useCase}>{useCase}</li>)}
                </ul>
              </section>

              <section className="mt-10">
                <h2 className="font-display text-[28px] font-bold tracking-[-0.03em] text-[#10264b]">Related Calculators</h2>
                <div className="mt-4 grid gap-x-8 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
                  {related.map((link) => <Link key={link.href} href={link.href} className="text-sm font-medium leading-6 text-[#0969da] hover:underline">{link.title}</Link>)}
                </div>
              </section>

              <section className="mt-10"><FaqSection faqs={faqs} /></section>
            </div>

            <aside className="border-t border-[#d8e1ed] pt-8 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0" aria-label="Calculator navigation">
              <SidebarLinks title={title.includes("Time") || title.includes("Countdown") ? "Popular Time Tools" : "Popular Date Tools"} links={related.slice(0, 6)} />
              <div className="mt-6"><SidebarLinks title="Related Calculators" links={related.slice(4, 10)} /></div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
