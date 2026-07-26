import { Plus } from "lucide-react";

export function FAQ({
  faqs,
}: {
  faqs: ReadonlyArray<{ question: string; answer: string }>;
}) {
  return (
    <section className="mx-auto max-w-3xl" aria-labelledby="faq-heading">
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-fern">
          Frequently asked
        </p>
        <h2
          id="faq-heading"
          className="mt-3 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl"
        >
          Questions about this calculation
        </h2>
      </div>
      <div className="mt-8 divide-y divide-ink/10 overflow-hidden rounded-[1.5rem] border border-ink/[0.07] bg-white px-5 shadow-card sm:px-7">
        {faqs.map((faq) => (
          <details key={faq.question} className="group py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-semibold text-ink">
              {faq.question}
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-mist text-fern transition group-open:rotate-45">
                <Plus className="h-4 w-4" aria-hidden="true" />
              </span>
            </summary>
            <p className="max-w-2xl pt-3 text-sm leading-7 text-ink/60">
              {faq.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
