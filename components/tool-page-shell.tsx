import { Breadcrumbs } from "@/components/breadcrumbs";
import { FaqSection } from "@/components/faq-section";
import { JsonLd } from "@/components/json-ld";
import {
  breadcrumbSchema,
  faqSchema,
  webApplicationSchema,
} from "@/lib/structured-data";

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
      <section className="relative overflow-hidden px-5 pb-16 pt-10 sm:px-8 sm:pb-20 sm:pt-14">
        <div className="absolute left-1/2 top-20 -z-10 h-80 w-80 -translate-x-1/2 rounded-full bg-lime/20 blur-3xl" />
        <div className="mx-auto max-w-5xl">
          <Breadcrumbs items={[{ label: title }]} />
          <div className="mx-auto mt-10 max-w-3xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-fern">{eyebrow}</p>
            <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight tracking-[-0.035em] text-ink sm:text-6xl">
              {title}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-ink/60 sm:text-lg">{description}</p>
          </div>
          <div className="mt-10">{children}</div>
          <div className="mt-14">
            <div className="text-center">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-fern">How it works</p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink">
                A clear answer in three steps
              </h2>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {steps.map((step, index) => (
                <div key={step.title} className="rounded-[1.5rem] border border-ink/[0.07] bg-white p-6 shadow-card">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-lime text-xs font-extrabold text-ink">
                    {index + 1}
                  </span>
                  <h3 className="mt-4 font-display text-lg font-bold text-ink">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-ink/55">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="bg-mist px-5 py-16 sm:px-8 sm:py-20">
        <FaqSection faqs={faqs} />
      </section>
    </>
  );
}
