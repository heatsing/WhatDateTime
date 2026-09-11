import {
  BriefcaseBusiness,
  CalendarRange,
  CircleHelp,
} from "lucide-react";
import type { ContentSection } from "@/lib/seoGenerator";
import {
  getPageFormula,
  getRelativePhrase,
} from "@/lib/pageCalculations";
import type { SEOPage } from "@/lib/seoGenerator";
import { getPageFacts } from "@/lib/page-facts";

export function SEOContent({
  data,
  variant = "cards",
  page,
  formula,
  referenceDate,
}: {
  data: ReadonlyArray<ContentSection>;
  variant?: "cards" | "editorial" | "deep";
  page?: SEOPage;
  formula?: string;
  referenceDate?: Date;
}) {
  if (variant === "deep" && page && formula && referenceDate) {
    return (
      <DeepContent
        data={data}
        page={page}
        referenceDate={referenceDate}
      />
    );
  }
  if (variant === "editorial") {
    return <EditorialContent sections={data} />;
  }
  return <ContentGrid sections={data} />;
}

function DeepContent({
  data,
  page,
  referenceDate,
}: {
  data: ReadonlyArray<ContentSection>;
  page: SEOPage;
  referenceDate: Date;
}) {
  const sectionByStage = new Map(data.map((section) => [section.stage, section]));
  const calculationBasis = sectionByStage.get("calculation-basis")?.text ?? page.intro;
  const howToUse = sectionByStage.get("how-to-use")?.text;
  const practicalScenarios = sectionByStage.get("practical-scenarios")?.text;
  const subject =
    page.kind === "relative"
      ? getRelativePhrase(page)
      : page.kind === "difference"
        ? `the dates ${page.start} and ${page.end}`
        : `${page.fromCity} to ${page.toCity} time`;
  const steps =
    page.kind === "relative"
      ? [
          ["Enter the interval", `Use ${page.amount} as the amount for this calculation.`],
          ["Confirm the unit", `Keep the unit set to ${page.unit.replace("-", " ")}${page.amount === 1 ? "" : "s"} and verify the direction.`],
          ["Choose the starting point", "Use today's prefilled date or select another date for a custom calculation."],
          ["Calculate and review", "Run the calculator, then compare the result with the worked answer and nearby dates on this page."],
        ]
      : page.kind === "difference"
        ? [
            ["Enter the start", `Use ${page.start} or replace it with the first date you need.`],
            ["Enter the end", `Use ${page.end} or select a different comparison date.`],
            ["Check the order", "Confirm which date is the starting point so the elapsed interval has the intended direction."],
            ["Review the result", "Calculate the interval and compare it with the worked subtraction shown above."],
          ]
        : [
            ["Confirm the origin", `Start with ${page.fromCity} and its ${page.fromZone} time zone.`],
            ["Confirm the destination", `Use ${page.toCity} in ${page.toZone} as the destination.`],
            ["Choose a local time", "Enter the date and wall-clock time that should be interpreted in the origin city."],
            ["Convert the moment", "Review the destination time, offset difference, date change, and nearby comparison rows."],
          ];
  const features =
    page.kind === "relative"
      ? ["Real month-length and leap-year handling", "Automatic month and year boundary transitions", page.unit === "business-day" ? "Weekend skipping for business-day intervals" : "Inclusive handling of every calendar weekday", "A selectable starting date for reusable calculations"]
      : page.kind === "difference"
        ? ["True calendar-date boundary counting", "Automatic month and leap-year handling", "Clear start and end date comparison", "Reusable custom date inputs"]
        : ["IANA time-zone rules", "Daylight-saving offset handling", "Previous-day and next-day detection", "Side-by-side nearby time comparison"];
  const facts = getPageFacts(page, referenceDate);

  return (
    <section className="mx-auto max-w-4xl" aria-labelledby="calculation-explained">
      <p className="text-[15px] font-semibold text-fern sm:text-base">Calculation guide</p>
      <h2 id="calculation-explained" className="mt-2.5 font-display text-3xl font-semibold tracking-[-0.025em] text-ink sm:text-4xl">
        Understanding {subject}
      </h2>

      <article data-content-stage="calculation-basis" className="mt-7 border-t border-[#D9DEE5] pt-6">
        <h2 className="font-display text-2xl font-semibold text-ink">Calculation basis</h2>
        <p className="mt-4 text-base leading-8 text-ink/65 sm:text-lg sm:leading-9">{calculationBasis}</p>
        <p className="mt-5 border-l-4 border-fern bg-[#F4F8FB] px-5 py-4 text-base font-medium leading-8 text-ink">
          {getPageFormula(page, referenceDate)}
        </p>
      </article>

      <article data-content-stage="how-to-use" className="mt-9 border-t border-[#D9DEE5] pt-6">
        <h2 className="font-display text-2xl font-semibold text-ink">How to use this calculator</h2>
        <p className="mt-3 max-w-3xl text-base leading-8 text-ink/60 sm:text-lg">{howToUse ?? "Follow these steps to reproduce the page answer or calculate a different value."}</p>
        <ol className="mt-6 space-y-5">
          {steps.map(([title, text], index) => (
            <li key={title} className="grid grid-cols-[2.25rem_1fr] gap-4">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[#E7F0F8] text-xs font-bold text-fern">{index + 1}</span>
              <div><h3 className="font-display text-lg font-semibold text-ink">{title}</h3><p className="mt-1.5 text-base leading-8 text-ink/60">{text}</p></div>
            </li>
          ))}
        </ol>
      </article>

      <article data-content-stage="practical-scenarios" className="mt-9 border-t border-[#D9DEE5] pt-6">
        <h2 className="font-display text-2xl font-semibold text-ink">Practical applications</h2>
        {practicalScenarios && <p className="mt-4 text-base leading-8 text-ink/65 sm:text-lg sm:leading-9">{practicalScenarios}</p>}
        <ul className="mt-5 space-y-2">
          {page.useCases.map((item) => <li key={item} className="border-l-2 border-[#B8CCE0] pl-4 text-base leading-8 text-ink/65 sm:text-[17px]">{item}</li>)}
        </ul>
      </article>

      <div className="mt-9 space-y-9 border-t border-[#D9DEE5] pt-6">
        <article>
          <h2 className="font-display text-2xl font-semibold text-ink">Facts for this exact calculation</h2>
          <dl className="mt-5 divide-y divide-[#E5E8EB] border-y border-[#D9DEE5]">
            {facts.map((fact) => (
              <div key={fact.label} className="grid gap-1 py-4 sm:grid-cols-[12rem_1fr] sm:gap-5">
                <dt className="font-semibold text-ink">{fact.label}</dt>
                <dd className="text-base leading-7 text-ink/65">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </article>
        <article>
          <h2 className="font-display text-2xl font-semibold text-ink">Worked examples</h2>
          <ul className="mt-5 space-y-5">
            {page.examples.map((item) => <li key={item} className="border-l-2 border-[#B8CCE0] pl-4 text-base leading-8 text-ink/65">{item}</li>)}
          </ul>
        </article>
        <article>
          <h2 className="font-display text-2xl font-semibold text-ink">Advanced calculation features</h2>
          <ul className="mt-5 space-y-3">
            {features.map((item) => <li key={item} className="flex gap-3 text-base leading-8 text-ink/65"><span className="font-bold text-fern" aria-hidden="true">✓</span>{item}</li>)}
          </ul>
          <h3 className="mt-8 font-display text-xl font-bold text-ink">Accuracy tips</h3>
          <ul className="mt-4 space-y-3">
            {page.tips.map((item) => <li key={item} className="text-base leading-8 text-ink/65">{item}</li>)}
          </ul>
        </article>
      </div>
    </section>
  );
}

function EditorialContent({
  sections,
}: {
  sections: ReadonlyArray<ContentSection>;
}) {
  return (
    <section className="mx-auto max-w-3xl" aria-labelledby="calculation-explained">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-fern">
        Calculation guide
      </p>
      <h2
        id="calculation-explained"
        className="mt-3 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl"
      >
        Understand the answer
      </h2>
      <div className="mt-9 divide-y divide-ink/10 border-y border-ink/10">
        {sections.map((section, index) => (
          <article
            key={section.title}
            data-content-stage={section.stage}
            className="grid gap-3 py-8 sm:grid-cols-[2.25rem_1fr] sm:gap-5"
          >
            <span className="grid h-9 w-9 place-items-center rounded-full bg-lime text-xs font-extrabold text-ink">
              {index + 1}
            </span>
            <div>
              <h2 className="font-display text-xl font-bold leading-snug text-ink sm:text-2xl">
                {section.title}
              </h2>
              <p className="mt-3 text-base leading-8 text-ink/65">
                {section.text}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ContentGrid({
  sections,
}: {
  sections: ReadonlyArray<ContentSection>;
}) {
  const icons = [CalendarRange, CircleHelp, BriefcaseBusiness];

  return (
    <section aria-labelledby="calculation-explained">
      <div className="max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-fern">
          Calculation guide
        </p>
        <h2
          id="calculation-explained"
          className="mt-3 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl"
        >
          Understand the answer
        </h2>
      </div>
      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        {sections.map((section, index) => {
          const SectionIcon = icons[index];
          return (
            <article
              key={section.title}
              data-content-stage={section.stage}
              className="border-t border-ink/15 bg-white py-6"
            >
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-lime/60 text-ink">
                <SectionIcon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="mt-5 font-display text-xl font-bold leading-snug text-ink">
                {section.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-ink/60">
                {section.text}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
