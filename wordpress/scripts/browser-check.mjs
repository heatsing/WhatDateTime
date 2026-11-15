import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
const run = promisify(execFile);
const binary = process.env.AGENT_BROWSER_BIN || (process.platform === 'win32' ? join(process.env.APPDATA, 'npm/node_modules/agent-browser/bin/agent-browser-win32-x64.exe') : 'agent-browser');
const base = process.env.WDT_PREVIEW_URL || 'https://darkseagreen-trout-940046.hostingersite.com';
const session = 'whatdatetime-wp-qa';
const records = [];
async function browser(...args) {
  const { stdout } = await run(binary, ['--session', session, '--json', ...args], { maxBuffer: 2 * 1024 * 1024 });
  const data = JSON.parse(stdout);
  if (!data.success) throw new Error(JSON.stringify(data));
  return data.data;
}
async function evaluate(code) { const data = await browser('eval', '-b', Buffer.from(code).toString('base64')); return data.result; }
async function until(code) { await browser('wait', '--fn', code); }
const click = selector => browser('click', selector);
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
await check('mobile and desktop layout', async () => {
  for (const width of [360, 390, 768, 1440]) {
    await browser('set', 'viewport', String(width), '900');
    const dimensions = await evaluate('({page:document.documentElement.scrollWidth, viewport:innerWidth})');
    assert.ok(dimensions.page <= dimensions.viewport, JSON.stringify(dimensions));
  }
  await browser('set', 'viewport', '390', '844');
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
  await click('.site-search summary');
  await fill('[name=q]', '8 hours from now'); await browser('press', 'Enter');
  await until("document.querySelector('[data-search-results] a') !== null");
  assert.equal(await evaluate("Array.from(document.querySelectorAll('[data-search-results] a')).some(a=>a.getAttribute('href')==='/8-hours-from-now')"), true);
  assert.ok(await evaluate('document.documentElement.scrollWidth <= innerWidth'));
  await browser('screenshot', resolve('wordpress/artifacts/home-mobile.png'), '--full');
  await browser('set', 'viewport', '1440', '1000');
  await browser('screenshot', resolve('wordpress/artifacts/home-desktop.png'), '--full');
});
writeFileSync(new URL('../artifacts/browser-results.json', import.meta.url), JSON.stringify({ base, checks: records }, null, 2));
console.log(`${records.length} WordPress browser checks passed.`);
