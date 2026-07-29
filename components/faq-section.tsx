export function FaqSection({
  title = "Questions, answered",
  faqs,
}: {
  title?: string;
  faqs: ReadonlyArray<{ question: string; answer: string }>;
}) {
  return (
    <section className="mx-auto max-w-3xl">
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-fern">Good to know</p>
        <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">{title}</h2>
      </div>
      <div className="mt-8 divide-y divide-ink/10 overflow-hidden rounded-[1.5rem] border border-ink/[0.07] bg-white px-5 shadow-card sm:px-7">
        {faqs.map((faq) => (
          <details key={faq.question} className="group py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-semibold text-ink">
              {faq.question}
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-mist text-lg text-fern transition group-open:rotate-45">+</span>
            </summary>
            <p className="max-w-2xl pt-3 text-sm leading-7 text-ink/60">{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
