import { format } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { CalculatorBox } from "@/components/CalculatorBox";
import { Breadcrumb } from "@/components/Breadcrumb";
import { DirectDateAnswer } from "@/components/direct-date-answer";
import { DirectDifferenceAnswer } from "@/components/direct-difference-answer";
import { FAQ } from "@/components/FAQ";
import { JsonLd } from "@/components/json-ld";
import { LiveReferenceDateProvider } from "@/components/live-reference-date";
import { RelatedLinks } from "@/components/RelatedLinks";
import { SEOContent } from "@/components/SEOContent";
import { TimezoneComparison } from "@/components/timezone-comparison";
import type { SEOPage } from "@/lib/seoGenerator";
import { getDirectFAQ, getPageFormula, getPageResult } from "@/lib/pageCalculations";
import {
  breadcrumbListSchema,
  calculatorApplicationSchema,
  faqPageSchema,
} from "@/lib/schema";

export function ProgrammaticPageView({
  page,
  related,
  referenceTime,
}: {
  page: SEOPage;
  related: SEOPage[];
  referenceTime: string;
}) {
  const now = new Date(referenceTime);
  const seo = { title: page.title, description: page.description, h1: page.h1, eyebrow: page.eyebrow };
  const result = getPageResult(page, now);
  const formula = getPageFormula(page, now);
  const faqs = [getDirectFAQ(page, now), ...page.faq.slice(1)];
  const landingSections = page.content.sections.map((section) =>
    section.stage === "calculation-basis"
      ? { ...section, text: `${formula} ${section.text}` }
      : section,
  );
  const path = `/${page.slug}`;

  return (
    <>
      <JsonLd data={[
        faqPageSchema(faqs),
        calculatorApplicationSchema({ name: seo.title, description: seo.description, path, dateModified: page.updatedAt }),
        breadcrumbListSchema([
          { name: "Home", path: "/" },
          { name: seo.h1, path },
        ]),
      ]} />
      <LiveReferenceDateProvider initialTime={referenceTime}>
        <section className="bg-white px-5 pb-14 pt-7 sm:px-8 sm:pb-16 sm:pt-10 lg:pb-20 lg:pt-12">
          <div className="mx-auto max-w-5xl">
            <Breadcrumb current={seo.h1} />
            <div className="mt-8 text-center lg:mt-10">
              <p className="text-[15px] font-medium text-fern sm:text-base">{seo.eyebrow}</p>
              <h1 className="mt-2.5 font-display text-4xl font-bold leading-tight tracking-[-0.035em] text-ink sm:text-5xl lg:text-[56px]">{seo.h1}</h1>
              <p className="mx-auto mt-4 max-w-3xl text-base leading-8 text-ink/60 sm:text-lg lg:text-xl lg:leading-9">{seo.description}</p>
            </div>
            <div className="mt-9 lg:mt-11">
              {page.kind === "relative" ? (
                <DirectDateAnswer page={page} referenceDate={now} />
              ) : page.kind === "difference" ? (
                <DirectDifferenceAnswer page={page} referenceDate={now} />
              ) : (
                <TimezoneComparison page={page} referenceDate={now} />
              )}
            </div>
            <div className="mt-9 lg:mt-11">
              <CalculatorBox
                page={page}
                initialResult={result}
                initialDate={format(now, "yyyy-MM-dd")}
                initialDateTime={page.kind === "timezone" ? formatInTimeZone(now, page.fromZone, "yyyy-MM-dd'T'HH:mm") : undefined}
              />
            </div>
          </div>
        </section>
        <section className="border-t border-[#D9DEE5] bg-white px-5 py-14 sm:px-8 sm:py-16 lg:py-20">
          <div className="mx-auto max-w-4xl">
            <SEOContent data={landingSections} variant="deep" page={page} formula={formula} referenceDate={now} />
          </div>
        </section>
        <section className="border-t border-[#D9DEE5] bg-white px-5 py-14 sm:px-8 sm:py-16 lg:py-20">
          <div className="mx-auto max-w-4xl"><RelatedLinks currentPage={page} pages={related} referenceDate={now} /></div>
        </section>
        <section className="border-t border-[#D9DEE5] bg-white px-5 py-14 sm:px-8 sm:py-16 lg:py-20">
          <FAQ faqs={faqs} variant="editorial" page={page} referenceDate={now} />
        </section>
      </LiveReferenceDateProvider>
    </>
  );
}
