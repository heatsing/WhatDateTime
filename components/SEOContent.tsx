import {
  BriefcaseBusiness,
  CalendarRange,
  CircleHelp,
} from "lucide-react";
import type { ContentSection } from "@/lib/seoGenerator";

export function SEOContent({
  data,
}: {
  data: ReadonlyArray<ContentSection>;
}) {
  return <ContentGrid sections={data} />;
}

function ContentGrid({
  sections,
}: {
  sections: ReadonlyArray<{ title: string; text: string }>;
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
