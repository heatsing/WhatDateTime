import { useEffect, useState } from "react";
import { format } from "date-fns";
import { CalculatorBox } from "./CalculatorBox";
import { Breadcrumb } from "./Breadcrumb";
import { FAQ } from "./FAQ";
import { JsonLd } from "./json-ld";
import { TimezoneExperience } from "./timezone-experience";
import { getPairCities } from "../lib/indexEligibility";
import type { PageCalculationInput } from "../lib/pageCalculations";
import {
  getDirectFAQ,
  getPageFormula,
  getPageResult,
} from "../lib/pageCalculations";
import {
  breadcrumbListSchema,
  calculatorApplicationSchema,
  faqPageSchema,
} from "../lib/schema";
export type OnDemandData = PageCalculationInput & {
  slug: string;
  title: string;
  h1: string;
  description: string;
  faq: { question: string; answer: string }[];
};
export type OnDemandProps = {
  page: OnDemandData;
  initialTime: string;
  related: { path: string; label: string }[];
  snapshot?: {
    result: string;
    formula: string;
    date: string;
    dateTime: string;
    faqs: { question: string; answer: string }[];
  };
};
export function OnDemandPage({
  page,
  initialTime,
  related,
  snapshot,
}: OnDemandProps) {
  const [now, setNow] = useState(() => new Date(initialTime));
  const [live, setLive] = useState(false);
  useEffect(() => {
    if (page.kind === "timezone") return;
    const update = () => {
      setNow(new Date());
      setLive(true);
    };
    update();
    const timer = setInterval(update, 30000);
    window.addEventListener("focus", update);
    document.addEventListener("visibilitychange", update);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", update);
      document.removeEventListener("visibilitychange", update);
    };
  }, [page.kind]);
  if (page.kind === "timezone") {
    const pair = getPairCities(page.slug)!;
    return (
      <TimezoneExperience
        from={pair[0]}
        to={pair[1]}
        title={page.h1}
        description={page.description}
        path={`/${page.slug}`}
        initialTime={initialTime}
        related={related}
      />
    );
  }
  const faqs =
    !live && snapshot
      ? snapshot.faqs
      : [getDirectFAQ(page, now), ...page.faq.slice(1)];
  return (
    <div
      data-calculator-ready={live}
      className="bg-[#f8fbfe] px-4 pb-14 pt-5 sm:px-6 lg:px-10 xl:px-14"
    >
      <div className="mx-auto max-w-[90rem] space-y-6">
        <JsonLd
          data={[
            calculatorApplicationSchema({
              name: page.title,
              description: page.description,
              path: `/${page.slug}`,
            }),
            breadcrumbListSchema([
              { name: "Home", path: "/" },
              { name: "Date Calculator", path: "/calculators/date-calculator" },
              { name: page.h1, path: `/${page.slug}` },
            ]),
            faqPageSchema(faqs),
          ]}
        />
        <Breadcrumb
          current={page.h1}
          parent={{
            name: "Date Calculator",
            path: "/calculators/date-calculator",
          }}
        />
        <h1 className="font-display text-[34px] font-bold leading-tight text-[#0c2146] sm:text-[42px]">
          {page.h1}
        </h1>
        <p>{page.description}</p>
        <section className="rounded-sm border border-[#d8e1ed] bg-white p-5 sm:p-6">
          <h2 className="text-xl font-bold">Direct answer</h2>
          <p className="mt-3 text-3xl font-semibold" data-direct-answer>
            {!live && snapshot ? snapshot.result : getPageResult(page, now)}
          </p>
          <p className="mt-3" data-formula>
            {!live && snapshot ? snapshot.formula : getPageFormula(page, now)}
          </p>
          <p className="mt-3 text-sm text-[#536b8d]">
            Reference instant: {now.toISOString()}. The server snapshot uses
            UTC; JavaScript updates the calculation to your device’s local date
            and time.
          </p>
        </section>
        <CalculatorBox
          page={page}
          initialResult={
            snapshot?.result || getPageResult(page, new Date(initialTime))
          }
          initialDate={
            snapshot?.date || format(new Date(initialTime), "yyyy-MM-dd")
          }
          initialDateTime={
            snapshot?.dateTime ||
            format(new Date(initialTime), "yyyy-MM-dd'T'HH:mm")
          }
        />
        <section>
          <h2 className="text-2xl font-bold">Related calculators</h2>
          <ul className="mt-4 space-y-3">
            {related.map((link) => (
              <li key={link.path}>
                <a className="text-[#006cff] underline" href={link.path}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
        <FAQ faqs={faqs} />
      </div>
    </div>
  );
}
