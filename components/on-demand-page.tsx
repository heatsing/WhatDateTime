import { useRelativeState } from "./use-relative-state";
import { relativeText, relativeFormula } from "@/lib/relative-state";
import { format } from "date-fns";
import { CalculatorBox } from "./CalculatorBox";
import { Breadcrumb } from "./Breadcrumb";
import { FAQ } from "./FAQ";
import { JsonLd } from "./json-ld";
import { TimezoneExperience } from "./timezone-experience";
import { getPairCities } from "../lib/indexEligibility";
import { getFamilyDetails } from "../lib/seo-taxonomy";
import { relativeFAQs } from "../lib/calculation-faq";
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
  const { state } = useRelativeState(page.kind === "relative" ? page : {kind:"relative",type:"hours-from-now",amount:0,unit:"hour",direction:"future"}, initialTime);
  const now = new Date(state.instant);
  const live = state.mode !== "example";
  const family = getFamilyDetails(page);
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
  const faqs = page.kind === "relative"
    ? relativeFAQs(page)
    : !live && snapshot
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
              { name: family.hubName, path: family.hubPath },
              { name: page.h1, path: `/${page.slug}` },
            ]),
            faqPageSchema(faqs),
          ]}
        />
        <Breadcrumb
          current={page.h1}
          parent={{
            name: family.hubName,
            path: family.hubPath,
          }}
        />
        <h1 className="font-display text-[34px] font-bold leading-tight text-[#0c2146] sm:text-[42px]">
          {page.h1}
        </h1>
        <p>{page.description}</p>
        <section className="rounded-sm border border-[#d8e1ed] bg-white p-5 sm:p-6">
          <h2 className="text-xl font-bold">Direct answer</h2>
          <p className="mt-3 text-3xl font-semibold" data-direct-answer>
            {page.kind === "relative" ? relativeText(state) : !live && snapshot ? snapshot.result : getPageResult(page, now)}
          </p>
          <p className="mt-3" data-formula>
            {page.kind === "relative" ? relativeFormula(state) : !live && snapshot ? snapshot.formula : getPageFormula(page, now)}
          </p>
          <p className="mt-3 text-sm text-[#536b8d]">
            Reference instant: {state.instant} · {state.zone} · {state.mode}. The initial reference is server-rendered; custom inputs remain fixed until reset.
          </p>
        </section>
        <CalculatorBox
          page={page}
          referenceTime={initialTime}
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
