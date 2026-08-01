import {
  BriefcaseBusiness,
  CalendarRange,
  CircleHelp,
} from "lucide-react";
import type { ContentSection } from "@/lib/seoGenerator";

export function SEOContent({
  data,
  variant = "cards",
}: {
  data: ReadonlyArray<ContentSection>;
  variant?: "cards" | "editorial";
}) {
  if (variant === "editorial") {
    return <EditorialContent sections={data} />;
  }
  return <ContentGrid sections={data} />;
}

function EditorialContent({
  sections,
}: {
  sections: ReadonlyArray<ContentSection>;
}) {
  return (
    <section className="mx-auto max-w-3xl" aria-labelledby="calculation-explained">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-fern">
        Calculation guide
      </p>
      <h2
        id="calculation-explained"
        className="mt-3 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl"
      >
        Understand the answer
      </h2>
      <div className="mt-9 divide-y divide-ink/10 border-y border-ink/10">
        {sections.map((section, index) => (
          <article
            key={section.title}
            data-content-stage={section.stage}
            className="grid gap-3 py-8 sm:grid-cols-[2.25rem_1fr] sm:gap-5"
          >
            <span className="grid h-9 w-9 place-items-center rounded-full bg-lime text-xs font-extrabold text-ink">
              {index + 1}
            </span>
            <div>
              <h2 className="font-display text-xl font-bold leading-snug text-ink sm:text-2xl">
                {section.title}
              </h2>
              <p className="mt-3 text-base leading-8 text-ink/65">
                {section.text}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ContentGrid({
  sections,
}: {
  sections: ReadonlyArray<ContentSection>;
}) {
  const icons = [CalendarRange, CircleHelp, BriefcaseBusiness];

  return (
    <section aria-labelledby="calculation-explained">
      <div className="max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-fern">
          Calculation guide
        </p>
        <h2
          id="calculation-explained"
          className="mt-3 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl"
        >
          Understand the answer
        </h2>
      </div>
      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        {sections.map((section, index) => {
          const SectionIcon = icons[index];
          return (
            <article
              key={section.title}
              data-content-stage={section.stage}
              className="rounded-[1.5rem] border border-ink/[0.07] bg-white p-6 shadow-card"
            >
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-lime/60 text-ink">
                <SectionIcon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="mt-5 font-display text-xl font-bold leading-snug text-ink">
                {section.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-ink/60">
                {section.text}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
