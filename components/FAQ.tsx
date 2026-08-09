import { Plus } from "lucide-react";
import { LiveDirectFAQAnswer } from "@/components/live-page-output";
import type { SEOPage } from "@/lib/seoGenerator";

export function FAQ({
  faqs,
  variant = "accordion",
  page,
  referenceDate,
}: {
  faqs: ReadonlyArray<{ question: string; answer: string }>;
  variant?: "accordion" | "editorial";
  page?: SEOPage;
  referenceDate?: Date;
}) {
  return (
    <section
      className="mx-auto max-w-3xl"
      aria-labelledby="faq-heading"
      data-content-stage="faq"
    >
      <div>
        <h2
          id="faq-heading"
          className="font-display text-2xl font-semibold tracking-[-0.02em] text-ink"
        >
          Questions about this calculation
        </h2>
      </div>
      {variant === "editorial" ? (
        <div className="mt-6 divide-y divide-[#E5E8EB] border-y border-[#D9DEE5] text-left">
          {faqs.map((faq, index) => (
            <article key={faq.question} className="py-5 first:pt-4">
              <h3 className="font-display text-base font-semibold leading-7 text-ink sm:text-lg">
                {faq.question}
              </h3>
              <p className="mt-2 text-sm leading-7 text-ink/65">
                {index === 0 && page && referenceDate ? (
                  <LiveDirectFAQAnswer
                    page={page}
                    referenceDate={referenceDate}
                  />
                ) : (
                  faq.answer
                )}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-8 divide-y divide-ink/10 border-y border-ink/15 bg-white">
          {faqs.map((faq, index) => (
            <details key={faq.question} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-semibold text-ink">
                {faq.question}
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-mist text-fern transition group-open:rotate-45">
                  <Plus className="h-4 w-4" aria-hidden="true" />
                </span>
              </summary>
              <p className="max-w-2xl pt-3 text-sm leading-7 text-ink/60">
                {index === 0 && page && referenceDate ? (
                  <LiveDirectFAQAnswer
                    page={page}
                    referenceDate={referenceDate}
                  />
                ) : (
                  faq.answer
                )}
              </p>
            </details>
          ))}
        </div>
      )}
    </section>
  );
}
