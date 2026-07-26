import {
  BriefcaseBusiness,
  CalendarRange,
  CircleHelp,
} from "lucide-react";
import {
  formatHumanInputDate,
  getRelativePhrase,
  stableVariant,
  type SEOPage,
} from "@/lib/seoGenerator";

export function SEOContent({
  page,
  result,
}: {
  page: SEOPage;
  result: string;
}) {
  const variant = stableVariant(page.slug);

  if (page.kind === "timezone") {
    return (
      <ContentGrid
        sections={[
          {
            title: `How to convert ${page.fromCity} time to ${page.toCity} time`,
            text: `Choose a date and wall-clock time in ${page.fromCity}. The converter maps that moment from ${page.fromZone} to ${page.toZone}, then displays the matching local date and time in ${page.toCity}.`,
          },
          {
            title: `Current ${page.fromCity} to ${page.toCity} time`,
            text: `The generated result is ${result}. Time-zone offsets can change during the year, so using the selected date is more reliable than memorizing a fixed hour difference.`,
          },
          {
            title: "Common uses for this conversion",
            text:
              variant === 0
                ? "Use this page to schedule international meetings, customer calls, livestreams, travel connections, or remote-team handoffs."
                : variant === 1
                  ? "This conversion is useful for flight planning, global events, cross-border deadlines, interviews, and calls with friends or family."
                  : "Teams use time conversion for release windows, support coverage, webinars, trading sessions, and travel itineraries.",
          },
        ]}
      />
    );
  }

  if (page.kind === "difference") {
    const start = formatHumanInputDate(page.start);
    const end = formatHumanInputDate(page.end);
    return (
      <ContentGrid
        sections={[
          {
            title: `How to calculate days between ${start} and ${end}`,
            text: `Count each calendar boundary from ${start} up to ${end}. Our engine performs that calendar arithmetic directly and returns ${result}, avoiding errors caused by different month lengths or leap years.`,
          },
          {
            title: "Calendar days versus inclusive days",
            text: `A standard date difference measures elapsed days. If both the start and end dates must be counted—for example, for a hotel stay policy or project schedule—add one to the displayed total.`,
          },
          {
            title: "Common uses for this date difference",
            text:
              variant === 0
                ? "Date differences help with project schedules, billing periods, travel plans, contract terms, and event lead times."
                : variant === 1
                  ? "Use the result for deadlines, subscription periods, countdown planning, delivery windows, and historical research."
                  : "This calculation is common in finance, logistics, HR, education, event planning, and personal record keeping.",
          },
        ]}
      />
    );
  }

  const phrase = getRelativePhrase(page);
  const action = page.direction === "future" ? "add" : "subtract";
  const weekendCopy =
    page.unit === "business-day"
      ? "Weekends are skipped, while country-specific public holidays are not removed."
      : "The count follows normal calendar time and includes weekends.";

  return (
    <ContentGrid
      sections={[
        {
          title: `How to calculate ${phrase}`,
          text: `Start with the selected date, then ${action} ${page.amount} ${page.amount === 1 ? page.unit.replace("-", " ") : `${page.unit.replace("-", " ")}s`}. The calculator handles month boundaries, leap years, and other calendar transitions automatically. ${weekendCopy}`,
        },
        {
          title: `What day will it be after ${page.amount} ${page.unit.replace("-", " ")}${page.amount === 1 ? "" : "s"}?`,
          text: `Using the current local date as the starting point, the answer is ${result}. Change the starting date in the calculator if you need the same interval measured from another day.`,
        },
        {
          title: "Common uses for this calculation",
          text:
            variant === 0
              ? "This calculation is useful for deadlines, delivery estimates, appointment follow-ups, travel planning, and subscription renewals."
              : variant === 1
                ? "People use this date offset for project milestones, payment dates, return windows, event planning, and personal reminders."
                : "Common examples include contract dates, release schedules, school planning, medical follow-ups, and future event preparation.",
        },
      ]}
    />
  );
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
