import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
const run = promisify(execFile);
const binary = process.env.AGENT_BROWSER_BIN || (process.platform === 'win32' ? join(process.env.APPDATA, 'npm/node_modules/agent-browser/bin/agent-browser-win32-x64.exe') : 'agent-browser');
const base = process.env.WDT_PREVIEW_URL || 'https://darkseagreen-trout-940046.hostingersite.com';
const session = 'whatdatetime-wp-qa';
const proxy = process.env.WDT_HTTP_PROXY || 'http://127.0.0.1:4780';
const records = [];
async function browser(...args) {
  const { stdout } = await run(binary, ['--session', session, '--proxy', proxy, '--json', ...args], { maxBuffer: 2 * 1024 * 1024 });
  const data = JSON.parse(stdout);
  if (!data.success) throw new Error(JSON.stringify(data));
  return data.data;
}
async function evaluate(code) { const data = await browser('eval', '-b', Buffer.from(code).toString('base64')); return data.result; }
async function until(code) { await browser('wait', '--fn', code); }
const click = async selector => {
  // A partially visible mobile button can have its center below the viewport.
  // Bring the entire control into view before dispatching a real pointer click.
  await browser('scrollintoview', selector);
  return browser('click', selector);
};
const fill = (selector, value) => browser('fill', selector, value);
// CDP text insertion cannot fill Chromium's localized segmented datetime widget.
// Set its native value and dispatch the same bubbling input/change events.
const fillDate = (selector, value) => evaluate(`{ const field=document.querySelector(${JSON.stringify(selector)}); field.value=${JSON.stringify(value)}; field.dispatchEvent(new Event('input',{bubbles:true})); field.dispatchEvent(new Event('change',{bubbles:true})); field.value; }`);
const select = (selector, value) => browser('select', selector, value);
async function check(name, fn) { await fn(); records.push(name); console.log(`Browser OK: ${name}`); }
mkdirSync(new URL('../artifacts/', import.meta.url), { recursive: true });
await browser('open', base + '/8-hours-from-now');
await until("document.querySelector('[data-status]').textContent.includes('Live mode')");
await check('custom inputs update answer, formula and calendar', async () => {
  await fillDate('[name=start]', '2026-11-13T23:30');
  await fill('[name=amount]', '2');
  await select('[name=zone]', 'Asia/Shanghai');
  await click('button[type=submit]');
  await until("document.querySelector('[data-answer]').textContent.includes('1:30 AM') && document.querySelector('[data-formula]').textContent.includes('2 hours')");
  const actual = await evaluate("({answer:document.querySelector('[data-answer]').textContent,calendar:document.querySelector('.selected-date time').dateTime, formula:document.querySelector('[data-formula]').textContent})");
  assert.match(actual.answer, /November 14, 2026/); assert.equal(actual.calendar, '2026-11-14');
  const nearby = await evaluate("Array.from(document.querySelectorAll('[data-details] h2')).find(h=>h.textContent==='Nearby calculations').nextElementSibling.nextElementSibling.querySelector('tbody tr').textContent");
  assert.ok(nearby.includes(actual.answer), nearby);
  await evaluate("window.__copied=''; Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async value=>{window.__copied=value}}})");
  await click('[data-copy]');
  assert.equal(await evaluate('window.__copied'), actual.formula);
});
await check('focus/resume does not overwrite custom inputs', async () => {
  await browser('focus', '[name=amount]');
  await evaluate("window.dispatchEvent(new Event('focus')); document.dispatchEvent(new Event('visibilitychange'))");
  assert.equal(await evaluate("document.querySelector('[name=amount]').value"), '2');
  assert.equal(await evaluate("document.activeElement.name"), 'amount');
});
await check('blank input errors and zero is valid', async () => {
  await fill('[name=amount]', '');
  await until("document.querySelector('[data-error]').textContent.length > 0");
  assert.equal(await evaluate("document.querySelector('[data-copy]').disabled"), true);
  await fill('[name=amount]', '0'); await click('button[type=submit]');
  await until("document.querySelector('[data-formula]').textContent.includes('0 hours') && !document.querySelector('[data-copy]').disabled");
  assert.match(await evaluate("document.querySelector('[data-answer]').textContent"), /11:30 PM/);
});
await check('reset restores this URL and current starting point', async () => {
  await click('[data-reset]');
  await until("document.querySelector('[name=amount]').value === '8' && document.querySelector('[data-status]').textContent.includes('Live mode')");
  assert.equal(await evaluate("document.querySelector('[name=direction]').value"), 'future');
});
await check('mobile and desktop layout and typography', async () => {
  for (const width of [320, 360, 390, 768, 1440]) {
    await browser('set', 'viewport', String(width), '900');
    const dimensions = await evaluate(`({
      page:document.documentElement.scrollWidth, viewport:innerWidth,
      body:parseFloat(getComputedStyle(document.body).fontSize),
      heading:parseFloat(getComputedStyle(document.querySelector('h1')).fontSize),
      nav:parseFloat(getComputedStyle(document.querySelector('.nav-group summary')).fontSize),
      inputs:Array.from(document.querySelectorAll('input,select')).filter(el=>el.getClientRects().length).map(el=>parseFloat(getComputedStyle(el).fontSize)),
      buttons:Array.from(document.querySelectorAll('button')).filter(el=>el.getClientRects().length).map(el=>el.getBoundingClientRect().height)
    })`);
    assert.ok(dimensions.page <= dimensions.viewport, JSON.stringify(dimensions));
    assert.equal(dimensions.body, 16);
    assert.equal(dimensions.nav, 15);
    assert.ok(dimensions.heading >= 28 && dimensions.heading <= 36, JSON.stringify(dimensions));
    assert.ok(dimensions.inputs.every(size=>size >= 16), JSON.stringify(dimensions));
    assert.ok(dimensions.buttons.every(height=>height >= 44), JSON.stringify(dimensions));
  }
  await browser('set', 'viewport', '390', '844');
  try {
    await evaluate("document.documentElement.style.fontSize='200%'");
    assert.equal(await evaluate("parseFloat(getComputedStyle(document.body).fontSize)"), 32);
    assert.ok(await evaluate('document.documentElement.scrollWidth <= innerWidth'), 'larger text must reflow without page overflow');
  } finally {
    await evaluate("document.documentElement.style.removeProperty('font-size')");
  }
  await browser('screenshot', resolve('wordpress/artifacts/hour-mobile.png'), '--full');
});
await browser('open', base + '/calculators/countdown');
await until("document.querySelector('[data-status]').textContent.includes('Custom result')");
await check('countdown save/share preserve a UTC instant', async () => {
  await evaluate("Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async value=>{window.__copied=value}}})");
  await fill('[name=name]', 'Migration acceptance');
  await fillDate('[name=target]', '2028-02-29T10:30');
  await click('button[type=submit]');
  await until("!document.querySelector('[data-copy]').disabled && document.querySelector('[data-formula]').textContent.includes('2028')");
  await click('[data-save]');
  const saved = await evaluate("JSON.parse(localStorage.getItem('whatdatetime.countdown.v1'))");
  await select('[name=zone]', 'America/New_York');
  await until("!document.querySelector('[data-copy]').disabled && document.querySelector('[data-formula]').textContent.includes('America/New_York')");
  await click('[data-share]');
  await until("typeof window.__copied === 'string' && window.__copied.includes('#event=')");
  const share = new URL(await evaluate('window.__copied'));
  assert.equal(new URLSearchParams(share.hash.slice(1)).get('due'), saved.instant);
  await browser('open', share.href);
  await until("document.querySelector('[name=name]').value === 'Migration acceptance'");
  await click('[data-save]');
  assert.equal((await evaluate("JSON.parse(localStorage.getItem('whatdatetime.countdown.v1'))")).instant, saved.instant);
  await evaluate("window.__realNow=Date.now; Date.now=()=>window.__realNow()+86400000; window.dispatchEvent(new Event('focus'))");
  const answer = await evaluate("document.querySelector('[data-answer]').textContent");
  const expectedDays = Math.floor(Math.max(0, Math.ceil((Date.parse(saved.instant) - Date.now() - 86400000) / 1000)) / 86400);
  assert.ok(answer.startsWith(expectedDays + ' days'), answer);
  await evaluate('Date.now=window.__realNow');
  await click('[data-clear]');
  await until("document.querySelector('[name=name]').value === 'My event'");
  assert.equal(await evaluate("localStorage.getItem('whatdatetime.countdown.v1')"), null);
  assert.equal(new URL(await evaluate('location.href')).hash, '');
});
await browser('open', base);
await until("document.querySelector('[data-clock-status]').textContent.includes('synchronized')");
await check('homepage clock, format, search and mobile layout', async () => {
  await click('[data-clock-format]');
  assert.doesNotMatch(await evaluate("document.querySelector('[data-clock]').textContent"), /AM|PM/);
  assert.equal(await evaluate("document.querySelector('[data-today-date]').textContent"), await evaluate("document.querySelector('[data-clock-date]').textContent"));
  await click('.nav-group summary');
  assert.equal(await evaluate("document.querySelector('.nav-group').open"), true);
  await browser('press', 'Escape');
  assert.equal(await evaluate("document.querySelector('.nav-group').open"), false);
  await click('.site-search summary');
  await fill('[name=q]', '8 hours from now'); await browser('press', 'Enter');
  await until("document.querySelector('[data-search-results] a') !== null");
  assert.equal(await evaluate("Array.from(document.querySelectorAll('[data-search-results] a')).some(a=>a.getAttribute('href')==='/8-hours-from-now')"), true);
  await click('.site-search summary');
  assert.ok(await evaluate('document.documentElement.scrollWidth <= innerWidth'));
  await browser('screenshot', resolve('wordpress/artifacts/home-mobile.png'), '--full');
  await browser('set', 'viewport', '1440', '1000');
  assert.equal(await evaluate("parseFloat(getComputedStyle(document.querySelector('.clock-value')).fontSize)"), 64);
  await browser('screenshot', resolve('wordpress/artifacts/home-desktop.png'), '--full');
});
await browser('open', base + '/london-to-toronto-time');
await until("document.querySelector('[data-status]').textContent.includes('Live mode')");
await check('selected-date timezone tables, paired clocks and meeting reset', async () => {
  await fillDate('[name=start]', '2026-03-20T14:00');
  await click('button[type=submit]');
  await until("document.querySelector('[data-formula]').textContent.includes('Offset difference: -4 hours')");
  assert.equal(await evaluate("document.querySelectorAll('.paired-times > div').length"), 2);
  assert.equal(await evaluate("document.querySelectorAll('.paired-clocks [data-clock]').length"), 2);
  assert.ok(await evaluate("document.body.textContent.includes('Time difference through the selected year')"));
  await select('[name=fromZone]', 'Asia/Tokyo');
  await select('[name=toZone]', 'Europe/Paris');
  await click('[data-nine-am]');
  await until("document.querySelector('[name=start]').value.endsWith('T09:00') && document.querySelector('[data-status]').textContent.includes('Custom result')");
  assert.equal(await evaluate("document.querySelector('[name=fromZone]').value"), 'Asia/Tokyo');
  assert.equal(await evaluate("document.querySelector('[name=toZone]').value"), 'Europe/Paris');
  for (const width of [360, 390, 768, 1440]) {
    await browser('set', 'viewport', String(width), '900');
    assert.ok(await evaluate('document.documentElement.scrollWidth <= innerWidth'), `timezone width ${width}`);
  }
  await browser('set', 'viewport', '390', '844');
  await browser('screenshot', resolve('wordpress/artifacts/timezone-mobile.png'), '--full');
});
await browser('open', base + '/time/new-york');
await until("document.querySelector('[data-clock-status]').textContent.includes('synchronized')");
await check('city hub comparisons, office hours, facts and FAQs', async () => {
  assert.equal(await evaluate("document.querySelectorAll('[data-comparison-clock]').length"), 3);
  assert.ok(await evaluate("document.querySelector('[data-city-details]').textContent.includes('9 AM–5 PM in New York')"));
  assert.ok(await evaluate("document.querySelector('[data-clock-facts]').textContent.includes('Next clock change')"));
  const count = await evaluate("Array.from(document.scripts).filter(s=>s.type==='application/ld+json').flatMap(s=>JSON.parse(s.textContent)).find(s=>s['@type']==='FAQPage').mainEntity.length");
  assert.equal(count, 4);
  await click('[data-clock-format]');
  assert.doesNotMatch(await evaluate("document.querySelector('[data-comparison-time]').textContent"), /AM|PM/);
  for (const width of [360,390,768,1440]) {
    await browser('set','viewport',String(width),'900');
    assert.ok(await evaluate('document.documentElement.scrollWidth <= innerWidth'));
  }
  await browser('set','viewport','390','844');
  await browser('screenshot',resolve('wordpress/artifacts/city-mobile.png'),'--full');
});
const toolCases = [
  ['date-calculator', {start:'2026-01-31T12:00',amount:'1',unit:'month'}, 'February 28, 2026'],
  ['business-days', {start:'2026-11-13T12:00',amount:'1'}, 'November 16, 2026'],
  ['time-difference', {start:'2026-11-13T23:30',end:'2026-11-14T01:30'}, '2 hours, 0 minutes'],
  ['age-calculator', {birth:'2000-06-15',asof:'2026-06-15'}, '26 years, 0 months, 0 days'],
  ['days-until', {start:'2028-02-28',end:'2028-02-29'}, '1 calendar days'],
  ['day-of-week', {date:'2028-02-29'}, 'Tuesday, February 29, 2028'],
  ['days-in-month', {year:'2028',month:'2'}, '29 days'],
  ['weeks-in-year', {year:'2026'}, '53 ISO weeks'],
  ['calendar', {year:'2028',month:'2'}, 'February 2028'],
  ['half-birthday', {date:'2026-08-31'}, 'February 28, 2027'],
  ['weeks-and-days-ago', {start:'2026-11-13T12:00',weeks:'1',days:'2'}, 'November 4, 2026'],
];
await browser('open', base + '/calculators/timezone-converter');
await until("document.querySelector('[data-status]').textContent.includes('Live mode')");
await check('general tool: timezone-converter', async () => {
  await select('[name=fromZone]', 'America/New_York');
  await select('[name=toZone]', 'Europe/London');
  await fillDate('[name=start]', '2026-03-20T09:00');
  await click('button[type=submit]');
  await until("document.querySelector('[data-answer]').textContent.includes('1:00 PM') && document.querySelector('[data-formula]').textContent.includes('Offset difference: 4 hours')");
});
for (const [slug, fields, expected] of toolCases) {
  await browser('open', base + '/calculators/' + slug);
  await until("document.querySelector('[data-status]').textContent.length > 0");
  await check(`general tool: ${slug}`, async () => {
    for (const [name, value] of Object.entries(fields)) {
      const selector = `[name=${name}]`;
      const tag = await evaluate(`document.querySelector(${JSON.stringify(selector)}).tagName`);
      if (tag === 'SELECT') await select(selector, value);
      else if (/^\d{4}-\d{2}-\d{2}/.test(value)) await fillDate(selector, value);
      else await fill(selector, value);
    }
    await click('button[type=submit]');
    await until(`document.querySelector('[data-answer]').textContent.includes(${JSON.stringify(expected)}) && !document.querySelector('[data-copy]').disabled`);
    assert.equal(await evaluate("document.querySelector('[data-error]').textContent"), '');
    assert.ok(await evaluate('document.documentElement.scrollWidth <= innerWidth'));
  });
}
writeFileSync(new URL('../artifacts/browser-results.json', import.meta.url), JSON.stringify({ base, checks: records }, null, 2));
console.log(`${records.length} WordPress browser checks passed.`);
