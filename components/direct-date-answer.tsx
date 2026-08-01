import {
  addDays,
  eachDayOfInterval,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import {
  calculateRelativeDate,
  formatLongDate,
} from "@/lib/dateCalculator";
import {
  getPageFormula,
  getPageResult,
  getRelativePhrase,
  type SEOPage,
} from "@/lib/seoGenerator";

type RelativePage = Extract<SEOPage, { kind: "relative" }>;

type DirectDateAnswerProps = {
  page: RelativePage;
  referenceDate: Date;
};

const weekdays = [
  ["Sunday", "Sun"],
  ["Monday", "Mon"],
  ["Tuesday", "Tue"],
  ["Wednesday", "Wed"],
  ["Thursday", "Thu"],
  ["Friday", "Fri"],
  ["Saturday", "Sat"],
] as const;

export function DirectDateAnswer({
  page,
  referenceDate,
}: DirectDateAnswerProps) {
  const includesTime = page.unit === "hour";
  const phrase = getRelativePhrase(page);
  const resultDate = calculateRelativeDate(
    referenceDate,
    page.amount,
    page.unit,
    page.direction,
  );
  const result = getPageResult(page, referenceDate);
  const formula = getPageFormula(page, referenceDate);
  const prompt = `${includesTime ? "What time is" : "What date is"} ${phrase}?`;

  return (
    <article
      data-content-stage="direct-answer"
      className="mx-auto max-w-3xl rounded-[1.75rem] border border-ink/10 bg-white px-5 py-8 text-center shadow-card sm:px-10 sm:py-11"
      aria-labelledby="direct-date-answer-heading"
    >
      <header>
        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-fern">
          Direct answer
        </p>
        <h2
          id="direct-date-answer-heading"
          className="mt-3 font-display text-xl font-bold leading-snug text-ink/70 sm:text-2xl"
        >
          {prompt}
        </h2>
        <p className="mt-5" aria-live="polite">
          <time
            dateTime={format(
              resultDate,
              includesTime ? "yyyy-MM-dd'T'HH:mm" : "yyyy-MM-dd",
            )}
            className="font-display text-3xl font-extrabold leading-tight tracking-[-0.035em] text-ink sm:text-5xl"
          >
            {result}
          </time>
        </p>
      </header>

      {!includesTime && <MonthCalendar resultDate={resultDate} />}

      <section
        className={`${includesTime ? "mt-8" : "mt-7"} rounded-2xl bg-mist px-5 py-4`}
        aria-labelledby="calculation-basis-heading"
      >
        <h3
          id="calculation-basis-heading"
          className="font-display text-sm font-bold text-fern"
        >
          Calculation basis
        </h3>
        <p className="mt-1 text-sm leading-6 text-ink/65">{formula}</p>
      </section>

      <div className="mt-9 grid gap-4 text-left sm:grid-cols-2">
        <DateComparison
          label="Starting date"
          date={referenceDate}
          includesTime={includesTime}
        />
        <DateComparison
          label="Result date"
          date={resultDate}
          includesTime={includesTime}
        />
      </div>
    </article>
  );
}

function MonthCalendar({ resultDate }: { resultDate: Date }) {
  const gridStart = startOfWeek(startOfMonth(resultDate), {
    weekStartsOn: 0,
  });
  const days = eachDayOfInterval({
    start: gridStart,
    end: addDays(gridStart, 41),
  });
  const weeks = Array.from({ length: 6 }, (_, index) =>
    days.slice(index * 7, index * 7 + 7),
  );
  const monthLabel = format(resultDate, "MMMM yyyy");

  return (
    <section
      className="mx-auto mt-8 max-w-sm overflow-hidden rounded-xl border border-ink/10 bg-white"
      aria-label={`${monthLabel} calendar`}
    >
      <table className="w-full table-fixed border-collapse">
        <caption className="bg-sage/70 px-4 py-2.5 font-display text-base font-bold text-ink">
          {monthLabel}
        </caption>
        <thead>
          <tr>
            {weekdays.map(([full, short]) => (
              <th
                key={full}
                scope="col"
                className="h-10 text-center text-xs font-bold text-ink/60"
              >
                <abbr title={full} className="no-underline">
                  {short}
                </abbr>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week) => (
            <tr key={format(week[0], "yyyy-MM-dd")}>
              {week.map((day) => {
                const isResult = isSameDay(day, resultDate);
                const isCurrentMonth = isSameMonth(day, resultDate);

                return (
                  <td
                    key={format(day, "yyyy-MM-dd")}
                    className="h-10 p-0 text-center text-sm"
                  >
                    <time
                      dateTime={format(day, "yyyy-MM-dd")}
                      aria-current={isResult ? "date" : undefined}
                      className={`mx-auto grid h-9 w-9 place-items-center rounded-full ${
                        isResult
                          ? "bg-lime font-extrabold text-ink ring-2 ring-ink"
                          : isCurrentMonth
                            ? "font-semibold text-ink/80"
                            : "text-ink/35"
                      }`}
                    >
                      {format(day, "d")}
                    </time>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function DateComparison({
  label,
  date,
  includesTime,
}: {
  label: string;
  date: Date;
  includesTime: boolean;
}) {
  return (
    <section
      className="rounded-2xl border border-ink/10 bg-mist/70 p-5 text-center"
      aria-label={`${label}: ${formatLongDate(date, includesTime)}`}
    >
      <h3 className="text-xs font-extrabold uppercase tracking-[0.16em] text-fern">
        {label}
      </h3>
      <p className="mt-4 font-display text-xl font-bold text-ink">
        {format(date, "EEEE")}
      </p>
      <p className="mt-1 font-display text-3xl font-extrabold tracking-[-0.03em] text-ink">
        {format(date, "MMMM d")}
      </p>
      <p className="mt-1 font-display text-2xl font-bold text-ink/60">
        {format(date, "yyyy")}
      </p>
      {includesTime && (
        <time
          dateTime={format(date, "HH:mm")}
          className="mt-3 inline-block rounded-full bg-white px-3 py-1 text-sm font-bold text-fern"
        >
          {format(date, "h:mm a")}
        </time>
      )}
    </section>
  );
}
