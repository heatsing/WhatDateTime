import { useEffect, useMemo, useState } from "react";
import type { City } from "../lib/indexEligibility";
import { cities } from "../lib/indexEligibility";
import {
  businessOverlap,
  cityFAQs,
  citySeason,
  conversionTable,
  dateShift,
  differenceLabel,
  displayDate,
  displayTime,
  durationLabel,
  localISO,
  offsetMinutes,
  pairFAQs,
  pairSeasons,
  resolveWallTime,
  utcLabel,
} from "../lib/timezoneFacts";
import { FAQ } from "./FAQ";
import { Breadcrumb } from "./Breadcrumb";
import { JsonLd } from "./json-ld";
import {
  breadcrumbListSchema,
  calculatorApplicationSchema,
  faqPageSchema,
} from "../lib/schema";

export type ZoneExperienceProps = {
  from: City;
  to?: City;
  initialTime: string;
  title: string;
  description: string;
  path: string;
  related: { path: string; label: string }[];
  directoryPath?: string;
};
const panel = "rounded-sm border border-[#d8e1ed] bg-white p-5 sm:p-6";
const heading = "font-display text-2xl font-bold text-[#10264b]";
const anchor = "text-[#006cff] underline underline-offset-2";
const cell = "border-b border-[#d8e1ed] px-3 py-2 text-left";
function Clock({ city, now }: { city: City; now: Date }) {
  return (
    <div>
      <a className={anchor} href={`/time/${city.slug}`}>
        {city.name}
      </a>
      <p className="mt-2 text-3xl font-bold tabular-nums text-[#10264b]">
        {displayTime(now, city.zone)}
      </p>
      <p>{displayDate(now, city.zone)}</p>
      <p className="text-sm text-[#536b8d]">
        {city.zone} · {utcLabel(offsetMinutes(now, city.zone))}
      </p>
    </div>
  );
}
function Links({ links }: { links: { path: string; label: string }[] }) {
  return (
    <ul className="mt-4 grid gap-3 sm:grid-cols-2">
      {links.map((link) => (
        <li key={link.path}>
          <a className={anchor} href={link.path}>
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  );
}
export function TimezoneExperience(props: ZoneExperienceProps) {
  const { from, to, title, description, path, related, directoryPath } = props;
  const [now, setNow] = useState(() => new Date(props.initialTime));
  const [live, setLive] = useState(false);
  const [selected, setSelected] = useState("");
  useEffect(() => {
    const update = () => {
      setNow(new Date());
      setLive(true);
    };
    update();
    const timer = setInterval(update, 30000);
    window.addEventListener("focus", update);
    document.addEventListener("visibilitychange", update);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", update);
      document.removeEventListener("visibilitychange", update);
    };
  }, []);
  const date = localISO(now, from.zone).slice(0, 10);
  const local = selected || `${date}T09:00`;
  const selectedDate = local.slice(0, 10);
  const faqs = to ? pairFAQs(from, to, now) : cityFAQs(from, now);
  const season = citySeason(from, now);
  const table = useMemo(
    () => (to ? conversionTable(selectedDate, from.zone, to.zone) : []),
    [selectedDate, from.zone, to?.zone],
  );
  const overlap = useMemo(
    () => (to ? businessOverlap(selectedDate, from.zone, to.zone) : []),
    [selectedDate, from.zone, to?.zone],
  );
  const instants = to ? resolveWallTime(local, from.zone) : [];
  const nine = resolveWallTime(`${date}T09:00`, from.zone)[0];
  const periods = to ? pairSeasons(from, to, Number(date.slice(0, 4))) : [];
  const targets = cities
    .filter((c) => c.slug !== from.slug)
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 3);
  const siblings = cities
    .filter(
      (c) =>
        c.slug !== from.slug &&
        (c.country === from.country || c.zone === from.zone),
    )
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 6);
  const parent = to
    ? { name: `Time in ${from.name}`, path: `/time/${from.slug}` }
    : { name: "World Clock", path: "/time" };
  return (
    <div
      data-clock-ready={live}
      className="bg-[#f8fbfe] px-4 pb-14 pt-5 sm:px-6 lg:px-10 xl:px-14"
    >
      <div className="mx-auto max-w-[90rem] space-y-6">
        <JsonLd
          data={[
            calculatorApplicationSchema({
              name: title,
              description,
              path,
              dateModified: "2026-09-26",
            }),
            breadcrumbListSchema([
              { name: "Home", path: "/" },
              parent,
              { name: title, path },
            ]),
            faqPageSchema(faqs),
          ]}
        />
        <Breadcrumb current={title} parent={parent} />
        <header>
          <h1 className="font-display text-[34px] font-bold leading-tight tracking-[-0.035em] text-[#0c2146] sm:text-[42px]">
            {title}
          </h1>
          <p className="mt-2 text-base leading-7 text-[#405776]">
            {description}
          </p>
          <p className="mt-2 text-sm text-[#536b8d]">
            {live
              ? "Live clock — based on your device clock."
              : "HTML snapshot — enable JavaScript for live clocks."}{" "}
            As of{" "}
            {now
              .toISOString()
              .replace("T", " ")
              .replace(/\.\d+Z/, " UTC")}
            .
          </p>
        </header>
        {to ? (
          <>
            <section className={panel} data-timezone-answer>
              <h2 className={heading}>9 AM in {from.name}</h2>
              <p className="mt-3 text-2xl font-semibold">
                {nine
                  ? `On ${date}, 9:00 AM in ${from.name} is ${displayTime(nine, to.zone)} in ${to.name} (${dateShift(date, nine, to.zone)}).`
                  : "This local time does not occur on this date."}
              </p>
              <p className="mt-3">
                {differenceLabel(
                  offsetMinutes(now, to.zone) - offsetMinutes(now, from.zone),
                  from.name,
                  to.name,
                )}
              </p>
              <p className="mt-2 text-sm">
                Conversion: {utcLabel(offsetMinutes(now, to.zone))} − (
                {utcLabel(offsetMinutes(now, from.zone))}) ={" "}
                {durationLabel(
                  offsetMinutes(now, to.zone) - offsetMinutes(now, from.zone),
                )}{" "}
                {offsetMinutes(now, to.zone) >= offsetMinutes(now, from.zone)
                  ? "ahead"
                  : "behind"}{" "}
                at the current instant.
              </p>
            </section>
            <section
              className={`${panel} grid gap-6 sm:grid-cols-2`}
              aria-label="Current city times"
            >
              <Clock city={from} now={now} />
              <Clock city={to} now={now} />
            </section>
            <section className={panel}>
              <h2 className={heading}>Meeting planner</h2>
              <label
                className="mt-4 block font-semibold"
                htmlFor="meeting-local"
              >
                Date and time in {from.name}
              </label>
              <input
                id="meeting-local"
                type="datetime-local"
                min="1900-01-01T00:00"
                max="2100-12-31T23:59"
                className="mt-2 h-[52px] max-w-full rounded-md border border-[#C8D0D8] bg-white px-4 text-base text-ink"
                value={local}
                onChange={(e) => setSelected(e.target.value)}
              />
              <button
                className="ml-3 min-h-11 text-[#006cff] underline"
                onClick={() => setSelected("")}
              >
                Reset to today at 9 AM
              </button>
              <div className="mt-4" aria-live="polite">
                {instants.length === 0 ? (
                  <p role="alert">
                    This local time is invalid or skipped by a clock change.
                    Choose another time.
                  </p>
                ) : (
                  instants.map((instant, i) => (
                    <p key={instant.toISOString()}>
                      {instants.length > 1
                        ? `Occurrence ${i + 1} (${utcLabel(offsetMinutes(instant, from.zone))}): `
                        : ""}
                      {displayTime(instant, to.zone)},{" "}
                      {displayDate(instant, to.zone)} in {to.name} ·{" "}
                      {utcLabel(offsetMinutes(instant, to.zone))}
                    </p>
                  ))
                )}
              </div>
            </section>
            <section className={panel}>
              <h2 className={heading}>24-hour conversion table</h2>
              <p className="mt-2">
                {selectedDate} in {from.name}. Repeated local hours show both
                UTC offsets; skipped hours have no matching instant.
              </p>
              <div className="mt-4 overflow-x-auto">
                <table
                  className="w-full border-collapse text-base"
                  data-conversion-table
                >
                  <caption className="sr-only">
                    {from.name} to {to.name}, {selectedDate}
                  </caption>
                  <thead className="bg-[#eef5fc]">
                    <tr>
                      <th scope="col" className={cell}>
                        {from.name}
                      </th>
                      <th scope="col" className={cell}>
                        {to.name}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {table.map((row) => (
                      <tr key={row.local}>
                        <th scope="row" className={`${cell} font-normal`}>
                          {row.label}
                        </th>
                        <td className={cell}>
                          {row.values.length
                            ? row.values.map((value, i) => (
                                <div key={value.iso}>
                                  {value.time} — {value.shift}
                                  {row.values.length > 1
                                    ? ` (source ${value.sourceOffset}, occurrence ${i + 1})`
                                    : ""}
                                </div>
                              ))
                            : "Skipped by a clock change"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
            <section className={panel}>
              <h2 className={heading}>Working-hours overlap</h2>
              <p className="mt-2">
                Monday–Friday, 9 AM–5 PM in each city. Public holidays and
                individual schedules are not included.
              </p>
              {overlap.length ? (
                overlap.map((w) => (
                  <p className="mt-3 font-semibold" key={w.start}>
                    {displayTime(new Date(w.start), from.zone)}–
                    {displayTime(new Date(w.end), from.zone)} {from.name} ={" "}
                    {displayTime(new Date(w.start), to.zone)}–
                    {displayTime(new Date(w.end), to.zone)} {to.name} (
                    {displayDate(new Date(w.start), to.zone)}).
                  </p>
                ))
              ) : (
                <p className="mt-3 font-semibold">
                  No overlapping office-hours window for {selectedDate}. Try
                  another date or agree on a time outside normal working hours.
                </p>
              )}
            </section>
            <section className={panel}>
              <h2 className={heading}>
                Clock changes and seasonal differences
              </h2>
              <p className="mt-2">
                {from.name}: {season.status} {to.name}:{" "}
                {citySeason(to, now).status}
              </p>
              <p className="mt-2">
                {season.standard !== null &&
                citySeason(to, now).standard !== null
                  ? `Standard-offset comparison: ${differenceLabel(citySeason(to, now).standard! - season.standard, from.name, to.name)} This compares standard offsets, not necessarily simultaneous seasons.`
                  : "Seasonal adjustments are listed below without assuming that the smaller offset is legally standard time."}
              </p>
              <p className="mt-2">
                {periods.length > 1
                  ? "The gap changes when the cities switch clocks on different dates."
                  : "The offset difference is constant for this calendar year under the available rules."}{" "}
                Period boundaries below are in UTC; the end is exclusive.
              </p>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th scope="col" className={cell}>
                        UTC period
                      </th>
                      <th scope="col" className={cell}>
                        {to.name} relative to {from.name}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {periods.map((p) => (
                      <tr key={p.start}>
                        <td className={cell}>
                          {p.start.replace("T", " ").replace(".000Z", "")} →{" "}
                          {p.end.replace("T", " ").replace(".000Z", "")}
                        </td>
                        <td className={cell}>
                          {differenceLabel(p.minutes, from.name, to.name)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        ) : (
          <>
            <section className={panel} data-timezone-answer>
              <Clock city={from} now={now} />
            </section>
            <section className={panel}>
              <h2 className={heading}>Time zone and daylight saving</h2>
              <p className="mt-3">{season.status}</p>
              <p className="mt-2">
                Current offset: {utcLabel(season.current)}.{" "}
                {season.standard !== null
                  ? `Standard offset: ${utcLabel(season.standard)}. ${season.daylight !== null ? `Daylight offset: ${utcLabel(season.daylight)}.` : "No separate daylight offset this year."}`
                  : "Seasonal offsets: " +
                    season.offsets.map(utcLabel).join(", ") +
                    "."}
              </p>
              <p className="mt-2">{cityFAQs(from, now)[3].answer}</p>
            </section>
            <section className={panel}>
              <h2 className={heading}>Compare current city times</h2>
              <div className="mt-4 grid gap-6 md:grid-cols-3">
                {targets.map((city) => (
                  <Clock key={city.slug} city={city} now={now} />
                ))}
              </div>
            </section>
            <section className={panel}>
              <h2 className={heading}>9 AM–5 PM in {from.name}</h2>
              <p className="mt-2">
                Wall-clock conversions for {date}; this does not imply that
                today is a working day.
              </p>
              <ul className="mt-4 space-y-3">
                {targets.map((city) => {
                  const start = resolveWallTime(`${date}T09:00`, from.zone)[0],
                    end = resolveWallTime(`${date}T17:00`, from.zone)[0];
                  return (
                    <li key={city.slug}>
                      {city.name}:{" "}
                      {start && end
                        ? `${displayTime(start, city.zone)} (${dateShift(date, start, city.zone)}) – ${displayTime(end, city.zone)} (${dateShift(date, end, city.zone)})`
                        : "No valid local time range"}
                    </li>
                  );
                })}
              </ul>
            </section>
          </>
        )}
        <section className={panel}>
          <h2 className={heading}>
            {to ? "Related conversions" : "Popular time conversions"}
          </h2>
          <Links links={related} />
          {directoryPath && (
            <p className="mt-4">
              <a className={anchor} href={directoryPath}>
                Browse all curated {from.name} conversions
              </a>
            </p>
          )}
          <p className="mt-4">
            <a className={anchor} href="/calculators/timezone-converter">
              Convert any supported time zone
            </a>
            {to && (
              <>
                {" "}
                ·{" "}
                <a className={anchor} href={`/time/${to.slug}`}>
                  {to.name} city hub
                </a>
              </>
            )}
          </p>
        </section>
        {!to && siblings.length > 0 && (
          <section className={panel}>
            <h2 className={heading}>Cities in the same country or time zone</h2>
            <Links
              links={siblings.map((c) => ({
                path: `/time/${c.slug}`,
                label: c.name,
              }))}
            />
          </section>
        )}
        <FAQ faqs={faqs} />
        <p className="text-sm text-[#536b8d]">
          Rules come from the runtime’s IANA time-zone data via Intl. Future
          government changes may require a runtime update.{" "}
          <a className={anchor} href="/data-sources">
            Data sources
          </a>
          . No appointments or personal availability are stored.
        </p>
      </div>
    </div>
  );
}
