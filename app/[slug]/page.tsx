import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { CalculatorBox } from "@/components/CalculatorBox";
import { Breadcrumb } from "@/components/Breadcrumb";
import { DirectDateAnswer } from "@/components/direct-date-answer";
import { DirectDifferenceAnswer } from "@/components/direct-difference-answer";
import { FAQ } from "@/components/FAQ";
import { JsonLd } from "@/components/json-ld";
import { RelatedLinks } from "@/components/RelatedLinks";
import { SEOContent } from "@/components/SEOContent";
import { TimezoneComparison } from "@/components/timezone-comparison";
import {
  buildFAQs,
  getAllSEOPageIndex,
  getLandingSections,
  getPageFormula,
  getPageResult,
  getRelatedPages,
  getSEOPage,
  getSEOText,
} from "@/lib/seoGenerator";
import {
  breadcrumbListSchema,
  calculatorApplicationSchema,
  faqPageSchema,
} from "@/lib/schema";

type PageProps = {
  params: { slug: string };
};

export const dynamicParams = false;
export const revalidate = false;

export function generateStaticParams() {
  return getAllSEOPageIndex().map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const page = await getSEOPage(params.slug);
  if (!page) return {};

  const seo = getSEOText(page);
  const path = `/${page.slug}`;

  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: path },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: path,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
    },
  };
}

export default async function ProgrammaticSEOPage({ params }: PageProps) {
  const page = await getSEOPage(params.slug);
  if (!page) notFound();

  const now = new Date();
  const seo = getSEOText(page);
  const result = getPageResult(page, now);
  const faqs = buildFAQs(page, now);
  const landingSections = getLandingSections(page, now);
  const formula = getPageFormula(page, now);
  const related = await getRelatedPages(page);
  const path = `/${page.slug}`;

  return (
    <>
      <JsonLd
        data={[
          faqPageSchema(faqs),
          calculatorApplicationSchema({
            name: seo.title,
            description: seo.description,
            path,
          }),
          breadcrumbListSchema([
            { name: "Home", path: "/" },
            { name: seo.h1, path },
          ]),
        ]}
      />

      <section className="border-b border-[#E5E8EB] bg-white px-5 pb-14 pt-7 sm:px-8 sm:pb-16 sm:pt-9">
        <div className="mx-auto max-w-6xl">
          <Breadcrumb current={seo.h1} />
          <div className="mt-8 max-w-4xl">
            <p className="text-sm font-medium text-fern">
              {seo.eyebrow}
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold leading-tight tracking-[-0.03em] text-ink sm:text-5xl">
              {seo.h1}
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-ink/60">
              {seo.description}
            </p>
          </div>
          <div className="mt-9">
            {page.kind === "relative" ? (
              <DirectDateAnswer page={page} referenceDate={now} />
            ) : page.kind === "difference" ? (
              <DirectDifferenceAnswer page={page} referenceDate={now} />
            ) : (
              <TimezoneComparison page={page} referenceDate={now} />
            )}
          </div>
          <div className="mt-9">
            <CalculatorBox
              page={page}
              initialResult={result}
              initialDate={format(now, "yyyy-MM-dd")}
              initialDateTime={
                page.kind === "timezone"
                  ? formatInTimeZone(
                      now,
                      page.fromZone,
                      "yyyy-MM-dd'T'HH:mm",
                    )
                  : undefined
              }
            />
          </div>
        </div>
      </section>

      <section className="bg-mist px-5 py-14 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <SEOContent data={landingSections} variant="deep" page={page} formula={formula} />
        </div>
      </section>

      <section className="border-y border-[#E5E8EB] bg-white px-5 py-14 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <RelatedLinks
            currentPage={page}
            pages={related}
            referenceDate={now}
          />
        </div>
      </section>

      <section className="bg-mist px-5 py-14 sm:px-8 sm:py-16">
        <FAQ faqs={faqs} variant="editorial" />
      </section>
    </>
  );
}
