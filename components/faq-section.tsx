export function FaqSection({
  title = "Questions, answered",
  faqs,
}: {
  title?: string;
  faqs: ReadonlyArray<{ question: string; answer: string }>;
}) {
  return (
    <section className="mx-auto max-w-4xl">
      <h2 className="font-display text-2xl font-semibold text-ink sm:text-3xl">{title}</h2>
      <div className="mt-6 divide-y divide-[#E5E8EB] border-y border-[#D9DEE5]">
        {faqs.map((faq) => (
          <details key={faq.question} className="group py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-semibold text-ink">
              {faq.question}
              <span className="text-xl font-normal text-fern transition group-open:rotate-45">+</span>
            </summary>
            <p className="max-w-2xl pt-3 text-sm leading-7 text-ink/60">{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
