import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { FaqSection } from "@/components/faq-section";
import { Icon } from "@/components/icon";
import { JsonLd } from "@/components/json-ld";
import { RelativeCalculator } from "@/components/relative-calculator";
import {
  calculationDefinitions,
  calculationSlugs,
  calculateRelativeDate,
  formatResult,
  getPagePhrase,
  isCalculationSlug,
  pluralize,
} from "@/lib/calculator";
import {
  breadcrumbSchema,
  faqSchema,
  webApplicationSchema,
} from "@/lib/structured-data";

type PageProps = {
  params: { calculation: string; amount: string };
};

export const dynamicParams = false;

export function generateStaticParams() {
  return calculationSlugs.flatMap((slug) => {
    const { max } = calculationDefinitions[slug];
    return Array.from({ length: max }, (_, index) => ({
      calculation: slug,
      amount: String(index + 1),
    }));
  });
}

function resolvePage(params: PageProps["params"]) {
  if (!isCalculationSlug(params.calculation)) return null;
  const amount = Number(params.amount);
  const definition = calculationDefinitions[params.calculation];
  if (!Number.isInteger(amount) || amount < 1 || amount > definition.max) return null;
  return { slug: params.calculation, amount, definition };
}

export function generateMetadata({ params }: PageProps): Metadata {
  const page = resolvePage(params);
  if (!page) return {};

  const phrase = getPagePhrase(page.slug, page.amount);
  const title = `What Is ${phrase}?`;
  const description = `Find the exact date${page.definition.unit === "hour" ? " and time" : ""} ${phrase}. Get a clear answer, calculation details, and related date tools.`;
  const path = `/${page.slug}/${page.amount}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, type: "article" },
  };
}

export default function RelativeDatePage({ params }: PageProps) {
  const page = resolvePage(params);
  if (!page) notFound();

  const { slug, amount, definition } = page;
  const phrase = getPagePhrase(slug, amount);
  const resultDate = calculateRelativeDate(new Date(), amount, definition);
  const result = formatResult(resultDate, definition.unit === "hour");
  const unitLabel = pluralize(definition.unit, amount);
  const calculationVerb = definition.direction === "future" ? "add" : "subtract";
  const path = `/${slug}/${amount}`;

  const faqs = [
    {
      question: `What date is ${phrase}?`,
      answer: `${phrase.charAt(0).toUpperCase() + phrase.slice(1)} lands on ${result.primary}${definition.unit === "hour" ? ` at ${result.secondary}` : ""}, based on the current local date and time.`,
    },
    {
      question: `How do you calculate ${phrase}?`,
      answer: `Start with the current date${definition.unit === "hour" ? " and time" : ""}, then ${calculationVerb} ${amount} ${unitLabel}. The calculator handles calendar length and date boundaries automatically.`,
    },
    {
      question: "Does this calculation use my local time?",
      answer:
        "Yes. The interactive result uses the date, time, and time zone reported by your device. Your result may differ from someone in another time zone near a day boundary.",
    },
    {
      question: "Are months and years always the same length?",
      answer:
        "No. Calendar months contain 28 to 31 days, and leap years contain an extra day. Calendar-based addition preserves those real calendar rules.",
    },
  ];

  const nearbyAmounts = Array.from(
    new Set([amount - 2, amount - 1, amount + 1, amount + 2]),
  ).filter((value) => value >= 1 && value <= definition.max);

  const related = [
    { label: `${amount} days from today`, href: `/days-from-today/${Math.min(amount, 31)}` },
    { label: `${Math.min(amount, 24)} hours from now`, href: `/hours-from-now/${Math.min(amount, 24)}` },
    { label: `${Math.min(amount, 31)} days ago`, href: `/days-ago/${Math.min(amount, 31)}` },
  ].filter((item) => item.href !== path);

  return (
    <>
      <JsonLd data={[
        faqSchema(faqs),
        webApplicationSchema(`Calculate ${phrase}`, `Instantly calculate the date ${phrase}.`, path),
        breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: phrase, path },
        ]),
      ]} />

      <section className="relative overflow-hidden px-5 pb-16 pt-10 sm:px-8 sm:pb-20 sm:pt-14">
        <div className="absolute right-0 top-0 -z-10 h-72 w-72 rounded-full bg-lime/20 blur-3xl" />
        <div className="mx-auto max-w-5xl">
          <Breadcrumbs items={[{ label: phrase }]} />
          <div className="mt-10 max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-fern">Date & time answer</p>
            <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight tracking-[-0.035em] text-ink sm:text-6xl">
              What is {phrase}?
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-ink/60 sm:text-lg">
              Get the exact date{definition.unit === "hour" ? " and time" : ""}, then adjust the amount to explore another answer.
            </p>
          </div>
          <div className="mt-9">
            <RelativeCalculator
              slug={slug}
              initialAmount={amount}
              initialPrimary={result.primary}
              initialSecondary={result.secondary}
            />
          </div>
        </div>
      </section>

      <section className="bg-mist px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-[1.75rem] bg-white p-6 shadow-card sm:p-9">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-lime/60 text-ink">
              <Icon name="spark" className="h-5 w-5" />
            </span>
            <h2 className="mt-5 font-display text-2xl font-bold tracking-tight text-ink">
              How this answer is calculated
            </h2>
            <div className="mt-5 space-y-4 text-sm leading-7 text-ink/60">
              <p>
                To find <strong className="text-ink">{phrase}</strong>, start with today&apos;s local date
                {definition.unit === "hour" ? " and current time" : ""}. Then {calculationVerb}{" "}
                <strong className="text-ink">{amount} {unitLabel}</strong>.
              </p>
              <p>
                The resulting date is <strong className="text-ink">{result.primary}</strong>
                {definition.unit === "hour" ? ` at ${result.secondary}` : ""}. Calendar calculations account
                for different month lengths, leap years, and transitions across months or years.
              </p>
              <p>
                Because the live calculator uses your device&apos;s clock, it refreshes for your local time
                when the page opens.
              </p>
            </div>
          </article>

          <aside className="rounded-[1.75rem] bg-ink p-6 text-white sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-lime">Nearby answers</p>
            <div className="mt-5 grid gap-2">
              {nearbyAmounts.map((value) => (
                <Link
                  key={value}
                  href={`/${slug}/${value}`}
                  className="flex items-center justify-between rounded-xl bg-white/[0.06] px-4 py-3 text-sm font-semibold text-white/75 transition hover:bg-white/10 hover:text-white"
                >
                  {getPagePhrase(slug, value)}
                  <Icon name="arrow" className="h-4 w-4" />
                </Link>
              ))}
            </div>
            <p className="mt-7 text-xs font-bold uppercase tracking-[0.18em] text-lime">Try another unit</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {related.map((item) => (
                <Link key={item.href} href={item.href} className="rounded-full border border-white/15 px-3 py-2 text-xs text-white/65 transition hover:border-lime hover:text-lime">
                  {item.label}
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 sm:py-20">
        <FaqSection faqs={faqs} />
      </section>

      <section className="px-5 pb-20 sm:px-8">
        <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-5 rounded-[1.75rem] bg-sage/60 p-7 sm:flex-row sm:items-center sm:p-9">
          <div>
            <h2 className="font-display text-2xl font-bold text-ink">Need a custom calculation?</h2>
            <p className="mt-2 text-sm text-ink/55">Add or subtract any mix of date units from a date you choose.</p>
          </div>
          <Link href="/date-calculator" className="inline-flex shrink-0 items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-bold text-white">
            Open date calculator <Icon name="arrow" className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
