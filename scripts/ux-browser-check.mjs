// Optional real-browser regression suite. Requires the agent-browser CLI and local Wrangler.
// No production requests or analytics events leave the isolated test session.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const binary =
  process.env.AGENT_BROWSER_BINARY ||
  (process.platform === "win32"
    ? path.join(
        process.env.APPDATA,
        "npm/node_modules/agent-browser/bin/agent-browser-win32-x64.exe",
      )
    : "agent-browser");
const origin = process.env.UX_TEST_ORIGIN || "http://127.0.0.1:8790";
if (!["localhost", "127.0.0.1"].includes(new URL(origin).hostname))
  throw new Error("Use a local preview for interaction tests.");
const session = "wdt-ux-regression";
const run = (...args) =>
  execFileSync(binary, ["--session", session, ...args], {
    encoding: "utf8",
    timeout: 60000,
  }).trim();
const results = [];
const helpers = `
  const pause = () => new Promise(resolve => setTimeout(resolve, 40));
  const check = (value, message) => { if (!value) throw new Error(message); };
  const set = async (id, value) => {
    const el = document.getElementById(id); check(el, 'Missing field '+id);
    const proto = el.tagName === 'SELECT' ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto,'value').set.call(el,value);
    el.dispatchEvent(new Event(el.tagName === 'SELECT' ? 'change' : 'input',{bubbles:true})); await pause();
  };
  const click = async label => {
    const el = [...document.querySelectorAll('button')].find(el=>el.textContent.trim()===label);
    check(el,'Missing button '+label); el.click(); await pause();
  };
  const text = selector => document.querySelector(selector)?.textContent || '';
  Object.defineProperty(navigator,'clipboard',{value:{writeText:async value=>window.__copied=value},configurable:true});
`;
const evaluate = (code) =>
  run(
    "eval",
    "-b",
    Buffer.from(`(async()=>{${helpers}\n${code}})()`).toString("base64"),
  );
function open(slug) {
  run("open", origin + slug);
  run(
    "wait",
    "--fn",
    "document.querySelectorAll('astro-island[ssr]').length === 0",
  );
}
function test(name, code) {
  const value = evaluate(code);
  results.push({ name, result: JSON.parse(value) });
  console.log(name + ": " + value);
}
try {
  // On Windows the newly started daemon can retain captured stdout handles.
  execFileSync(binary, ["--session", session, "open", "about:blank"], {
    stdio: "ignore",
    timeout: 60000,
  });
  run("network", "route", "**/gtag/js*", "--abort");
  open("/8-hours-from-now");
  test(
    "Hour result, formula, midpoint, copy, invalid input and reset",
    `
    window.__events=[]; window.gtag=(...event)=>window.__events.push(event);
    await set('seo-date','2028-02-28T23:30'); await set('seo-amount','2');
    check(text('[data-content-stage="direct-answer"]').includes('1:30 AM'),'Main answer did not follow input');
    check(text('[aria-labelledby="hour-timeline-heading"]').includes('12:30 AM'),'Midpoint must be 00:30');
    await click('Copy answer'); check(window.__copied.includes('February 29, 2028'),'Copied date mismatch');
    check(window.__copied.includes('+ 2 hours'),'Copied formula mismatch');
    const before=text('[data-content-stage="direct-answer"]');
    const amount=document.getElementById('seo-amount');amount.focus();
    const clock=Date.now;Date.now=()=>clock()+3600000;window.dispatchEvent(new Event('focus'));await pause();
    check(text('[data-content-stage="direct-answer"]')===before,'Custom answer changed on tick');
    check(document.activeElement===amount,'Refresh stole focus');Date.now=clock;
    await set('seo-amount','1.5');check(text('[data-content-stage="direct-answer"]').includes('1:00 AM'),'Fractional hours truncated');
    await set('seo-unit','day');check(text('#offset-error').length>0,'Fractional days accepted');
    check(text('[data-content-stage="direct-answer"]').includes('Last valid result'),'Invalid input not labeled');
    await set('seo-amount','');check(document.getElementById('seo-amount').value==='','Blank converted to zero');
    await set('seo-amount','0');check(text('[data-content-stage="direct-answer"]').includes('Monday, February 28, 2028'),'Zero failed');
    await set('seo-amount','10001');check(text('#offset-error').length>0,'Range not enforced');
    await click('Reset to current time');
    check(document.querySelector('[data-mode="live"]'),'Reset failed to resume live clock');
    check(document.getElementById('seo-amount').value==='8' && document.getElementById('seo-unit').value==='hour','Reset did not restore defaults');
    check(window.__events.filter(e=>e[0]==='event').length===1,'Automatic preview/refresh emitted analytics');
    return 'passed';
  `,
  );
  run("focus", "#seo-amount");
  run("press", "Enter");
  test(
    "Keyboard calculation",
    `check(window.__events.filter(e=>e[0]==='event').length===2,'Keyboard submit not recorded');return 'passed';`,
  );
  run("focus", '[data-content-stage="direct-answer"] button');
  run("press", "Enter");
  test(
    "Keyboard copy and recommendation deduplication",
    `
    check(window.__events.filter(e=>e[0]==='event').length===3,'Keyboard copy failed');
    check(!document.body.textContent.includes('More Time Questions'),'Duplicate hour group remains');
    return 'passed';
  `,
  );
  open("/35-business-days-from-today");
  test(
    "Business-day calendar and nearby results",
    `
    await set('seo-date','2026-11-13T12:00');await set('seo-amount','1');
    check(text('[data-content-stage="direct-answer"]').includes('Monday, November 16, 2026'),'Weekend skip failed');
    check(document.querySelector('time[aria-current="date"]').getAttribute('datetime')==='2026-11-16','Calendar mismatch');
    check(document.querySelector('[data-content-stage="nearby-results"] [aria-current="page"]').closest('tr').textContent.includes('November 16'),'Nearby current row mismatch');
    await set('seo-amount','0');check(document.querySelector('time[aria-current="date"]').getAttribute('datetime')==='2026-11-13','Zero/start-day rule failed');
    return 'passed';
  `,
  );
  open("/calculators/date-calculator");
  test(
    "Date tool leap day, month end, blank input and reset",
    `
    await set('base-date','2028-01-31');await set('date-amount','1');await set('date-unit','month');
    check(text('#calculator-result').includes('Tuesday, February 29, 2028'),'Month-end clamp failed');
    await set('date-amount','');check(text('#date-input-error').length>0,'Blank amount accepted');
    check(text('#calculator-result').includes('Last valid result'),'Stale result not identified');
    await set('base-date','2028-02-28');await set('date-unit','day');await set('date-amount','1');
    check(text('#calculator-result').includes('Tuesday, February 29, 2028'),'Leap day failed');
    await click('Reset to today');check(document.getElementById('date-amount').value==='10','Date reset failed');return 'passed';
  `,
  );
  open("/calculators/countdown");
  test(
    "Countdown target, display zone, saving, sharing and resume",
    `
    await set('countdown-zone','Asia/Tokyo');await click('Apply display zone');
    await set('countdown-name','Browser regression');await set('countdown-target','2028-02-29T09:30');await click('Start countdown');
    await click('Save target');const saved=JSON.parse(localStorage.getItem('whatdatetime.countdown.v1'));
    check(saved.instant==='2028-02-29T00:30:00.000Z','Saved target shifted');
    await click('Copy share link');check(new URLSearchParams(new URL(window.__copied).hash.slice(1)).get('due')===saved.instant,'Share target shifted');
    await set('countdown-zone','America/Los_Angeles');await click('Apply display zone');
    check(document.getElementById('countdown-target').value==='2028-02-28T16:30','Display conversion wrong');
    await click('Start countdown');await click('Save target');
    check(JSON.parse(localStorage.getItem('whatdatetime.countdown.v1')).instant===saved.instant,'Zone change rescheduled target');
    const seconds=()=>[...document.querySelectorAll('#calculator-result .tabular-nums')].reduce((n,el,i)=>n+Number(el.textContent)*[86400,3600,60,1][i],0);
    await set('countdown-target','');await click('Start countdown');
    check(text('[role="status"]').includes('invalid'),'Empty target not rejected');
    const old=seconds(), clock=Date.now;Date.now=()=>clock()+10800000;document.dispatchEvent(new Event('visibilitychange'));await pause();
    check(Math.abs(old-seconds()-10800)<=1,'Countdown did not catch up after background pause');
    check(document.getElementById('countdown-target').value==='','Resume replaced draft');
    Date.now=clock;window.dispatchEvent(new Event('pageshow'));await pause();
    await click('Restore saved');await click('Copy share link');window.__share=window.__copied;
    return 'passed';
  `,
  );
  const share = JSON.parse(run("eval", "window.__share"));
  evaluate(`localStorage.removeItem('whatdatetime.countdown.v1');return true;`);
  run("open", "about:blank");
  run("open", share);
  run(
    "wait",
    "--fn",
    "document.querySelectorAll('astro-island[ssr]').length === 0",
  );
  test(
    "Fresh share navigation preserves UTC instant",
    `check(text('#calculator-result').includes('2028-02-29T00:30:00.000Z'),'Shared instant changed');return 'passed';`,
  );
  test(
    "Countdown recommendations appear once",
    `check([...document.querySelectorAll('h2')].filter(el=>el.textContent.trim()==='Related Calculators').length===1,'Repeated calculator group');return 'passed';`,
  );
  open("/singapore-to-melbourne-time");
  test(
    "Selected-time conversion and blank input",
    `
    await set('meeting-local','2027-07-15T12:30');
    check(text('[data-timezone-answer]').includes('12:30 PM') && text('[data-timezone-answer]').includes('2:30 PM'),'Primary timezone answer not synchronized');
    await set('meeting-local','');check(document.getElementById('meeting-local').value==='','Blank planner reset to today');
    check(text('[data-timezone-answer]').includes('Enter a valid date'),'Invalid planner has a result');
    await click('Reset to today at 9 AM');return 'passed';
  `,
  );
  open("/london-to-toronto-time");
  test("Planner DST gap and repeated hour", `
    await set('meeting-local','2026-03-29T01:30');
    check(text('[data-timezone-answer]').includes('Skipped'),'Skipped DST hour received a result');
    await set('meeting-local','2026-10-25T01:30');
    check(text('[data-timezone-answer]').includes('Occurrence 1') && text('[data-timezone-answer]').includes('Occurrence 2'),'Repeated DST hour not distinguished');
    return 'passed';
  `);
  open("/calculators/weeks-and-days-ago");
  test(
    "Auxiliary date tools preserve blank drafts and applied conditions",
    `
    const before=text('#calculator-result');await set('ago-weeks','3');
    check(text('#calculator-result')===before,'Unsubmitted draft relabeled an old result');
    await set('ago-weeks','');check(document.getElementById('ago-weeks').value==='','Blank weeks became zero');
    await set('ago-weeks','0');await set('ago-days','0');await click('Find past date');
    check(text('#calculator-result').includes('subtract 0 weeks and 0 additional days'),'Valid zero rejected');return 'passed';
  `,
  );
  for (const [slug, id] of [
    ["days-in-month", "month-year"],
    ["weeks-in-year", "weeks-year"],
    ["calendar", "calendar-year"],
  ]) {
    open("/calculators/" + slug);
    test(
      "Blank year: " + slug,
      `const before=text('#calculator-result');await set('${id}','');check(document.getElementById('${id}').value==='','Year silently became zero');check(!document.getElementById('${id}').checkValidity(),'Empty year accepted');check(text('#calculator-result')===before,'Invalid year altered result');return 'passed';`,
    );
  }
  for (const width of [320, 390, 768, 1440]) {
    run("set", "viewport", String(width), "900");
    for (const slug of [
      "/",
      "/calculations/hours-from-now",
      "/8-hours-from-now",
      "/35-business-days-from-today",
      "/calculators/countdown",
      "/calculators/date-calculator",
      "/singapore-to-melbourne-time",
    ]) {
      open(slug);
      test(
        `No page overflow: ${width}px ${slug}`,
        `check(document.documentElement.scrollWidth<=innerWidth,'Horizontal page overflow: '+document.documentElement.scrollWidth);return 'passed';`,
      );
    }
  }
  const errors = run("errors");
  if (errors && errors !== "[]")
    throw new Error("Browser runtime errors: " + errors);
  fs.mkdirSync("reports", { recursive: true });
  fs.writeFileSync(
    "reports/ux-browser-check.json",
    JSON.stringify(
      { origin, checkedAt: new Date().toISOString(), results },
      null,
      2,
    ) + "\n",
  );
} finally {
  run("close");
}
