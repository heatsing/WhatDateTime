import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { CalculatorBox } from "@/components/CalculatorBox";
import { Breadcrumb } from "@/components/Breadcrumb";
import { FAQ } from "@/components/FAQ";
import { JsonLd } from "@/components/json-ld";
import { RelatedLinks } from "@/components/RelatedLinks";
import { SEOContent } from "@/components/SEOContent";
import {
  buildFAQs,
  getAllSEOPageIndex,
  getLandingSections,
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

      <section className="relative overflow-hidden px-5 pb-16 pt-10 sm:px-8 sm:pb-20 sm:pt-14">
        <div className="absolute right-0 top-0 -z-10 h-96 w-96 rounded-full bg-lime/20 blur-3xl" />
        <div className="mx-auto max-w-6xl">
          <Breadcrumb current={seo.h1} />
          <div className="mt-10 max-w-4xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-fern">
              {seo.eyebrow}
            </p>
            <h1 className="mt-4 font-display text-4xl font-extrabold leading-[1.08] tracking-[-0.04em] text-ink sm:text-6xl">
              {seo.h1}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-ink/60 sm:text-lg">
              {seo.description}
            </p>
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

      <section className="bg-mist px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <SEOContent data={landingSections} />
        </div>
      </section>

      <section className="bg-ink px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <RelatedLinks
            currentPage={page}
            pages={related}
            referenceDate={now}
          />
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 sm:py-20">
        <FAQ faqs={faqs} />
      </section>
    </>
  );
}
