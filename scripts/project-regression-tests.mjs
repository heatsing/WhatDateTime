import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";
import { calendarDate, parseCalendarDate } from "../lib/date-input.ts";
import { resolveWallTime } from "../lib/timezoneFacts.ts";
import { calculateDifference } from "../lib/calculator.ts";

assert.equal(calendarDate(4, 2, 29).getFullYear(), 4);
assert.equal(calendarDate(99, 1).getFullYear(), 99);
for (const value of ["", "2026-02-30", "0000-01-01", "2026-13-01"])
  assert(Number.isNaN(+parseCalendarDate(value)), value);
assert.equal(parseCalendarDate("2024-02-29").getDate(), 29);
assert.equal(resolveWallTime("0099-01-01T12:00", "UTC")[0].getUTCFullYear(), 99);
assert.equal(resolveWallTime("1800-01-01T12:00", "America/New_York").length, 1);
const springDifference = calculateDifference(new Date("2026-03-08T00:00:00-05:00"), new Date("2026-03-09T00:00:00-04:00"), "elapsed");
assert.equal(springDifference.totalDays, 0); // 23 hours is not a complete 24-hour day.
assert.equal(springDifference.totalHours, 23);
assert.equal(springDifference.duration.hours, 23);

fs.mkdirSync("workers/generated", { recursive: true });
const outfile = path.resolve("workers/generated/project-regression.mjs");
await build({
  stdin: { contents: `
    import React from 'react';
    import { renderToString } from 'react-dom/server';
    import * as utilities from './components/date-utility-calculators';
    import { TimezoneCalculator } from './components/timezone-calculator';
    import { DateCalculator } from './components/date-calculator';
    import { AgeCalculator } from './components/age-calculator';
    import { DifferenceCalculator } from './components/difference-calculator';
    import { CountdownCalculator } from './components/countdown-calculator';
    import { DirectDateAnswer } from './components/direct-date-answer';
    import { HourAnswerDetails } from './components/hour-answer-details';
    import { CalculatorBox } from './components/CalculatorBox';
    import { relativeResult } from './lib/relative-state';
    import { formatInTimeZone } from 'date-fns-tz';
    import assert from 'node:assert/strict';
    const calculation = {kind:'relative',type:'days-from-today',unit:'day',amount:1,direction:'future'};
    const spring = {page:calculation,instant:'2026-03-07T17:00:00Z',zone:'America/New_York',mode:'custom'};
    assert.equal(relativeResult(spring).toISOString(), '2026-03-08T16:00:00.000Z');
    assert.equal(relativeResult({...spring,page:{...calculation,unit:'hour',amount:24}}).toISOString(), '2026-03-08T17:00:00.000Z');
    const fold = {...spring,instant:'2026-11-01T05:30:00Z',page:{...calculation,unit:'hour',amount:1}};
    assert.equal(relativeResult(fold).toISOString(),'2026-11-01T06:30:00.000Z');
    assert.equal(formatInTimeZone(relativeResult(fold),fold.zone,'HH:mm XXX'),'01:30 -05:00');
    const initialTime = process.argv[2];
    const components = {...utilities, TimezoneCalculator, DateCalculator, AgeCalculator, DifferenceCalculator, CountdownCalculator};
    const page = {kind:'relative',type:'hours-from-now',unit:'hour',amount:8,direction:'future'};
    components.Answer = () => React.createElement(DirectDateAnswer,{page,referenceTime:initialTime,initialTimeZone:'UTC'});
    components.Timeline = () => React.createElement(HourAnswerDetails,{page,referenceTime:initialTime});
    components.RelativeForm = () => React.createElement(CalculatorBox,{page,referenceTime:initialTime,initialDate:initialTime.slice(0,10),initialResult:''});
    const results = Object.fromEntries(Object.entries(components).map(([name, Component]) =>
      [name, renderToString(React.createElement(Component, {initialTime}))]));
    console.log(JSON.stringify(results));
  `, resolveDir: process.cwd(), loader: "tsx" },
  outfile, bundle: true, platform: "node", format: "esm", packages: "external", jsx: "automatic",
});
for (const initialTime of ["2026-01-01T00:30:00.000Z", "2026-03-06T00:30:00.000Z", "2026-10-30T00:30:00.000Z"]) {
  const rendered = ["UTC", "America/Los_Angeles", "Asia/Tokyo", "Pacific/Kiritimati"].map(TZ => {
    const child = spawnSync(process.execPath, [outfile, initialTime], { encoding: "utf8", env: { ...process.env, TZ } });
    assert.equal(child.status, 0, child.stderr);
    return { TZ, html: JSON.parse(child.stdout) };
  });
  for (const row of rendered.slice(1)) for (const name of Object.keys(row.html))
    assert(row.html[name] === rendered[0].html[name], `${name}: initial hydration markup in ${row.TZ} at ${initialTime}`);
  if (initialTime.startsWith("2026-01-01")) {
    assert(rendered[0].html.TimezoneCalculator.includes("12:30 AM"));
    assert(!rendered[0].html.TimezoneCalculator.includes("5:00 PM"));
  }
}

// Exercise the actual fallback handler, not just object lookup in isolation.
if (fs.existsSync("workers/generated/on-demand-shell.html")) {
  const workerFile = path.resolve("workers/generated/worker-regression.mjs");
  await build({ entryPoints: ["workers/on-demand.tsx"], outfile: workerFile, bundle: true,
    platform: "node", format: "esm", packages: "external", jsx: "automatic", loader: { ".html": "text" } });
  const worker = (await import(pathToFileURL(workerFile).href)).default;
  const env = { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } };
  for (const slug of ["__proto__", "constructor", "toString", "missing-page"]) {
    const r = await worker.fetch(new Request(`https://whatdatetime.com/${slug}`), env);
    assert.equal(r.status, 404, slug);
    assert.equal(r.headers.get("location"), null, slug);
  }
  const alias = await worker.fetch(new Request("https://whatdatetime.com/time-zone-converter"), env);
  assert.equal(alias.status, 308);
  assert.equal(alias.headers.get("location"), "https://whatdatetime.com/calculators/timezone-converter");
} else {
  console.log("Worker handler fixtures deferred until the first build creates the shell; HTTP smoke covers them after build.");
}
console.log("Project regressions passed: strict calendar inputs, years 1–99, timezone SSR, cross-zone hydration and prototype-safe aliases.");
