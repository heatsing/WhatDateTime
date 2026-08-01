import { addHours, differenceInMinutes } from "date-fns";
import { formatInTimeZone, toZonedTime } from "date-fns-tz";
import type { SEOPage } from "@/lib/seoGenerator";

type LocalMoment = {
  time: string;
  fullDate: string;
  shortDate: string;
  dateKey: string;
  abbreviation: string;
  offset: string;
};

function getLocalMoment(instant: Date, timeZone: string): LocalMoment {
  const rawOffset = formatInTimeZone(instant, timeZone, "xxx");

  return {
    time: formatInTimeZone(instant, timeZone, "h:mm a"),
    fullDate: formatInTimeZone(instant, timeZone, "EEEE, MMMM d, yyyy"),
    shortDate: formatInTimeZone(instant, timeZone, "EEE, MMM d"),
    dateKey: formatInTimeZone(instant, timeZone, "yyyy-MM-dd"),
    abbreviation: formatInTimeZone(instant, timeZone, "zzz"),
    offset: rawOffset === "Z" ? "UTC+00:00" : `UTC${rawOffset}`,
  };
}

function formatDifference(totalMinutes: number) {
  const sign = totalMinutes < 0 ? "-" : "+";
  const absoluteMinutes = Math.abs(totalMinutes);
  const hours = Math.floor(absoluteMinutes / 60);
  const minutes = absoluteMinutes % 60;

  return `${sign}${hours}h${minutes > 0 ? ` ${minutes}m` : ""}`;
}

function getDayRelation(originDate: string, destinationDate: string) {
  if (destinationDate === originDate) return "same day";
  return destinationDate < originDate ? "previous day" : "next day";
}

function CityCard({
  label,
  city,
  moment,
}: {
  label: "Origin" | "Destination";
  city: string;
  moment: LocalMoment;
}) {
  return (
    <article className="flex min-h-56 flex-col justify-between rounded-lg border border-[#D9DEE5] bg-white p-5 sm:p-6">
      <div>
        <p className="text-xs font-semibold text-fern">
          {label}
        </p>
        <h3 className="mt-1 font-display text-xl font-semibold text-ink sm:text-2xl">
          {city}
        </h3>
      </div>

      <div className="mt-8">
        <p className="font-display text-4xl font-bold tracking-[-0.035em] text-ink">
          {moment.time}
        </p>
        <p className="mt-2 text-sm font-medium text-ink/65">
          {moment.fullDate}
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-bold">
          <span className="rounded-md border border-[#D9DEE5] bg-mist px-2.5 py-1 text-fern">
            {moment.abbreviation}
          </span>
          <span className="rounded-md border border-[#D9DEE5] bg-mist px-2.5 py-1 text-ink/65">
            {moment.offset}
          </span>
        </div>
      </div>
    </article>
  );
}

export function TimezoneComparison({
  page,
  referenceDate,
}: {
  page: Extract<SEOPage, { kind: "timezone" }>;
  referenceDate: Date;
}) {
  const origin = getLocalMoment(referenceDate, page.fromZone);
  const destination = getLocalMoment(referenceDate, page.toZone);
  const offsetDifference = differenceInMinutes(
    toZonedTime(referenceDate, page.toZone),
    toZonedTime(referenceDate, page.fromZone),
  );
  const dayRelation = getDayRelation(origin.dateKey, destination.dateKey);
  const nearbyHours = [-2, -1, 0, 1, 2] as const;

  return (
    <section
      data-content-stage="direct-answer"
      aria-labelledby="timezone-comparison-title"
      className="rounded-xl border border-[#C8D0D8] bg-white p-5 sm:p-7"
    >
      <div className="max-w-2xl">
        <p className="text-sm font-semibold text-fern">
          Time comparison
        </p>
        <h2
          id="timezone-comparison-title"
          className="mt-2 font-display text-2xl font-semibold tracking-[-0.02em] text-ink sm:text-3xl"
        >
          The same moment in both cities
        </h2>
        <p className="mt-4 font-display text-xl font-semibold leading-snug text-ink sm:text-2xl">
          {origin.time} in {page.fromCity} is {destination.time} in {page.toCity}.
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 md:gap-6">
        <div className="md:col-start-1 md:row-start-2">
          <CityCard label="Origin" city={page.fromCity} moment={origin} />
        </div>

        <div className="mx-auto flex w-fit items-center rounded-md border border-[#B8CCE0] bg-[#E7F0F8] px-3 py-1.5 text-xs font-semibold text-fern md:col-span-2 md:row-start-1">
          <span>{formatDifference(offsetDifference)}</span>
          <span className="mx-2 text-ink/35" aria-hidden="true">
            / 
          </span>
          <span>{dayRelation}</span>
        </div>

        <div className="md:col-start-2 md:row-start-2">
          <CityCard
            label="Destination"
            city={page.toCity}
            moment={destination}
          />
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-[#D9DEE5] bg-white">
        <div className="border-b border-ink/10 px-5 py-4 sm:px-6">
          <h3 className="font-display text-lg font-extrabold text-ink">
            Nearby times
          </h3>
          <p className="mt-1 text-sm text-ink/55">
            Compare the two cities around the selected moment.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[34rem] border-collapse text-left">
            <caption className="sr-only">
              Nearby time comparison for {page.fromCity} and {page.toCity}
            </caption>
            <thead>
              <tr className="border-b border-ink/10 text-xs font-bold uppercase tracking-[0.14em] text-fern">
                <th scope="col" className="w-28 px-5 py-3 sm:px-6">
                  Moment
                </th>
                <th scope="col" className="px-5 py-3 sm:px-6">
                  {page.fromCity}
                </th>
                <th scope="col" className="px-5 py-3 sm:px-6">
                  {page.toCity}
                </th>
              </tr>
            </thead>
            <tbody>
              {nearbyHours.map((hourDelta) => {
                const instant = addHours(referenceDate, hourDelta);
                const nearbyOrigin = getLocalMoment(instant, page.fromZone);
                const nearbyDestination = getLocalMoment(instant, page.toZone);
                const datesDiffer =
                  nearbyOrigin.dateKey !== nearbyDestination.dateKey ||
                  nearbyOrigin.dateKey !== origin.dateKey ||
                  nearbyDestination.dateKey !== destination.dateKey;
                const isSelected = hourDelta === 0;

                return (
                  <tr
                    key={hourDelta}
                    aria-current={isSelected ? "true" : undefined}
                    className={
                      isSelected
                        ? "bg-[#E7F0F8] text-ink"
                        : "border-t border-ink/10 text-ink"
                    }
                  >
                    <th
                      scope="row"
                      className="whitespace-nowrap px-5 py-4 text-xs font-extrabold uppercase tracking-[0.1em] sm:px-6"
                    >
                      {isSelected
                        ? "Selected"
                        : `${hourDelta > 0 ? "+" : ""}${hourDelta}h`}
                    </th>
                    <td className="px-5 py-4 sm:px-6">
                      <time
                        dateTime={instant.toISOString()}
                        className="font-display text-lg font-extrabold"
                      >
                        {nearbyOrigin.time}
                      </time>
                      {datesDiffer && (
                        <span className="mt-0.5 block text-xs font-medium text-ink/55">
                          {nearbyOrigin.shortDate}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 sm:px-6">
                      <time
                        dateTime={instant.toISOString()}
                        className="font-display text-lg font-extrabold"
                      >
                        {nearbyDestination.time}
                      </time>
                      {datesDiffer && (
                        <span className="mt-0.5 block text-xs font-medium text-ink/55">
                          {nearbyDestination.shortDate}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
